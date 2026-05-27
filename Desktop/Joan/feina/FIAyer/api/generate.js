import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import { getUserFromAuthHeader } from "./_supabase-admin.js";

// Tell Vercel this function can run up to 30 seconds
export const config = { maxDuration: 30 };

const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

/* ─── Generate image with DALL-E 2, returns base64 data URL or null ─── */
async function generateFlyerImage(userPrompt, style) {
  if (!openai) return null;
  try {
    const imagePrompt =
      `Professional marketing background photo for an event: "${userPrompt.slice(0, 120)}". ` +
      `Style: ${style || 'modern'}. ` +
      `High quality, vibrant colors, elegant composition. ` +
      `NO text, NO words, NO letters, NO people faces. ` +
      `Suitable as a decorative strip in a print flyer.`;

    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: imagePrompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
    });
    const url = response.data[0].url;

    // Download and encode as base64 so html2canvas can embed it (avoids CORS)
    const imgRes = await fetch(url);
    const buffer = await imgRes.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    return `data:image/png;base64,${base64}`;
  } catch (err) {
    console.error('[generate] DALL-E error (non-fatal):', err.message);
    return null;
  }
}

// Wrap any promise with a hard timeout so Gemini never hangs the function
function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout after ${ms}ms (${label})`)), ms)
    ),
  ]);
}

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

function isSimilarText(text1, text2) {
  // Simple similarity check: if texts are too similar, reject
  const t1 = text1.toLowerCase().trim();
  const t2 = text2.toLowerCase().trim();
  
  // If one contains most of the other, it's too similar
  if (t1.includes(t2) || t2.includes(t1)) return true;
  
  // Count word overlap
  const words1 = new Set(t1.split(/\s+/));
  const words2 = new Set(t2.split(/\s+/));
  const overlap = [...words1].filter(w => words2.has(w)).length;
  const totalWords = Math.max(words1.size, words2.size);
  
  // If more than 70% of words match, too similar
  return overlap / totalWords > 0.7;
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
  "title": "creative marketing headline COMPLETELY DIFFERENT from the user request (max 8 words)",
  "subtitle": "compelling one-sentence benefit (max 18 words)",
  "points": ["benefit 1 (max 10 words)", "benefit 2 (max 10 words)", "benefit 3 (max 10 words)"],
  "cta": "strong call to action (max 6 words)",
  "style": "${style || 'modern'}",
  "colorTheme": "${colorTheme || 'brand'}"
}

Example with user input "Creame una invitacion a una fiesta de aniversario de 18 años":
{"title":"Celebra en Grande","subtitle":"La fiesta que recordarán por siempre","points":["Invitación profesional","Sorprenderá a tus invitados","Memorable y elegante"],"cta":"Invita Ahora","style":"${style || 'modern'}","colorTheme":"${colorTheme || 'brand'}"}

⚠️ FORBIDDEN TITLE PATTERNS:
- If user said "Creame una invitacion..." the title CANNOT be "Creame una invitacion..."
- Do NOT echo back the user's request words
- Title must be marketing copy, not descriptive
- Transform the idea into a creative, compelling headline

RULES:
- "points" MUST be an array of exactly 3 short benefits.
- No emojis. No hashtags. No quotation marks inside fields.
- Copy must be professional, persuasive and ready to print.
- Keep all values in the requested language.
- The title MUST be creative and marketable, never a repetition of the input.
`;

  /* 4. Start DALL-E image generation in parallel (non-blocking) ---------- */
  const imagePromise = generateFlyerImage(prompt, style);

  /* 5. Call the text model -------------------------------------------- */
  try {
    let safe = null;
    let attempts = 0;
    const maxAttempts = 3;

    // Try primary model first, fall back to gemini-2.5-flash on capacity errors
    const MODELS = ["gemini-2.0-flash", "gemini-2.5-flash"];
    let modelIndex = 0;

    const getModel = () => genai.getGenerativeModel({
      model: MODELS[modelIndex],
      generationConfig: { temperature: 0.2, maxOutputTokens: 4096 },
    });

    while (attempts < maxAttempts && !safe) {
      attempts++;
      let response;
      try {
        response = await withTimeout(
          getModel().generateContent(fullPrompt),
          22000,
          MODELS[modelIndex]
        );
      } catch (apiErr) {
        const isTimeout = /timeout/i.test(apiErr?.message || '');
        const is503 = apiErr?.status === 503 || /503|high demand|unavailable/i.test(apiErr?.message || '');
        const is429 = apiErr?.status === 429 || /429|quota/i.test(apiErr?.message || '');
        if (isTimeout) {
          console.error(`[generate] attempt ${attempts}: ${MODELS[modelIndex]} timed out after 22s`);
        }
        if ((is503 || is429) && modelIndex < MODELS.length - 1) {
          modelIndex++;
          console.warn(`Model ${MODELS[modelIndex - 1]} unavailable, switching to ${MODELS[modelIndex]}`);
          attempts--; // don't count this as an attempt
          continue;
        }
        if ((is503 || is429) && attempts < maxAttempts) {
          // Short delay only — avoid eating Vercel's function timeout budget
          await new Promise(r => setTimeout(r, 300));
          continue;
        }
        throw apiErr;
      }

      const text = response.response.text()?.trim();
      if (!text) {
        console.error(`[generate] attempt ${attempts}: Gemini (${MODELS[modelIndex]}) returned empty content`);
        if (attempts < maxAttempts) continue;
        return res.status(500).json({ error: 'AI returned empty response' });
      }

      // Extract JSON: strip markdown fences and any preamble text before the first '{'
      let cleaned = text;
      // Remove ```json ... ``` fences (even if there's preamble before them)
      const fenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/i);
      if (fenceMatch) {
        cleaned = fenceMatch[1].trim();
      } else {
        // No fences — find the first '{' and last '}' to extract raw JSON
        const firstBrace = cleaned.indexOf('{');
        const lastBrace = cleaned.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          cleaned = cleaned.slice(firstBrace, lastBrace + 1);
        }
      }

      let data;
      try {
        data = JSON.parse(cleaned);
      } catch (parseErr) {
        console.error(`[generate] attempt ${attempts}: JSON parse error. Model: ${MODELS[modelIndex]}. Raw output:`, text);
        if (attempts >= maxAttempts) {
          return res.status(500).json({ error: 'AI returned invalid JSON' });
        }
        continue; // Retry
      }

      const candidate = {
        title: String(data.title || '').trim(),
        subtitle: String(data.subtitle || '').trim(),
        points: Array.isArray(data.points)
          ? data.points.filter(Boolean).slice(0, 3).map((p) => String(p).trim())
          : [],
        cta: String(data.cta || '').trim(),
        style: data.style || style || 'modern',
        colorTheme: data.colorTheme || colorTheme || 'brand',
      };

      // Validate: if title is too similar to the user prompt, retry
      if (isSimilarText(candidate.title, prompt)) {
        console.warn(`Attempt ${attempts}: Title too similar to prompt. Title: "${candidate.title}", Prompt: "${prompt}". Retrying...`);
        if (attempts < maxAttempts) {
          continue; // Retry with the same prompt to get a different response
        }
        // If we've exhausted retries, return the candidate anyway with a fallback
        candidate.title = `${styleHint.split(' ')[0]} ${prompt.split(' ')[0]}`.trim();
      }

      safe = candidate;
    }

    if (!safe) {
      console.error('[generate] All attempts exhausted without a valid response');
      return res.status(500).json({ error: 'AI generation failed after retries' });
    }

    // Wait for DALL-E image (it was running in parallel — usually ready by now)
    safe.imageUrl = await imagePromise;

    return res.status(200).json(safe);
  } catch (error) {
    console.error('[generate] Uncaught error:', error?.message, error?.status);
    return res.status(500).json({ error: "AI generation failed", details: error.message });
  }
}
