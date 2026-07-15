import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    track: { findUnique: vi.fn() },
    module: { findMany: vi.fn() },
    designQuestion: { findMany: vi.fn() },
    progress: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      aggregate: vi.fn(),
    },
    submission: { findMany: vi.fn() },
    enrollment: { findUnique: vi.fn(), upsert: vi.fn() },
    user: { findUnique: vi.fn() },
    userStats: { findUnique: vi.fn() },
    lesson: { findMany: vi.fn() },
    phase: { findMany: vi.fn() },
  },
}));

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import {
  getQuestionProgress,
  getTrackProgress,
  getDashboardData,
  enrollInTrack,
} from "@/app/actions/progress";

const mockAuth = vi.mocked(auth);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockPrisma = prisma as any;

const USER_ID = "user-abc";
const QUESTION_ID = "q-xyz";
const TRACK_ID = "track-lld";

const MOCK_PHASES = [
  { id: "p1", questionId: QUESTION_ID, order: 1, title: "Requirements", instruction: "", passThreshold: 60, maxAttempts: 4, xpReward: 25, editorType: "richtext" },
  { id: "p2", questionId: QUESTION_ID, order: 2, title: "Entities", instruction: "", passThreshold: 60, maxAttempts: 4, xpReward: 25, editorType: "richtext" },
];

const MOCK_TRACK = { id: TRACK_ID, slug: "lld", title: "LLD", description: "", type: "LLD", order: 1 };

beforeEach(() => {
  vi.clearAllMocks();
  mockAuth.mockResolvedValue({ user: { id: USER_ID } } as never);
});

// ─── getQuestionProgress ──────────────────────────────────────────────────────

describe("getQuestionProgress", () => {
  it("returns null when not authenticated", async () => {
    mockAuth.mockResolvedValueOnce(null as never);
    const result = await getQuestionProgress(QUESTION_ID);
    expect(result).toBeNull();
  });

  it("returns progress with NOT_STARTED status when no progress exists", async () => {
    mockPrisma.phase.findMany.mockResolvedValueOnce(MOCK_PHASES as never);
    mockPrisma.progress.findUnique.mockResolvedValueOnce(null);
    mockPrisma.submission.findMany.mockResolvedValueOnce([]);

    const result = await getQuestionProgress(QUESTION_ID);
    expect(result).not.toBeNull();
    expect(result!.status).toBe("NOT_STARTED");
    expect(result!.currentPhase).toBe(1);
    expect(result!.completedPhases).toEqual([]);
  });

  it("marks first phase as active when no progress", async () => {
    mockPrisma.phase.findMany.mockResolvedValueOnce(MOCK_PHASES as never);
    mockPrisma.progress.findUnique.mockResolvedValueOnce(null);
    mockPrisma.submission.findMany.mockResolvedValueOnce([]);

    const result = await getQuestionProgress(QUESTION_ID);
    expect(result!.phaseProgresses[0].status).toBe("active");
    expect(result!.phaseProgresses[1].status).toBe("locked");
  });

  it("marks phase as passed when submission with PASSED status exists", async () => {
    mockPrisma.phase.findMany.mockResolvedValueOnce(MOCK_PHASES as never);
    mockPrisma.progress.findUnique.mockResolvedValueOnce({
      status: "IN_PROGRESS",
      currentPhase: 2,
      completedPhases: [1],
      totalXp: 25,
      startedAt: new Date(),
      completedAt: null,
    } as never);
    mockPrisma.submission.findMany.mockResolvedValueOnce([
      { phaseId: "p1", status: "PASSED", evaluation: { score: 75 } },
    ] as never);

    const result = await getQuestionProgress(QUESTION_ID);
    const phase1Progress = result!.phaseProgresses.find(p => p.phaseOrder === 1);
    expect(phase1Progress!.status).toBe("passed");
    expect(phase1Progress!.bestScore).toBe(75);
  });

  it("calculates best score from multiple attempts", async () => {
    mockPrisma.phase.findMany.mockResolvedValueOnce(MOCK_PHASES as never);
    mockPrisma.progress.findUnique.mockResolvedValueOnce({
      status: "IN_PROGRESS",
      currentPhase: 2,
      completedPhases: [1],
      totalXp: 25,
      startedAt: new Date(),
      completedAt: null,
    } as never);
    mockPrisma.submission.findMany.mockResolvedValueOnce([
      { phaseId: "p1", status: "FAILED", evaluation: { score: 40 } },
      { phaseId: "p1", status: "FAILED", evaluation: { score: 55 } },
      { phaseId: "p1", status: "PASSED", evaluation: { score: 72 } },
    ] as never);

    const result = await getQuestionProgress(QUESTION_ID);
    const phase1 = result!.phaseProgresses.find(p => p.phaseOrder === 1)!;
    expect(phase1.bestScore).toBe(72);
    expect(phase1.attemptCount).toBe(3);
  });

  it("returns completedAt timestamp when question is fully completed", async () => {
    const completedAt = new Date("2026-01-01");
    mockPrisma.phase.findMany.mockResolvedValueOnce(MOCK_PHASES as never);
    mockPrisma.progress.findUnique.mockResolvedValueOnce({
      status: "COMPLETED",
      currentPhase: 2,
      completedPhases: [1, 2],
      totalXp: 150,
      startedAt: new Date("2025-12-31"),
      completedAt,
    } as never);
    mockPrisma.submission.findMany.mockResolvedValueOnce([]);

    const result = await getQuestionProgress(QUESTION_ID);
    expect(result!.completedAt).toBe(completedAt.toISOString());
    expect(result!.status).toBe("COMPLETED");
  });
});

