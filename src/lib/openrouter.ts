import type { AIWordResult } from '../types';

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
const MODEL = import.meta.env.VITE_OPENROUTER_MODEL || 'openrouter/free'; // fast, cheap, capable

interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

async function chatCompletion(messages: OpenRouterMessage[]): Promise<string> {
  const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
      'X-Title': 'VocabVault',
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.4,
      max_tokens: 300,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `OpenRouter error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? '';
}

export async function lookupWord(word: string): Promise<AIWordResult> {
  const systemPrompt = `You are a precise vocabulary assistant. When given a word, respond ONLY with a valid JSON object (no markdown, no explanation) in this exact format:
{
  "meaning": "one-line definition of the word",
  "example": "a natural example sentence using the word",
  "synonyms": ["synonym1", "synonym2", "synonym3"]
}
Keep the meaning concise (under 20 words). Provide 2-3 relevant synonyms.`;

  const userMessage = `Word: ${word.trim()}`;

  const raw = await chatCompletion([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage },
  ]);

  // Strip any accidental markdown fences
  const cleaned = raw.replace(/```json|```/g, '').trim();

  try {
    const parsed = JSON.parse(cleaned) as AIWordResult;
    if (!parsed.meaning || !parsed.example || !Array.isArray(parsed.synonyms)) {
      throw new Error('Invalid response shape');
    }
    return parsed;
  } catch {
    throw new Error('Failed to parse AI response. Please try again.');
  }
}
