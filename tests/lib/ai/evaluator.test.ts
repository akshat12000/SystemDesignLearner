import { describe, it, expect, vi, beforeEach } from "vitest";
import type { EvaluationResult } from "@/types/evaluation";

// Mock both AI backends
vi.mock("@/lib/ai/ollama", () => ({
  checkOllamaHealth: vi.fn(),
  evaluateWithOllama: vi.fn(),
}));

vi.mock("@/lib/ai/groq", () => ({
  evaluateWithGroq: vi.fn(),
}));

import { checkOllamaHealth, evaluateWithOllama } from "@/lib/ai/ollama";
import { evaluateWithGroq } from "@/lib/ai/groq";
import { runEvaluation } from "@/lib/ai/evaluator";

const mockCheckHealth = vi.mocked(checkOllamaHealth);
const mockOllama = vi.mocked(evaluateWithOllama);
const mockGroq = vi.mocked(evaluateWithGroq);

const PASS_RESULT: EvaluationResult = {
  score: 80,
  pass: true,
  strengths: ["Clear requirements"],
  missingElements: [],
  misconceptions: [],
  targetedFeedback: "Well done.",
  hint: null,
  nextPhaseTeaser: "Now identify entities.",
};

const INPUT = {
  systemPrompt: "Evaluate this.",
  studentResponse: "A".repeat(60), // >= 50 chars
  passThreshold: 60,
  attemptNumber: 1,
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
  vi.stubEnv("AI_USE_GROQ_FALLBACK", "true");
});

describe("runEvaluation — input validation", () => {
  it("throws on empty response", async () => {
    await expect(
      runEvaluation({ ...INPUT, studentResponse: "   " })
    ).rejects.toThrow("cannot be empty");
  });

  it("throws when response exceeds 20,000 characters", async () => {
    await expect(
      runEvaluation({ ...INPUT, studentResponse: "x".repeat(20001) })
    ).rejects.toThrow("maximum length");
  });

  it("accepts exactly 20,000 characters", async () => {
    mockCheckHealth.mockResolvedValueOnce(true);
    mockOllama.mockResolvedValueOnce({ ...PASS_RESULT } as EvaluationResult);
    const result = await runEvaluation({
      ...INPUT,
      studentResponse: "x".repeat(20000),
    });
    expect(result.result.score).toBe(80);
  });
});

describe("runEvaluation — Ollama path", () => {
  it("uses Ollama when healthy and returns result with model name", async () => {
    mockCheckHealth.mockResolvedValueOnce(true);
    mockOllama.mockResolvedValueOnce(PASS_RESULT);

    const out = await runEvaluation(INPUT);

    expect(mockOllama).toHaveBeenCalledOnce();
    expect(mockGroq).not.toHaveBeenCalled();
    expect(out.result).toEqual(PASS_RESULT);
    expect(out.modelUsed).toContain("ollama/");
    expect(out.evaluationMs).toBeGreaterThanOrEqual(0);
  });

  it("uses deep model when useDeepModel is true", async () => {
    mockCheckHealth.mockResolvedValueOnce(true);
    mockOllama.mockResolvedValueOnce(PASS_RESULT);

    await runEvaluation({ ...INPUT, useDeepModel: true });

    expect(mockOllama).toHaveBeenCalledWith(
      INPUT.systemPrompt,
      INPUT.studentResponse,
      INPUT.passThreshold,
      INPUT.attemptNumber,
      true
    );
  });

  it("falls back to Groq when Ollama fails and fallback is enabled", async () => {
    mockCheckHealth.mockResolvedValueOnce(true);
    mockOllama.mockRejectedValueOnce(new Error("Ollama crashed"));
    mockGroq.mockResolvedValueOnce(PASS_RESULT);

    const out = await runEvaluation(INPUT);

    expect(mockGroq).toHaveBeenCalledOnce();
    expect(out.modelUsed).toContain("groq/");
  });

  it("throws when Ollama fails and Groq fallback is disabled", async () => {
    vi.stubEnv("AI_USE_GROQ_FALLBACK", "false");
    mockCheckHealth.mockResolvedValueOnce(true);
    mockOllama.mockRejectedValueOnce(new Error("Ollama crashed"));

    await expect(runEvaluation(INPUT)).rejects.toThrow("Ollama crashed");
  });
});

describe("runEvaluation — Groq fallback path", () => {
  it("goes directly to Groq when Ollama is not healthy", async () => {
    mockCheckHealth.mockResolvedValueOnce(false);
    mockGroq.mockResolvedValueOnce(PASS_RESULT);

    const out = await runEvaluation(INPUT);

    expect(mockOllama).not.toHaveBeenCalled();
    expect(mockGroq).toHaveBeenCalledOnce();
    expect(out.modelUsed).toContain("groq/");
  });

  it("throws when Ollama is unhealthy and Groq fallback is disabled", async () => {
    vi.stubEnv("AI_USE_GROQ_FALLBACK", "false");
    mockCheckHealth.mockResolvedValueOnce(false);

    await expect(runEvaluation(INPUT)).rejects.toThrow(
      "Ollama is not available"
    );
  });

  it("handles Ollama health check throwing (treats as unavailable)", async () => {
    mockCheckHealth.mockRejectedValueOnce(new Error("Cannot connect"));
    mockGroq.mockResolvedValueOnce(PASS_RESULT);

    const out = await runEvaluation(INPUT);
    expect(out.modelUsed).toContain("groq/");
  });
});