// ─── getTrackProgress ─────────────────────────────────────────────────────────

describe("getTrackProgress", () => {
  it("returns null when not authenticated", async () => {
    mockAuth.mockResolvedValueOnce(null as never);
    const result = await getTrackProgress("lld");
    expect(result).toBeNull();
  });

  it("returns null when track slug is not found", async () => {
    mockPrisma.track.findUnique.mockResolvedValueOnce(null);
    const result = await getTrackProgress("nonexistent");
    expect(result).toBeNull();
  });

  it("returns track progress with counts", async () => {
    mockPrisma.track.findUnique.mockResolvedValueOnce(MOCK_TRACK as never);
    mockPrisma.enrollment.findUnique.mockResolvedValueOnce({ startedAt: new Date("2026-01-01") } as never);
    mockPrisma.designQuestion.findMany.mockResolvedValueOnce([{ id: "q1" }, { id: "q2" }] as never);
    mockPrisma.progress.count.mockResolvedValueOnce(1);
    mockPrisma.progress.aggregate.mockResolvedValueOnce({ _sum: { totalXp: 175 } } as never);
    mockPrisma.lesson.findMany.mockResolvedValueOnce([{ id: "l1" }, { id: "l2" }, { id: "l3" }] as never);

    const result = await getTrackProgress("lld");
    expect(result).not.toBeNull();
    expect(result!.totalQuestions).toBe(2);
    expect(result!.completedQuestions).toBe(1);
    expect(result!.totalXp).toBe(175);
    expect(result!.totalLessons).toBe(3);
    expect(result!.enrolledAt).toBeDefined();
  });

  it("returns 0 XP when no progress exists", async () => {
    mockPrisma.track.findUnique.mockResolvedValueOnce(MOCK_TRACK as never);
    mockPrisma.enrollment.findUnique.mockResolvedValueOnce(null);
    mockPrisma.designQuestion.findMany.mockResolvedValueOnce([]);
    mockPrisma.progress.count.mockResolvedValueOnce(0);
    mockPrisma.progress.aggregate.mockResolvedValueOnce({ _sum: { totalXp: null } } as never);
    mockPrisma.lesson.findMany.mockResolvedValueOnce([]);

    const result = await getTrackProgress("lld");
    expect(result!.totalXp).toBe(0);
    expect(result!.enrolledAt).toBeNull();
  });
});

// ─── getDashboardData ─────────────────────────────────────────────────────────

describe("getDashboardData", () => {
  it("returns null when not authenticated", async () => {
    mockAuth.mockResolvedValueOnce(null as never);
    const result = await getDashboardData();
    expect(result).toBeNull();
  });

  it("returns null when session has no email", async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: USER_ID } } as never);
    const result = await getDashboardData();
    expect(result).toBeNull();
  });

  it("returns null when user not found in DB", async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: USER_ID, email: "test@test.com" } } as never);
    mockPrisma.user.findUnique.mockResolvedValueOnce(null);
    mockPrisma.userStats.findUnique.mockResolvedValueOnce(null);
    mockPrisma.track.findUnique.mockResolvedValue(null);
    mockPrisma.enrollment.findUnique.mockResolvedValue(null);
    mockPrisma.designQuestion.findMany.mockResolvedValue([]);
    mockPrisma.progress.count.mockResolvedValue(0);
    mockPrisma.progress.aggregate.mockResolvedValue({ _sum: { totalXp: null } } as never);
    mockPrisma.lesson.findMany.mockResolvedValue([]);

    const result = await getDashboardData();
    expect(result).toBeNull();
  });

  it("returns dashboard data with zero stats when no stats record", async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: USER_ID, email: "a@b.com" } } as never);
    mockPrisma.user.findUnique.mockResolvedValueOnce({ name: "Test", image: null, email: "a@b.com" } as never);
    mockPrisma.userStats.findUnique.mockResolvedValueOnce(null);
    // Track progress mocks
    mockPrisma.track.findUnique.mockResolvedValue(null);
    mockPrisma.enrollment.findUnique.mockResolvedValue(null);
    mockPrisma.designQuestion.findMany.mockResolvedValue([]);
    mockPrisma.progress.count.mockResolvedValue(0);
    mockPrisma.progress.aggregate.mockResolvedValue({ _sum: { totalXp: null } } as never);
    mockPrisma.lesson.findMany.mockResolvedValue([]);

    const result = await getDashboardData();
    expect(result).not.toBeNull();
    expect(result!.stats.totalXp).toBe(0);
    expect(result!.stats.currentStreak).toBe(0);
    expect(result!.stats.badges).toEqual([]);
  });
});

// ─── enrollInTrack ────────────────────────────────────────────────────────────

describe("enrollInTrack", () => {
  it("returns failure when not authenticated", async () => {
    mockAuth.mockResolvedValueOnce(null as never);
    const result = await enrollInTrack("lld");
    expect(result.success).toBe(false);
  });

  it("returns failure when track slug is not found", async () => {
    mockPrisma.track.findUnique.mockResolvedValueOnce(null);
    const result = await enrollInTrack("nonexistent");
    expect(result.success).toBe(false);
  });

  it("returns success and upserts enrollment", async () => {
    mockPrisma.track.findUnique.mockResolvedValueOnce(MOCK_TRACK as never);
    mockPrisma.enrollment.upsert.mockResolvedValueOnce({ id: "enr-1" } as never);

    const result = await enrollInTrack("lld");
    expect(result.success).toBe(true);
    expect(mockPrisma.enrollment.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId_trackId: { userId: USER_ID, trackId: TRACK_ID } },
      })
    );
  });
});
