import { describe, it, expect, vi, beforeEach } from "vitest";
import type { EvaluationResult } from "@/types/evaluation";

const VALID_EVAL: EvaluationResult = {
  score: 70,
  pass: true,
  strengths: ["Identified load balancer"],
  missingElements: ["No CDN mentioned"],
  misconceptions: [],
  targetedFeedback: "Good architecture, consider caching.",
  hint: null,
  nextPhaseTeaser: "Think about failure modes.",
};

const SYSTEM_PROMPT = "You are an HLD evaluator.";
const STUDENT_RESPONSE = "Client → Load Balancer → App Server → PostgreSQL";

beforeEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
});

describe("evaluateWithGroq", () => {
  it("throws when GROQ_API_KEY is not set", async () => {
    vi.stubEnv("GROQ_API_KEY", "");
    const { evaluateWithGroq } = await import("@/lib/ai/groq");
    await expect(
      evaluateWithGroq(SYSTEM_PROMPT, STUDENT_RESPONSE, 60, 1)
    ).rejects.toThrow("GROQ_API_KEY not configured");
  });

  it("returns evaluation result on success", async () => {
    vi.stubEnv("GROQ_API_KEY", "test-key");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: JSON.stringify(VALID_EVAL) } }],
        }),
      })
    );

    const { evaluateWithGroq } = await import("@/lib/ai/groq");
    const result = await evaluateWithGroq(SYSTEM_PROMPT, STUDENT_RESPONSE, 60, 1);

    expect(result.score).toBe(70);
    expect(result.pass).toBe(true);
    expect(result.strengths).toContain("Identified load balancer");
  });

  it("enforces pass=false when score is below threshold", async () => {
    vi.stubEnv("GROQ_API_KEY", "test-key");
    const lowScore = { ...VALID_EVAL, score: 30, pass: true };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: JSON.stringify(lowScore) } }],
        }),
      })
    );

    const { evaluateWithGroq } = await import("@/lib/ai/groq");
    const result = await evaluateWithGroq(SYSTEM_PROMPT, STUDENT_RESPONSE, 60, 1);
    expect(result.pass).toBe(false);
  });

  it("enforces pass=true when score meets threshold even if AI says false", async () => {
    vi.stubEnv("GROQ_API_KEY", "test-key");
    const highScore = { ...VALID_EVAL, score: 90, pass: false };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: JSON.stringify(highScore) } }],
        }),
      })
    );

    const { evaluateWithGroq } = await import("@/lib/ai/groq");
    const result = await evaluateWithGroq(SYSTEM_PROMPT, STUDENT_RESPONSE, 60, 1);
    expect(result.pass).toBe(true);
  });

  it("throws on non-ok HTTP response", async () => {
    vi.stubEnv("GROQ_API_KEY", "test-key");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 429,
        text: async () => "Rate limit exceeded",
      })
    );

    const { evaluateWithGroq } = await import("@/lib/ai/groq");
    await expect(
      evaluateWithGroq(SYSTEM_PROMPT, STUDENT_RESPONSE, 60, 1)
    ).rejects.toThrow("Groq API error 429");
  });

  it("sends hint instruction on attempt >= 3", async () => {
    vi.stubEnv("GROQ_API_KEY", "test-key");
    let capturedBody: string | undefined;
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementationOnce(async (_url: string, opts: RequestInit) => {
        capturedBody = opts.body as string;
        return {
          ok: true,
          json: async () => ({
            choices: [{ message: { content: JSON.stringify(VALID_EVAL) } }],
          }),
        };
      })
    );

    const { evaluateWithGroq } = await import("@/lib/ai/groq");
    await evaluateWithGroq(SYSTEM_PROMPT, STUDENT_RESPONSE, 60, 3);

    const parsed = JSON.parse(capturedBody!);
    const userContent = parsed.messages[1].content as string;
    expect(userContent).toContain("attempt 3 or higher");
  });

  it("sends null hint instruction on attempt < 3", async () => {
    vi.stubEnv("GROQ_API_KEY", "test-key");
    let capturedBody: string | undefined;
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementationOnce(async (_url: string, opts: RequestInit) => {
        capturedBody = opts.body as string;
        return {
          ok: true,
          json: async () => ({
            choices: [{ message: { content: JSON.stringify(VALID_EVAL) } }],
          }),
        };
      })
    );

    const { evaluateWithGroq } = await import("@/lib/ai/groq");
    await evaluateWithGroq(SYSTEM_PROMPT, STUDENT_RESPONSE, 60, 2);

    const parsed = JSON.parse(capturedBody!);
    const userContent = parsed.messages[1].content as string;
    expect(userContent).toContain("Set 'hint' to null");
  });

  it("sends json_object response_format", async () => {
    vi.stubEnv("GROQ_API_KEY", "test-key");
    let capturedBody: string | undefined;
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementationOnce(async (_url: string, opts: RequestInit) => {
        capturedBody = opts.body as string;
        return {
          ok: true,
          json: async () => ({
            choices: [{ message: { content: JSON.stringify(VALID_EVAL) } }],
          }),
        };
      })
    );

    const { evaluateWithGroq } = await import("@/lib/ai/groq");
    await evaluateWithGroq(SYSTEM_PROMPT, STUDENT_RESPONSE, 60, 1);

    const parsed = JSON.parse(capturedBody!);
    expect(parsed.response_format?.type).toBe("json_object");
  });
});
