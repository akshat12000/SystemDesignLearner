import { describe, it, expect, vi, beforeEach } from "vitest";
import type { EvaluationResult } from "@/types/evaluation";

// ─── Mock the ollama module before importing the module under test ────────────
const mockOllamaChat = vi.fn();
const mockOllamaList = vi.fn();

vi.mock("ollama", () => ({
  // Must be a class (function constructor) because the module does `new Ollama(...)`
  Ollama: vi.fn().mockImplementation(function () {
    return { chat: mockOllamaChat, list: mockOllamaList };
  }),
}));

// Import after mocking
const { evaluateWithOllama, checkOllamaHealth } = await import(
  "@/lib/ai/ollama"
);

const VALID_EVAL: EvaluationResult = {
  score: 75,
  pass: true,
  strengths: ["Good entity identification"],
  missingElements: [],
  misconceptions: [],
  targetedFeedback: "Strong start. Consider edge cases.",
  hint: null,
  nextPhaseTeaser: "Think about relationships next.",
};

const SYSTEM_PROMPT = "You are an expert evaluator.";
const STUDENT_RESPONSE = "User has id, name, email. Book has id, title, isbn.";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("checkOllamaHealth", () => {
  it("returns true when Ollama has models", async () => {
    mockOllamaList.mockResolvedValueOnce({ models: [{ name: "llama3.2:3b" }] });
    const result = await checkOllamaHealth();
    expect(result).toBe(true);
  });

  it("returns false when Ollama has no models", async () => {
    mockOllamaList.mockResolvedValueOnce({ models: [] });
    const result = await checkOllamaHealth();
    expect(result).toBe(false);
  });

  it("returns false when Ollama throws (not running)", async () => {
    mockOllamaList.mockRejectedValueOnce(new Error("ECONNREFUSED"));
    const result = await checkOllamaHealth();
    expect(result).toBe(false);
  });
});

describe("evaluateWithOllama", () => {
  it("returns parsed evaluation result on success", async () => {
    mockOllamaChat.mockResolvedValueOnce({
      message: { content: JSON.stringify(VALID_EVAL) },
    });

    const result = await evaluateWithOllama(
      SYSTEM_PROMPT,
      STUDENT_RESPONSE,
      60,
      1,
      false
    );

    expect(result.score).toBe(75);
    expect(result.pass).toBe(true);
    expect(result.strengths).toHaveLength(1);
  });

  it("enforces pass=false when score is below threshold regardless of AI response", async () => {
    const lowScore: EvaluationResult = { ...VALID_EVAL, score: 40, pass: true }; // AI says pass but score says no
    mockOllamaChat.mockResolvedValueOnce({
      message: { content: JSON.stringify(lowScore) },
    });

    const result = await evaluateWithOllama(SYSTEM_PROMPT, STUDENT_RESPONSE, 60, 1);
    expect(result.score).toBe(40);
    expect(result.pass).toBe(false); // enforced by evaluator, not AI
  });

  it("enforces pass=true when score meets threshold even if AI says false", async () => {
    const highScore: EvaluationResult = { ...VALID_EVAL, score: 80, pass: false };
    mockOllamaChat.mockResolvedValueOnce({
      message: { content: JSON.stringify(highScore) },
    });

    const result = await evaluateWithOllama(SYSTEM_PROMPT, STUDENT_RESPONSE, 60, 1);
    expect(result.pass).toBe(true);
  });

  it("uses deep model when useDeepModel is true", async () => {
    mockOllamaChat.mockResolvedValueOnce({
      message: { content: JSON.stringify(VALID_EVAL) },
    });

    await evaluateWithOllama(SYSTEM_PROMPT, STUDENT_RESPONSE, 60, 1, true);

    const callArgs = mockOllamaChat.mock.calls[0][0];
    expect(callArgs.model).toBe(
      process.env.OLLAMA_DEEP_MODEL ?? "llama3.1:8b"
    );
  });

  it("uses fast model when useDeepModel is false", async () => {
    mockOllamaChat.mockResolvedValueOnce({
      message: { content: JSON.stringify(VALID_EVAL) },
    });

    await evaluateWithOllama(SYSTEM_PROMPT, STUDENT_RESPONSE, 60, 1, false);

    const callArgs = mockOllamaChat.mock.calls[0][0];
    expect(callArgs.model).toBe(
      process.env.OLLAMA_FAST_MODEL ?? "llama3.2:3b"
    );
  });

  it("includes hint instruction for attempt >= 3", async () => {
    mockOllamaChat.mockResolvedValueOnce({
      message: { content: JSON.stringify(VALID_EVAL) },
    });

    await evaluateWithOllama(SYSTEM_PROMPT, STUDENT_RESPONSE, 60, 3);

    const userMessage = mockOllamaChat.mock.calls[0][0].messages[1].content;
    expect(userMessage).toContain("attempt 3 or higher");
  });

  it("sets hint to null instruction for attempt < 3", async () => {
    mockOllamaChat.mockResolvedValueOnce({
      message: { content: JSON.stringify(VALID_EVAL) },
    });

    await evaluateWithOllama(SYSTEM_PROMPT, STUDENT_RESPONSE, 60, 2);

    const userMessage = mockOllamaChat.mock.calls[0][0].messages[1].content;
    expect(userMessage).toContain("Set 'hint' to null");
  });

  it("uses low temperature for consistent evaluation", async () => {
    mockOllamaChat.mockResolvedValueOnce({
      message: { content: JSON.stringify(VALID_EVAL) },
    });

    await evaluateWithOllama(SYSTEM_PROMPT, STUDENT_RESPONSE, 60, 1);

    const callArgs = mockOllamaChat.mock.calls[0][0];
    expect(callArgs.options.temperature).toBeLessThanOrEqual(0.2);
  });
});
