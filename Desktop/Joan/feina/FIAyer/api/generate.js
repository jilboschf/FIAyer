import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ 
  model: "gemini-2.0-flash",
  generationConfig: { responseMimeType: "application/json" }
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { prompt, lang } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

  try {
    const fullPrompt = `Ets un expert copywriter. Genera un JSON per un flyer de: "${prompt}". Idioma: ${lang || 'es'}. 
    Estructura exacta: { "title": "", "subtitle": "", "points": [], "cta": "", "style": "modern", "colorTheme": "brand" }`;

    const result = await model.generateContent(fullPrompt);
    const data = JSON.parse(result.response.text()); // Gemini ja torna JSON pur
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Error de l'IA", details: error.message });
  }
}