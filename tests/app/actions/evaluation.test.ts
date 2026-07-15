import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mock all external dependencies ──────────────────────────────────────────

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    phase: {
      findUnique: vi.fn(),
      count: vi.fn(),
    },
    submission: {
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    evaluation: { create: vi.fn().mockResolvedValue({}) },
    progress: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
    userStats: { upsert: vi.fn().mockResolvedValue({}), update: vi.fn().mockResolvedValue({}) },
    designQuestion: { findUnique: vi.fn().mockResolvedValue({ track: "LLD" }) },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/lib/ai/evaluator", () => ({
  runEvaluation: vi.fn(),
}));

vi.mock("@/lib/ai/prompts/lld-phases", () => ({
  getLLDSystemPrompt: vi.fn().mockReturnValue("LLD system prompt"),
}));

vi.mock("@/lib/ai/prompts/hld-phases", () => ({
  getHLDSystemPrompt: vi.fn().mockReturnValue("HLD system prompt"),
}));

// ─── Import after mocking ─────────────────────────────────────────────────────
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { runEvaluation } from "@/lib/ai/evaluator";
import { submitPhaseResponse } from "@/app/actions/evaluation";

const mockAuth = vi.mocked(auth);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockPrisma = prisma as any;
const mockRunEvaluation = vi.mocked(runEvaluation);

// ─── Test data ────────────────────────────────────────────────────────────────

const USER_ID = "user-123";
const QUESTION_ID = "q-abc";
const PHASE_ID = "phase-1";

const MOCK_PHASE = {
  id: PHASE_ID,
  questionId: QUESTION_ID,
  order: 1,
  passThreshold: 60,
  maxAttempts: 4,
  xpReward: 25,
  systemPrompt: "LLD_PHASE_1",
  rubricJson: {},
  question: {
    id: QUESTION_ID,
    title: "Design a Parking Lot",
    description: "Multi-level parking lot.",
    track: "LLD" as const,
  },
};

const PASS_EVAL_RESULT = {
  result: {
    score: 80,
    pass: true,
    strengths: ["Good"],
    missingElements: [],
    misconceptions: [],
    targetedFeedback: "Well done.",
    hint: null,
    nextPhaseTeaser: "Think about entities.",
  },
  modelUsed: "ollama/llama3.2:3b",
  evaluationMs: 1200,
};

const FAIL_EVAL_RESULT = {
  result: { ...PASS_EVAL_RESULT.result, score: 40, pass: false, nextPhaseTeaser: null },
  modelUsed: "ollama/llama3.2:3b",
  evaluationMs: 900,
};

const LONG_CONTENT = "a".repeat(60);

beforeEach(() => {
  vi.clearAllMocks();
  // Default: user is authenticated
  mockAuth.mockResolvedValue({ user: { id: USER_ID } } as never);
  // Default: no previous attempts
  mockPrisma.submission.count.mockResolvedValue(0);
  // Default: phase found
  mockPrisma.phase.findUnique.mockResolvedValue(MOCK_PHASE as never);
  // Default: no existing progress
  mockPrisma.progress.findUnique.mockResolvedValue(null);
  // Default: submission created
  mockPrisma.submission.create.mockResolvedValue({ id: "sub-1" } as never);
  // Default: 2 total phases
  mockPrisma.phase.count.mockResolvedValue(2);
  // Default: $transaction handles both array and callback patterns
  mockPrisma.$transaction.mockImplementation(async (fnOrArray: unknown) => {
    if (Array.isArray(fnOrArray)) {
      // Array pattern: prisma.$transaction([op1, op2, ...])
      return Promise.all(fnOrArray);
    }
    // Callback pattern: prisma.$transaction(async (tx) => {...})
    const tx = {
      progress: { upsert: vi.fn().mockResolvedValue({}) },
      userStats: { upsert: vi.fn().mockResolvedValue({}), update: vi.fn().mockResolvedValue({}) },
      designQuestion: { findUnique: vi.fn().mockResolvedValue({ track: "LLD" }) },
      evaluation: { create: vi.fn().mockResolvedValue({}) },
      submission: { update: vi.fn().mockResolvedValue({}) },
    };
    return (fnOrArray as (tx: unknown) => Promise<unknown>)(tx);
  });
});

