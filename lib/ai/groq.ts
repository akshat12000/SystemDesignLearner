// Groq fallback — used when Ollama is unavailable
// Uses llama3 models via Groq's free tier API

import type { EvaluationResult } from "@/types/evaluation";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = process.env.GROQ_MODEL ?? "llama-3.1-8b-instant";

export async function evaluateWithGroq(
  systemPrompt: string,
  studentResponse: string,
  passThreshold: number,
  attemptNumber: number
): Promise<EvaluationResult> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY not configured");

  const userMessage = `
STUDENT RESPONSE:
${studentResponse.trim()}

ATTEMPT NUMBER: ${attemptNumber}
PASS THRESHOLD: ${passThreshold}/100

${
  attemptNumber >= 3
    ? "This is attempt 3 or higher — provide a helpful hint in the 'hint' field."
    : "Set 'hint' to null."
}

Respond ONLY with valid JSON matching this schema exactly:
{
  "score": <number 0-100>,
  "pass": <boolean>,
  "strengths": [<string>, ...],
  "missingElements": [<string>, ...],
  "misconceptions": [<string>, ...],
  "targetedFeedback": "<2-3 sentence specific feedback>",
  "hint": <string | null>,
  "nextPhaseTeaser": <string | null>
}
`;

  const res = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature: 0.1,
      max_tokens: 1024,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Groq API error ${res.status}: ${text}`);
  }

  const data = (await res.json()) as {
    choices: Array<{ message: { content: string } }>;
  };

  const raw = JSON.parse(data.choices[0].message.content) as EvaluationResult;

  return {
    ...raw,
    pass: raw.score >= passThreshold,
  };
}
