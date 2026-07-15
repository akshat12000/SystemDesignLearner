import { Ollama } from "ollama";
import type { EvaluationResult } from "@/types/evaluation";

const ollama = new Ollama({
  host: process.env.OLLAMA_BASE_URL ?? "http://localhost:11434",
});

const FAST_MODEL = process.env.OLLAMA_FAST_MODEL ?? "llama3.2:3b";
const DEEP_MODEL = process.env.OLLAMA_DEEP_MODEL ?? "llama3.1:8b";

const EVALUATION_SCHEMA = {
  type: "object",
  properties: {
    score: { type: "number", minimum: 0, maximum: 100 },
    pass: { type: "boolean" },
    strengths: { type: "array", items: { type: "string" } },
    missingElements: { type: "array", items: { type: "string" } },
    misconceptions: { type: "array", items: { type: "string" } },
    targetedFeedback: { type: "string" },
    hint: { type: ["string", "null"] },
    nextPhaseTeaser: { type: ["string", "null"] },
  },
  required: [
    "score",
    "pass",
    "strengths",
    "missingElements",
    "misconceptions",
    "targetedFeedback",
    "hint",
    "nextPhaseTeaser",
  ],
  additionalProperties: false,
};

export async function evaluateWithOllama(
  systemPrompt: string,
  studentResponse: string,
  passThreshold: number,
  attemptNumber: number,
  useDeepModel = false
): Promise<EvaluationResult> {
  const model = useDeepModel ? DEEP_MODEL : FAST_MODEL;

  const userMessage = `
STUDENT RESPONSE:
${studentResponse.trim()}

ATTEMPT NUMBER: ${attemptNumber}
PASS THRESHOLD: ${passThreshold}/100

${
  attemptNumber >= 3
    ? "This is attempt 3 or higher — provide a helpful hint in the 'hint' field to guide the student."
    : "Set 'hint' to null."
}
`;

  const response = await ollama.chat({
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    format: EVALUATION_SCHEMA as Parameters<typeof ollama.chat>[0]["format"],
    options: {
      temperature: 0.1, // Low temp for consistent evaluation
      num_predict: 1024,
    },
  });

  const raw = JSON.parse(response.message.content) as EvaluationResult;

  // Enforce pass logic based on threshold (don't trust AI to apply threshold correctly)
  return {
    ...raw,
    pass: raw.score >= passThreshold,
  };
}

export async function checkOllamaHealth(): Promise<boolean> {
  try {
    const models = await ollama.list();
    return models.models.length > 0;
  } catch {
    return false;
  }
}
