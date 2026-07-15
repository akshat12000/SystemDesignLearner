import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import { ArrowRight, Clock, Star, Lock } from "lucide-react";
import { DifficultyBadge, TrackBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { enrollInTrack } from "@/app/actions/progress";

interface TrackPageProps {
  params: { trackSlug: string };
}

export default async function TrackPage({ params }: TrackPageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { trackSlug } = await params;
  const trackSlugUpper = trackSlug.toUpperCase() as "LLD" | "HLD";

  const track = await prisma.track.findUnique({
    where: { slug: trackSlug },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          questions: {
            select: {
              id: true,
              title: true,
              difficulty: true,
              estimatedMin: true,
              xpTotal: true,
              tags: true,
            },
            orderBy: { difficulty: "asc" },
          },
          lessons: { select: { id: true } },
        },
      },
    },
  });

  if (!track) redirect("/tracks");

  // Get user progress for questions in this track
  const userId = session.user.id!;
  const allQuestionIds = track.modules.flatMap((m) =>
    m.questions.map((q) => q.id)
  );

  const progresses = await prisma.progress.findMany({
    where: { userId, questionId: { in: allQuestionIds } },
    select: { questionId: true, status: true, currentPhase: true },
  });

  const progressMap = Object.fromEntries(
    progresses.map((p) => [p.questionId, p])
  );

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_trackId: { userId, trackId: track.id },
    },
  });

  return (
    <div className="min-h-screen bg-[#0F1117]">
      {/* Header */}
      <div className="border-b border-[#2D3148] bg-[#0F1117]">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <TrackBadge track={track.type} />
          <h1 className="text-3xl font-bold text-slate-100 mt-3 mb-2">
            {track.title}
          </h1>
          <p className="text-slate-400 max-w-2xl">{track.description}</p>
          {!enrollment && (
            <form
              action={async () => {
                "use server";
                await enrollInTrack(trackSlug);
              }}
              className="mt-4"
            >
              <Button type="submit">Enroll in this track</Button>
            </form>
          )}
        </div>
      </div>

      {/* Modules */}
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
        {track.modules.map((module) => (
          <div key={module.id}>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-lg font-semibold text-slate-100">
                {module.title}
              </h2>
              <DifficultyBadge difficulty={module.difficulty} />
              {module.isLocked && (
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <Lock className="h-3 w-3" /> Locked
                </span>
              )}
            </div>
            {module.description && (
              <p className="text-sm text-slate-400 mb-4">{module.description}</p>
            )}

            <div className="space-y-2">
              {module.questions.map((question, idx) => {
                const progress = progressMap[question.id];
                const isCompleted = progress?.status === "COMPLETED";
                const isInProgress = progress?.status === "IN_PROGRESS";

                return (
                  <Link
                    key={question.id}
                    href={`/tracks/${trackSlug}/questions/${question.id}`}
                    className="flex items-center gap-4 p-4 rounded-xl border border-[#2D3148] bg-[#1A1D27] hover:border-indigo-500/40 hover:bg-[#1E2233] transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#2D3148] flex items-center justify-center shrink-0 text-xs font-mono text-slate-400">
                      {isCompleted ? (
                        <span className="text-emerald-400">✓</span>
                      ) : (
                        idx + 1
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`font-medium text-sm ${
                            isCompleted
                              ? "text-emerald-300"
                              : "text-slate-200"
                          }`}
                        >
                          {question.title}
                        </span>
                        {isInProgress && (
                          <span className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.5 rounded">
                            Phase {progress.currentPhase}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <DifficultyBadge difficulty={question.difficulty} />
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <Clock className="h-3 w-3" />
                          {question.estimatedMin}m
                        </span>
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <Star className="h-3 w-3" />
                          {question.xpTotal} XP
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-indigo-400 transition-colors shrink-0" />
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