describe("submitPhaseResponse — auth guard", () => {
  it("returns error when user is not authenticated", async () => {
    mockAuth.mockResolvedValueOnce(null as never);
    const result = await submitPhaseResponse(QUESTION_ID, PHASE_ID, LONG_CONTENT);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/not authenticated/i);
  });

  it("returns error when session has no user id", async () => {
    mockAuth.mockResolvedValueOnce({ user: {} } as never);
    const result = await submitPhaseResponse(QUESTION_ID, PHASE_ID, LONG_CONTENT);
    expect(result.success).toBe(false);
  });
});

describe("submitPhaseResponse — input validation", () => {
  it("returns error for empty content", async () => {
    const result = await submitPhaseResponse(QUESTION_ID, PHASE_ID, "   ");
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/empty/i);
  });

  it("returns error for content shorter than 50 characters", async () => {
    const result = await submitPhaseResponse(QUESTION_ID, PHASE_ID, "too short");
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/too short/i);
  });

  it("accepts content of exactly 50 characters", async () => {
    mockRunEvaluation.mockResolvedValueOnce(PASS_EVAL_RESULT as never);
    const result = await submitPhaseResponse(QUESTION_ID, PHASE_ID, "a".repeat(50));
    // Should not be rejected for being too short
    expect(result.error).not.toBe("Response is too short. Please provide a more detailed answer.");
  });
});

describe("submitPhaseResponse — phase validation", () => {
  it("returns error when phase is not found", async () => {
    mockPrisma.phase.findUnique.mockResolvedValueOnce(null);
    const result = await submitPhaseResponse(QUESTION_ID, PHASE_ID, LONG_CONTENT);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/not found/i);
  });

  it("returns error when phase belongs to a different question", async () => {
    mockPrisma.phase.findUnique.mockResolvedValueOnce({
      ...MOCK_PHASE,
      questionId: "different-question",
    } as never);
    const result = await submitPhaseResponse(QUESTION_ID, PHASE_ID, LONG_CONTENT);
    expect(result.success).toBe(false);
  });

  it("returns error when max attempts already reached", async () => {
    mockPrisma.submission.count.mockResolvedValueOnce(4); // equals maxAttempts
    const result = await submitPhaseResponse(QUESTION_ID, PHASE_ID, LONG_CONTENT);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/maximum attempts/i);
  });
});

describe("submitPhaseResponse — phase unlock guard", () => {
  it("returns error when previous phase not completed (phase 2 without phase 1 done)", async () => {
    const phase2 = { ...MOCK_PHASE, id: "phase-2", order: 2 };
    mockPrisma.phase.findUnique.mockResolvedValueOnce(phase2 as never);
    mockPrisma.progress.findUnique.mockResolvedValueOnce({
      currentPhase: 2,
      completedPhases: [], // phase 1 not completed
    } as never);

    const result = await submitPhaseResponse(QUESTION_ID, "phase-2", LONG_CONTENT);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/previous phase/i);
  });

  it("allows submission for phase 2 when phase 1 is completed", async () => {
    const phase2 = { ...MOCK_PHASE, id: "phase-2", order: 2 };
    mockPrisma.phase.findUnique.mockResolvedValueOnce(phase2 as never);
    mockPrisma.progress.findUnique.mockResolvedValueOnce({
      currentPhase: 2,
      completedPhases: [1], // phase 1 done
    } as never);
    mockRunEvaluation.mockResolvedValueOnce(PASS_EVAL_RESULT as never);

    const result = await submitPhaseResponse(QUESTION_ID, "phase-2", LONG_CONTENT);
    expect(result.success).toBe(true);
  });
});

