// Evaluates using the user's own API key via OpenAI-compatible endpoints.
// Groq, OpenAI, and Gemini all support the OpenAI chat completions format.

import type { EvaluationResult } from "@/types/evaluation";

const ENDPOINTS: Record<string, string> = {
  groq: "https://api.groq.com/openai/v1/chat/completions",
  openai: "https://api.openai.com/v1/chat/completions",
  gemini: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
};

const DEFAULT_MODELS: Record<string, string> = {
  groq: "llama-3.1-8b-instant",
  openai: "gpt-4o-mini",
  gemini: "gemini-1.5-flash",
};

export async function evaluateWithUserKey(
  systemPrompt: string,
  studentResponse: string,
  passThreshold: number,
  attemptNumber: number,
  userConfig: { provider: string; apiKey: string; model?: string }
): Promise<EvaluationResult> {
  const endpoint = ENDPOINTS[userConfig.provider];
  if (!endpoint) throw new Error(`Unsupported provider: ${userConfig.provider}`);

  const model = userConfig.model ?? DEFAULT_MODELS[userConfig.provider] ?? "gpt-4o-mini";

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

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${userConfig.apiKey}`,
  };

  const body: Record<string, unknown> = {
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    temperature: 0.1,
    max_tokens: 1024,
    response_format: { type: "json_object" },
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${userConfig.provider} API error ${res.status}: ${text.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    choices: Array<{ message: { content: string } }>;
  };

  const raw = JSON.parse(data.choices[0].message.content) as EvaluationResult;
  return { ...raw, pass: raw.score >= passThreshold };
}
