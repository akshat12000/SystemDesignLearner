"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { runEvaluation } from "@/lib/ai/evaluator";
import { getLLDSystemPrompt } from "@/lib/ai/prompts/lld-phases";
import { getHLDSystemPrompt } from "@/lib/ai/prompts/hld-phases";
import type { EvaluationResult } from "@/types/evaluation";

export interface SubmitPhaseResult {
  success: boolean;
  evaluation?: EvaluationResult;
  submissionId?: string;
  modelUsed?: string;
  evaluationMs?: number;
  error?: string;
}

export async function submitPhaseResponse(
  questionId: string,
  phaseId: string,
  content: string,
  userApiConfig?: { provider: string; apiKey: string; model?: string } | null
): Promise<SubmitPhaseResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const userId = session.user.id;

  // Check admin status — admins bypass all restrictions
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isAdmin: true },
  });
  const isAdmin = user?.isAdmin ?? false;

  // Validate content
  const trimmed = content.trim();
  if (!trimmed) {
    return { success: false, error: "Response cannot be empty" };
  }
  if (trimmed.length < 50) {
    return {
      success: false,
      error: "Response is too short. Please provide a more detailed answer.",
    };
  }

  // Fetch phase with rubric (server-only — never returned to client)
  const phase = await prisma.phase.findUnique({
    where: { id: phaseId },
    include: {
      question: {
        select: {
          id: true,
          title: true,
          description: true,
          track: true,
        },
      },
    },
  });

  if (!phase || phase.questionId !== questionId) {
    return { success: false, error: "Phase not found" };
  }

  // Check attempt count — admins have unlimited attempts
  const existingAttempts = await prisma.submission.count({
    where: { userId, phaseId },
  });

  if (!isAdmin && existingAttempts >= phase.maxAttempts) {
    return {
      success: false,
      error: `Maximum attempts (${phase.maxAttempts}) reached for this phase.`,
    };
  }

  // Check phase lock — admins can submit to any phase in any order
  const progress = await prisma.progress.findUnique({
    where: { userId_questionId: { userId, questionId } },
  });

  if (!isAdmin && progress && phase.order > 1) {
    const prevOrder = phase.order - 1;
    const prevPassed = progress.completedPhases.includes(prevOrder);
    const prevExhausted = progress.exhaustedPhases?.includes(prevOrder) ?? false;
    if (!prevPassed && !prevExhausted) {
      return { success: false, error: "Previous phase must be completed first" };
    }
  }

  // Build AI system prompt — phase.systemPrompt stores a key like "LLD_PHASE_1"
  // The actual prompt is generated at runtime from the prompts library
  let systemPrompt: string;
  if (phase.systemPrompt.startsWith("LLD_PHASE_")) {
    systemPrompt = getLLDSystemPrompt(
      phase.order,
      phase.question.title,
      phase.question.description
    );
  } else if (phase.systemPrompt.startsWith("HLD_PHASE_")) {
    systemPrompt = getHLDSystemPrompt(
      phase.order,
      phase.question.title,
      phase.question.description
    );
  } else {
    // Fallback: use stored prompt directly (for custom questions)
    systemPrompt = phase.systemPrompt;
  }

  const attemptNumber = existingAttempts + 1;

  // Create submission record
  const submission = await prisma.submission.create({
    data: {
      userId,
      questionId,
      phaseId,
      content: trimmed,
      attemptNumber,
      status: "EVALUATING",
    },
  });

  try {
    // Run AI evaluation
    const timeout = parseInt(process.env.AI_EVALUATION_TIMEOUT_MS ?? "30000");
    const evalPromise = runEvaluation({
      systemPrompt,
      studentResponse: trimmed,
      passThreshold: phase.passThreshold,
      attemptNumber,
      useDeepModel: phase.order >= 4,
      userApiConfig: userApiConfig ?? undefined,
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Evaluation timed out")), timeout)
    );

    const { result, modelUsed, evaluationMs } = await Promise.race([
      evalPromise,
      timeoutPromise,
    ]);

    // Persist evaluation
    await prisma.$transaction([
      prisma.evaluation.create({
        data: {
          submissionId: submission.id,
          score: result.score,
          pass: result.pass,
          strengths: result.strengths,
          missingElements: result.missingElements,
          misconceptions: result.misconceptions,
          targetedFeedback: result.targetedFeedback,
          hint: result.hint,
          nextPhaseTeaser: result.nextPhaseTeaser,
          modelUsed,
          evaluationMs,
        },
      }),
      prisma.submission.update({
        where: { id: submission.id },
        data: { status: result.pass ? "PASSED" : "FAILED" },
      }),
    ]);

    // If passed, update progress
    if (result.pass) {
      await handlePhasePass(userId, questionId, phase.order, phase.xpReward);
    }

    return {
      success: true,
      evaluation: result,
      submissionId: submission.id,
      modelUsed,
      evaluationMs,
    };
  } catch (error) {
    // Mark submission as failed with error
    await prisma.submission.update({
      where: { id: submission.id },
      data: { status: "FAILED" },
    });

    const message =
      error instanceof Error ? error.message : "Evaluation failed";
    return { success: false, error: message };
  }
}

