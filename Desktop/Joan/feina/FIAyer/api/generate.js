import { GoogleGenerativeAI } from "@google/generative-ai";
import { getUserFromAuthHeader } from "./_supabase-admin.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  generationConfig: { responseMimeType: "application/json" },
});

const LANG_INSTRUCTIONS = {
  ca: "Escriu TOT el contingut en català.",
  es: "Escribe TODO el contenido en español.",
  en: "Write ALL content in English.",
};

const AUDIENCE_HINTS = {
  general: "general audience",
  students: "university students",
  companies: "small businesses / B2B",
};

const STYLE_HINTS = {
  modern: "modern and clean, confident tone",
  creative: "creative and eye-catching, playful tone",
  corporate: "corporate and trustworthy, professional tone",
  elegant: "elegant and refined, premium tone",
  luxury: "luxurious and high-end",
  minimal: "minimalist and understated",
  bold: "bold and high-impact",
};

/* ─── Input hardening ─── */
const MAX_PROMPT_LENGTH = 500;
const MAX_BRIEF_LENGTH = 1000;

/* ─── In-memory rate limit ─────────────────────────────────────────────
   Per-user sliding window: RATE_LIMIT_MAX requests per RATE_LIMIT_WINDOW_MS.
   NOTE: Vercel serverless functions may spawn multiple instances, so this
   is a per-instance limit and a *best-effort* defence against casual abuse.
   For stronger guarantees, swap this out for Vercel KV or Upstash Redis. */
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX = 20;                   // 20 generations / hour / user
const rateMap = new Map();

function checkRateLimit(userId) {
  const now = Date.now();
  const recent = (rateMap.get(userId) || []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS
  );
  if (recent.length >= RATE_LIMIT_MAX) {
    const oldest = recent[0];
    const retryAfterSec = Math.max(
      1,
      Math.ceil((RATE_LIMIT_WINDOW_MS - (now - oldest)) / 1000)
    );
    return { limited: true, retryAfterSec };
  }
  recent.push(now);
  rateMap.set(userId, recent);
  return { limited: false };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'Missing GEMINI_API_KEY on the server' });
  }

  /* 1. Authentication ------------------------------------------------- */
  const { user } = await getUserFromAuthHeader(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized. Please sign in.' });
  }

  /* 2. Rate limit ----------------------------------------------------- */
  const rl = checkRateLimit(user.id);
  if (rl.limited) {
    res.setHeader('Retry-After', String(rl.retryAfterSec));
    return res.status(429).json({
      error: 'Too many generations. Please try again later.',
      retryAfterSec: rl.retryAfterSec,
    });
  }

  /* 3. Input validation ---------------------------------------------- */
  const { prompt, lang, style, audience, colorTheme, brief } = req.body || {};
  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    return res.status(400).json({ error: 'Prompt is required' });
  }
  if (prompt.length > MAX_PROMPT_LENGTH) {
    return res.status(400).json({ error: `Prompt too long (max ${MAX_PROMPT_LENGTH} chars)` });
  }
  if (brief && String(brief).length > MAX_BRIEF_LENGTH) {
    return res.status(400).json({ error: `Brief too long (max ${MAX_BRIEF_LENGTH} chars)` });
  }

  const langCode = (lang || 'es').toString().slice(0, 2).toLowerCase();
  const langInstruction = LANG_INSTRUCTIONS[langCode] || LANG_INSTRUCTIONS.es;
  const audienceHint = AUDIENCE_HINTS[audience] || AUDIENCE_HINTS.general;
  const styleHint = STYLE_HINTS[style] || STYLE_HINTS.modern;

  const fullPrompt = `You are an expert copywriter creating print-ready flyer copy.
${langInstruction}

USER IDEA: "${prompt.trim()}"
${brief ? `ADDITIONAL BRIEF: "${String(brief).trim()}"` : ''}
TONE / STYLE: ${styleHint}
TARGET AUDIENCE: ${audienceHint}
COLOR PREFERENCE: ${colorTheme || 'auto'}

Return ONLY a valid JSON object with this EXACT structure (no markdown, no commentary):
{
  "title": "short punchy headline (max 8 words)",
  "subtitle": "one-sentence value proposition (max 18 words)",
  "points": ["benefit 1", "benefit 2", "benefit 3"],
  "cta": "strong call to action (max 6 words)",
  "style": "${style || 'modern'}",
  "colorTheme": "${colorTheme || 'brand'}"
}

RULES:
- "points" MUST be an array of exactly 3 short benefits (max 10 words each).
- Do NOT include the word "flyer" in any field.
- No emojis. No hashtags. No quotation marks inside fields.
- Copy must be professional, persuasive and ready to print.`;

  /* 4. Call the model ------------------------------------------------- */
  try {
    const result = await model.generateContent(fullPrompt);
    let text = result.response.text().trim();

    // Defensive: strip code fences if the model ignores responseMimeType
    if (text.startsWith('```')) {
      text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch (parseErr) {
      console.error('JSON parse error. Raw model output:', text);
      return res.status(502).json({ error: 'AI returned invalid JSON' });
    }

    const safe = {
      title: String(data.title || '').trim(),
      subtitle: String(data.subtitle || '').trim(),
      points: Array.isArray(data.points)
        ? data.points.filter(Boolean).slice(0, 6).map((p) => String(p).trim())
        : [],
      cta: String(data.cta || '').trim(),
      style: data.style || style || 'modern',
      colorTheme: data.colorTheme || colorTheme || 'brand',
    };

    return res.status(200).json(safe);
  } catch (error) {
    console.error('Generate error:', error);
    return res.status(500).json({ error: "AI generation failed", details: error.message });
  }
}
