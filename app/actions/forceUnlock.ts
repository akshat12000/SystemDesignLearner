"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

export interface ForceUnlockResult {
  success: boolean;
  error?: string;
  isQuestionComplete?: boolean;
}

/**
 * Called when a student exhausts all attempts on a phase.
 * Marks the phase as "exhausted" (0 XP earned), unlocks the next phase.
 * The student can still see all their feedback — they just proceed without XP.
 */
export async function forceUnlockNextPhase(
  questionId: string,
  exhaustedPhaseOrder: number
): Promise<ForceUnlockResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const userId = session.user.id;

  // Verify the phase exists and belongs to this question
  const phase = await prisma.phase.findUnique({
    where: { questionId_order: { questionId, order: exhaustedPhaseOrder } },
    select: { id: true, maxAttempts: true },
  });
  if (!phase) return { success: false, error: "Phase not found" };

  // Verify they actually exhausted their attempts (don't allow skipping)
  const attemptCount = await prisma.submission.count({
    where: { userId, phaseId: phase.id },
  });
  if (attemptCount < phase.maxAttempts) {
    return {
      success: false,
      error: `You still have ${phase.maxAttempts - attemptCount} attempt(s) remaining.`,
    };
  }

  // Verify they haven't already passed this phase
  const alreadyPassed = await prisma.submission.findFirst({
    where: { userId, phaseId: phase.id, status: "PASSED" },
  });
  if (alreadyPassed) {
    return { success: false, error: "Phase already passed." };
  }

  const totalPhases = await prisma.phase.count({ where: { questionId } });
  const isLastPhase = exhaustedPhaseOrder === totalPhases;
  const nextPhaseOrder = exhaustedPhaseOrder + 1;
  const now = new Date();

  await prisma.progress.upsert({
    where: { userId_questionId: { userId, questionId } },
    create: {
      userId,
      questionId,
      currentPhase: isLastPhase ? exhaustedPhaseOrder : nextPhaseOrder,
      completedPhases: [],
      exhaustedPhases: [exhaustedPhaseOrder],
      status: isLastPhase ? "COMPLETED" : "IN_PROGRESS",
      totalXp: 0,
      completedAt: isLastPhase ? now : null,
    },
    update: {
      currentPhase: isLastPhase ? exhaustedPhaseOrder : nextPhaseOrder,
      exhaustedPhases: { push: exhaustedPhaseOrder },
      status: isLastPhase ? "COMPLETED" : "IN_PROGRESS",
      completedAt: isLastPhase ? now : null,
    },
  });

  // Update streak — force-unlock still counts as daily activity
  const existingStats = await prisma.userStats.findUnique({
    where: { userId },
    select: { currentStreak: true, longestStreak: true, lastActiveAt: true },
  });
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let newStreak = 1;
  if (existingStats) {
    const last = existingStats.lastActiveAt;
    const lastDay = new Date(last.getFullYear(), last.getMonth(), last.getDate());
    const dayDiff = Math.round((today.getTime() - lastDay.getTime()) / 86_400_000);
    if (dayDiff === 0) newStreak = existingStats.currentStreak;
    else if (dayDiff === 1) newStreak = existingStats.currentStreak + 1;
    else newStreak = 1;
  }
  await prisma.userStats.upsert({
    where: { userId },
    create: { userId, currentStreak: 1, longestStreak: 1, lastActiveAt: now },
    update: {
      currentStreak: newStreak,
      longestStreak: { set: Math.max(newStreak, existingStats?.longestStreak ?? 0) },
      lastActiveAt: now,
    },
  });

  return { success: true, isQuestionComplete: isLastPhase };
}
