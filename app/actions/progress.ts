"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import type { QuestionProgress, TrackProgress, DashboardData } from "@/types/progress";
import type { PhaseClient } from "@/types/curriculum";

// Safe phase selector — NEVER returns systemPrompt or rubricJson
const SAFE_PHASE_SELECT = {
  id: true,
  questionId: true,
  order: true,
  title: true,
  instruction: true,
  passThreshold: true,
  maxAttempts: true,
  xpReward: true,
  editorType: true,
} as const;

export async function getQuestionProgress(
  questionId: string
): Promise<QuestionProgress | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  const userId = session.user.id;

  // Get all phases for this question (safe fields only)
  const phases = await prisma.phase.findMany({
    where: { questionId },
    select: SAFE_PHASE_SELECT,
    orderBy: { order: "asc" },
  });

  // Get user progress
  const progress = await prisma.progress.findUnique({
    where: { userId_questionId: { userId, questionId } },
  });

  // Get attempt counts per phase
  const submissions = await prisma.submission.findMany({
    where: { userId, questionId },
    select: {
      phaseId: true,
      status: true,
      evaluation: { select: { score: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  const phaseProgresses = phases.map((phase) => {
    const phaseSubmissions = submissions.filter((s) => s.phaseId === phase.id);
    const hasPassed = phaseSubmissions.some((s) => s.status === "PASSED");
    const bestScore = phaseSubmissions.reduce<number | null>((best, s) => {
      const score = s.evaluation?.score ?? null;
      if (score === null) return best;
      return best === null ? score : Math.max(best, score);
    }, null);

    let status: "locked" | "active" | "passed" | "failed" | "exhausted";
    if (hasPassed) {
      status = "passed";
    } else if (progress?.exhaustedPhases?.includes(phase.order)) {
      status = "exhausted";
    } else if (!progress && phase.order === 1) {
      status = "active";
    } else if (progress && progress.currentPhase === phase.order) {
      status = "active";
    } else if (progress && progress.completedPhases.includes(phase.order)) {
      status = "passed";
    } else {
      status = "locked";
    }

    return {
      phaseOrder: phase.order,
      phaseId: phase.id,
      status,
      attemptCount: phaseSubmissions.length,
      bestScore,
    };
  });

  return {
    questionId,
    status: progress?.status ?? "NOT_STARTED",
    currentPhase: progress?.currentPhase ?? 1,
    completedPhases: progress?.completedPhases ?? [],
    exhaustedPhases: progress?.exhaustedPhases ?? [],
    totalXp: progress?.totalXp ?? 0,
    startedAt: progress?.startedAt?.toISOString() ?? null,
    completedAt: progress?.completedAt?.toISOString() ?? null,
    phaseProgresses,
  };
}

export async function getTrackProgress(trackSlug: string): Promise<TrackProgress | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  const userId = session.user.id;

  const track = await prisma.track.findUnique({ where: { slug: trackSlug } });
  if (!track) return null;

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_trackId: { userId, trackId: track.id } },
  });

  const questions = await prisma.designQuestion.findMany({
    where: { module: { trackId: track.id } },
    select: { id: true },
  });
  const questionIds = questions.map((q) => q.id);

  const completedCount = await prisma.progress.count({
    where: { userId, questionId: { in: questionIds }, status: "COMPLETED" },
  });

  const totalXpResult = await prisma.progress.aggregate({
    where: { userId, questionId: { in: questionIds } },
    _sum: { totalXp: true },
  });

  const lessons = await prisma.lesson.findMany({
    where: { module: { trackId: track.id } },
    select: { id: true },
  });

  return {
    trackId: track.id,
    trackSlug,
    enrolledAt: enrollment?.startedAt?.toISOString() ?? null,
    completedQuestions: completedCount,
    totalQuestions: questionIds.length,
    completedLessons: 0, // TODO: lesson completion tracking
    totalLessons: lessons.length,
    totalXp: totalXpResult._sum.totalXp ?? 0,
  };
}

export async function getDashboardData(): Promise<DashboardData | null> {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) return null;

  const userId = session.user.id;

  const [user, stats, lldProgress, hldProgress] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, image: true, email: true },
    }),
    prisma.userStats.findUnique({ where: { userId } }),
    getTrackProgress("lld"),
    getTrackProgress("hld"),
  ]);

  if (!user) return null;

  return {
    user: { name: user.name, image: user.image, email: user.email },
    stats: {
      totalXp: stats?.totalXp ?? 0,
      currentStreak: stats?.currentStreak ?? 0,
      longestStreak: stats?.longestStreak ?? 0,
      lldCompleted: stats?.lldCompleted ?? 0,
      hldCompleted: stats?.hldCompleted ?? 0,
      badges: stats?.badges ?? [],
    },
    lldProgress: lldProgress ?? {
      trackId: "",
      trackSlug: "lld",
      enrolledAt: null,
      completedQuestions: 0,
      totalQuestions: 0,
      completedLessons: 0,
      totalLessons: 0,
      totalXp: 0,
    },
    hldProgress: hldProgress ?? {
      trackId: "",
      trackSlug: "hld",
      enrolledAt: null,
      completedQuestions: 0,
      totalQuestions: 0,
      completedLessons: 0,
      totalLessons: 0,
      totalXp: 0,
    },
    recentActivity: [],
  };
}

export async function enrollInTrack(trackSlug: string): Promise<{ success: boolean }> {
  const session = await auth();
  if (!session?.user?.id) return { success: false };

  const userId = session.user.id;
  const track = await prisma.track.findUnique({ where: { slug: trackSlug } });
  if (!track) return { success: false };

  await prisma.enrollment.upsert({
    where: { userId_trackId: { userId, trackId: track.id } },
    create: { userId, trackId: track.id },
    update: {},
  });

  return { success: true };
}