describe("submitPhaseResponse — successful evaluation", () => {
  it("returns success with evaluation on passing response", async () => {
    mockRunEvaluation.mockResolvedValueOnce(PASS_EVAL_RESULT as never);
    const result = await submitPhaseResponse(QUESTION_ID, PHASE_ID, LONG_CONTENT);

    expect(result.success).toBe(true);
    expect(result.evaluation?.pass).toBe(true);
    expect(result.evaluation?.score).toBe(80);
    expect(result.modelUsed).toBe("ollama/llama3.2:3b");
    expect(result.evaluationMs).toBe(1200);
  });

  it("returns success with evaluation on failing response", async () => {
    mockRunEvaluation.mockResolvedValueOnce(FAIL_EVAL_RESULT as never);
    const result = await submitPhaseResponse(QUESTION_ID, PHASE_ID, LONG_CONTENT);

    expect(result.success).toBe(true);
    expect(result.evaluation?.pass).toBe(false);
  });

  it("calls runEvaluation with LLD system prompt for LLD questions", async () => {
    mockRunEvaluation.mockResolvedValueOnce(PASS_EVAL_RESULT as never);
    await submitPhaseResponse(QUESTION_ID, PHASE_ID, LONG_CONTENT);

    expect(mockRunEvaluation).toHaveBeenCalledWith(
      expect.objectContaining({ systemPrompt: "LLD system prompt" })
    );
  });

  it("calls runEvaluation with HLD system prompt for HLD questions", async () => {
    mockPrisma.phase.findUnique.mockResolvedValueOnce({
      ...MOCK_PHASE,
      systemPrompt: "HLD_PHASE_1",
      question: { ...MOCK_PHASE.question, track: "HLD" },
    } as never);
    mockRunEvaluation.mockResolvedValueOnce(PASS_EVAL_RESULT as never);
    await submitPhaseResponse(QUESTION_ID, PHASE_ID, LONG_CONTENT);

    expect(mockRunEvaluation).toHaveBeenCalledWith(
      expect.objectContaining({ systemPrompt: "HLD system prompt" })
    );
  });

  it("uses deep model for phases 4 and above", async () => {
    const phase4 = { ...MOCK_PHASE, order: 4 };
    mockPrisma.phase.findUnique.mockResolvedValueOnce(phase4 as never);
    mockRunEvaluation.mockResolvedValueOnce(PASS_EVAL_RESULT as never);
    await submitPhaseResponse(QUESTION_ID, PHASE_ID, LONG_CONTENT);

    expect(mockRunEvaluation).toHaveBeenCalledWith(
      expect.objectContaining({ useDeepModel: true })
    );
  });

  it("uses fast model for phases below 4", async () => {
    mockRunEvaluation.mockResolvedValueOnce(PASS_EVAL_RESULT as never);
    await submitPhaseResponse(QUESTION_ID, PHASE_ID, LONG_CONTENT);

    expect(mockRunEvaluation).toHaveBeenCalledWith(
      expect.objectContaining({ useDeepModel: false })
    );
  });
});

describe("submitPhaseResponse — error handling", () => {
  it("returns error when runEvaluation throws", async () => {
    mockRunEvaluation.mockRejectedValueOnce(new Error("Ollama timed out"));
    const result = await submitPhaseResponse(QUESTION_ID, PHASE_ID, LONG_CONTENT);

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/timed out/i);
  });

  it("uses stored prompt directly if not LLD_ or HLD_ prefix", async () => {
    mockPrisma.phase.findUnique.mockResolvedValueOnce({
      ...MOCK_PHASE,
      systemPrompt: "Custom direct prompt text",
    } as never);
    mockRunEvaluation.mockResolvedValueOnce(PASS_EVAL_RESULT as never);
    await submitPhaseResponse(QUESTION_ID, PHASE_ID, LONG_CONTENT);

    expect(mockRunEvaluation).toHaveBeenCalledWith(
      expect.objectContaining({ systemPrompt: "Custom direct prompt text" })
    );
  });
});
