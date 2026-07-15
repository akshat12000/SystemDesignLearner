import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { getQuestionProgress } from "@/app/actions/progress";
import { QuestionWorkspace } from "@/components/question/QuestionWorkspace";
import type { DesignQuestion, PhaseClient } from "@/types/curriculum";

interface QuestionPageProps {
  params: { trackSlug: string; questionId: string };
}

// Safe phase selector — strips AI internals before sending to client
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
  walkthroughText: true,  // shown only after attempts exhausted
};

export default async function QuestionPage({ params }: QuestionPageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { trackSlug, questionId } = await params;

  const question = await prisma.designQuestion.findUnique({
    where: { id: questionId },
    select: {
      id: true,
      title: true,
      description: true,
      track: true,
      difficulty: true,
      estimatedMin: true,
      tags: true,
      xpTotal: true,
      phases: {
        select: SAFE_PHASE_SELECT,
        orderBy: { order: "asc" },
      },
      module: {
        select: { trackId: true, track: { select: { slug: true } } },
      },
    },
  });

  if (!question) redirect(`/tracks/${trackSlug}`);

  // Verify this question belongs to this track
  if (question.module.track.slug !== trackSlug) {
    redirect(`/tracks/${trackSlug}`);
  }

  const progress = await getQuestionProgress(questionId);

  const safeQuestion: DesignQuestion = {
    id: question.id,
    moduleId: question.module.trackId,
    title: question.title,
    description: question.description,
    track: question.track,
    difficulty: question.difficulty,
    estimatedMin: question.estimatedMin,
    tags: question.tags,
    xpTotal: question.xpTotal,
    phases: question.phases as PhaseClient[],
  };

  return (
    <QuestionWorkspace question={safeQuestion} initialProgress={progress} trackSlug={trackSlug} />
  );
}

export async function generateMetadata({ params }: QuestionPageProps) {
  const { questionId } = await params;
  const question = await prisma.designQuestion.findUnique({
    where: { id: questionId },
    select: { title: true, track: true, difficulty: true },
  });
  if (!question) return {};
  return {
    title: `${question.title} — ${question.track} | SystemDesignLearner`,
  };
}
