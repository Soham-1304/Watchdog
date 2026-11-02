/**
 * Vercel / Netlify Serverless Function: POST /api/score
 * Keeps the Gemini API key secure on the backend.
 */

import { SYSTEM_PROMPT } from '../src/ai/prompts';
import { ScorerInput, ScorerOutput } from '../src/ai/schema';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const payload: ScorerInput = req.body;
  if (!payload || !payload.event_id) {
    return res.status(400).json({ error: 'Missing event payload' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    // Graceful fallback if no API key configured
    const fallback: ScorerOutput = {
      event_id: payload.event_id,
      importance: 8,
      alert: payload.headline.slice(0, 85),
      why: 'Momentum swing detected in game state context.',
      tags: [payload.type],
    };
    return res.status(200).json(fallback);
  }

  try {
    const prompt = `
Event ID: ${payload.event_id}
Sport: ${payload.sport}
Event Type: ${payload.type}
Headline: ${payload.headline}
Actors: ${payload.actors.join(', ')}
State: ${JSON.stringify(payload.state)}

Respond strictly in valid JSON matching this structure:
{
  "event_id": "${payload.event_id}",
  "importance": <integer 1-10>,
  "alert": "<max 90 chars>",
  "why": "<max 140 chars>",
  "novice_note": "<max 120 chars, optional>",
  "tags": ["<tag1>", "<tag2>"]
}
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${SYSTEM_PROMPT}\n\n${prompt}` }],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json',
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API returned ${response.status}`);
    }

    const result = await response.json();
    const candidateText = result.candidates?.[0]?.content?.parts?.[0]?.text;
    const scored: ScorerOutput = JSON.parse(candidateText);

    return res.status(200).json(scored);
  } catch (err: any) {
    console.error('[API Score Error]', err);
    // Graceful fallback
    const fallback: ScorerOutput = {
      event_id: payload.event_id,
      importance: 7,
      alert: payload.headline.slice(0, 85),
      why: 'Key event evaluated during live match stream.',
      tags: [payload.type],
    };
    return res.status(200).json(fallback);
  }
}
