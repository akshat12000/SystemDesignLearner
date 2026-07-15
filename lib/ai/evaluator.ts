// Main evaluation orchestrator
// Tries Ollama first, falls back to Groq if unavailable

import { checkOllamaHealth, evaluateWithOllama } from "./ollama";
import { evaluateWithGroq } from "./groq";
import type { EvaluationResult } from "@/types/evaluation";

export interface EvaluationInput {
  systemPrompt: string;
  studentResponse: string;
  passThreshold: number;
  attemptNumber: number;
  useDeepModel?: boolean;
}

export interface EvaluationOutput {
  result: EvaluationResult;
  modelUsed: string;
  evaluationMs: number;
}

export async function runEvaluation(
  input: EvaluationInput
): Promise<EvaluationOutput> {
  const start = Date.now();

  // Validate input
  if (!input.studentResponse.trim()) {
    throw new Error("Student response cannot be empty");
  }
  if (input.studentResponse.length > 20000) {
    throw new Error("Response exceeds maximum length of 20,000 characters");
  }

  const useGroqFallback = process.env.AI_USE_GROQ_FALLBACK === "true";

  // Try Ollama first
  const ollamaAvailable = await checkOllamaHealth().catch(() => false);

  if (ollamaAvailable) {
    try {
      const result = await evaluateWithOllama(
        input.systemPrompt,
        input.studentResponse,
        input.passThreshold,
        input.attemptNumber,
        input.useDeepModel
      );
      const modelName = input.useDeepModel
        ? (process.env.OLLAMA_DEEP_MODEL ?? "llama3.1:8b")
        : (process.env.OLLAMA_FAST_MODEL ?? "llama3.2:3b");

      return {
        result,
        modelUsed: `ollama/${modelName}`,
        evaluationMs: Date.now() - start,
      };
    } catch (err) {
      console.error("[evaluator] Ollama evaluation failed:", err);
      if (!useGroqFallback) throw err;
    }
  }

  // Fallback to Groq
  if (!useGroqFallback) {
    throw new Error(
      "Ollama is not available and Groq fallback is disabled. Start Ollama with: ollama serve"
    );
  }

  const result = await evaluateWithGroq(
    input.systemPrompt,
    input.studentResponse,
    input.passThreshold,
    input.attemptNumber
  );

  return {
    result,
    modelUsed: `groq/${process.env.GROQ_MODEL ?? "llama-3.1-8b-instant"}`,
    evaluationMs: Date.now() - start,
  };
}
