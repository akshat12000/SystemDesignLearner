import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import { Brain, Code2, ArrowRight, Lock, Clock, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/shared/UserMenu";
import { DifficultyBadge, TrackBadge } from "@/components/ui/badge";

export default async function TracksPage() {
  const session = await auth();
  const isSignedIn = !!session?.user?.id;
  const isAdmin = isSignedIn
    ? ((session.user as { isAdmin?: boolean }).isAdmin ?? false)
    : false;

  const tracks = await prisma.track.findMany({
    orderBy: { order: "asc" },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          _count: { select: { questions: true, lessons: true } },
        },
      },
    },
  });

  // Get user progress if signed in
  const progressMap: Record<string, number> = {};
  if (isSignedIn && session.user.id) {
    const progresses = await prisma.progress.findMany({
      where: { userId: session.user.id, status: "COMPLETED" },
      select: { questionId: true },
    });
    // Count per track via questions
    const completedIds = progresses.map((p) => p.questionId);
    if (completedIds.length > 0) {
      const questions = await prisma.designQuestion.findMany({
        where: { id: { in: completedIds } },
        select: { id: true, module: { select: { track: { select: { slug: true } } } } },
      });
      for (const q of questions) {
        const slug = q.module.track.slug;
        progressMap[slug] = (progressMap[slug] ?? 0) + 1;
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#0F1117]">
      {/* Nav */}
      <nav className="border-b border-[#2D3148]/50 px-4 py-3 sticky top-0 bg-[#0F1117]/80 backdrop-blur-sm z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Brain className="h-5 w-5 text-indigo-400" />
            <span className="font-semibold text-slate-100">SystemDesignLearner</span>
          </Link>
          <div className="flex items-center gap-3">
            {isSignedIn && session.user.email ? (
              <UserMenu
                name={session.user.name ?? null}
                email={session.user.email}
                isAdmin={isAdmin}
              />
            ) : (
              <Link href="/login">
                <Button size="sm">Sign in</Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-100 mb-2">Curriculum</h1>
          <p className="text-slate-400">
            Two tracks. 27 questions. Phase-by-phase AI evaluation.
          </p>
        </div>

        <div className="space-y-10">
          {tracks.map((track) => {
            const totalQuestions = track.modules.reduce(
              (sum, m) => sum + m._count.questions,
              0
            );
            const completed = progressMap[track.slug] ?? 0;
            const color = track.type === "LLD" ? "violet" : "cyan";

            return (
              <div key={track.id}>
                {/* Track header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        color === "violet"
                          ? "bg-violet-500/10 border border-violet-500/20"
                          : "bg-cyan-500/10 border border-cyan-500/20"
                      }`}
                    >
                      {track.type === "LLD" ? (
                        <Code2 className={`h-5 w-5 ${color === "violet" ? "text-violet-400" : "text-cyan-400"}`} />
                      ) : (
                        <Brain className={`h-5 w-5 ${color === "violet" ? "text-violet-400" : "text-cyan-400"}`} />
                      )}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-100">{track.title}</h2>
                      <p className="text-sm text-slate-500">{track.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    {isSignedIn && (
                      <span className="text-sm text-slate-500">
                        {completed}/{totalQuestions} completed
                      </span>
                    )}
                    <Link href={`/tracks/${track.slug}`}>
                      <Button variant="outline" size="sm">
                        {isSignedIn ? "Continue" : "Explore"}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Modules */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {track.modules.map((module) => (
                    <Link
                      key={module.id}
                      href={isSignedIn ? `/tracks/${track.slug}` : "/login"}
                      className="group"
                    >
                      <Card className="h-full hover:border-indigo-500/30 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <DifficultyBadge difficulty={module.difficulty} />
                            {!isSignedIn && (
                              <Lock className="h-3.5 w-3.5 text-slate-600" />
                            )}
                          </div>
                          <h3 className="text-sm font-medium text-slate-200 mb-1 group-hover:text-slate-100">
                            {module.title}
                          </h3>
                          <p className="text-xs text-slate-500 mb-3 line-clamp-2">
                            {module.description}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-slate-600">
                            {module._count.questions > 0 && (
                              <span className="flex items-center gap-1">
                                <Star className="h-3 w-3" />
                                {module._count.questions} questions
                              </span>
                            )}
                            {module._count.lessons > 0 && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {module._count.lessons} lessons
                              </span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {!isSignedIn && (
          <div className="mt-12 rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-8 text-center">
            <h3 className="text-lg font-semibold text-slate-100 mb-2">
              Ready to start?
            </h3>
            <p className="text-slate-400 text-sm mb-5">
              Create a free account to track progress and get AI feedback on every phase.
            </p>
            <Link href="/login">
              <Button size="lg">
                Get started free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