import type { TransactionClient } from "@/app/generated/prisma/internal/prismaNamespace";

async function handlePhasePass(
  userId: string,
  questionId: string,
  phaseOrder: number,
  xpReward: number
) {
  // Get total phase count
  const totalPhases = await prisma.phase.count({ where: { questionId } });
  const isLastPhase = phaseOrder === totalPhases;

  await prisma.$transaction(async (tx: TransactionClient) => {
    // Upsert progress
    const progress = await tx.progress.upsert({
      where: { userId_questionId: { userId, questionId } },
      create: {
        userId,
        questionId,
        currentPhase: isLastPhase ? phaseOrder : phaseOrder + 1,
        completedPhases: [phaseOrder],
        status: isLastPhase ? "COMPLETED" : "IN_PROGRESS",
        totalXp: xpReward,
        completedAt: isLastPhase ? new Date() : null,
      },
      update: {
        currentPhase: isLastPhase ? phaseOrder : phaseOrder + 1,
        completedPhases: { push: phaseOrder },
        status: isLastPhase ? "COMPLETED" : "IN_PROGRESS",
        totalXp: { increment: xpReward },
        completedAt: isLastPhase ? new Date() : null,
      },
    });

    // Update user stats with streak logic
    const existingStats = await tx.userStats.findUnique({
      where: { userId },
      select: { currentStreak: true, longestStreak: true, lastActiveAt: true, totalXp: true },
    });

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let newStreak = 1;
    if (existingStats) {
      const last = existingStats.lastActiveAt;
      const lastDay = new Date(last.getFullYear(), last.getMonth(), last.getDate());
      const dayDiff = Math.round((today.getTime() - lastDay.getTime()) / 86_400_000);

      if (dayDiff === 0) {
        // Already active today — keep streak unchanged
        newStreak = existingStats.currentStreak;
      } else if (dayDiff === 1) {
        // Active yesterday — extend streak
        newStreak = existingStats.currentStreak + 1;
      } else {
        // Gap > 1 day — reset to 1
        newStreak = 1;
      }
    }

    const newLongest = Math.max(newStreak, existingStats?.longestStreak ?? 0);

    await tx.userStats.upsert({
      where: { userId },
      create: {
        userId,
        totalXp: xpReward,
        currentStreak: 1,
        longestStreak: 1,
        lastActiveAt: now,
      },
      update: {
        totalXp: { increment: xpReward },
        currentStreak: newStreak,
        longestStreak: newLongest,
        lastActiveAt: now,
      },
    });

    // If question completed, increment track counter
    if (isLastPhase) {
      const question = await tx.designQuestion.findUnique({
        where: { id: questionId },
        select: { track: true },
      });
      if (question) {
        const field =
          question.track === "LLD" ? "lldCompleted" : "hldCompleted";
        await tx.userStats.update({
          where: { userId },
          data: { [field]: { increment: 1 } },
        });
      }
    }

    return progress;
  });
}
