import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import { Brain, Code2, CheckCircle2, Clock, Star, Flame, ArrowRight, Circle, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DifficultyBadge, TrackBadge } from "@/components/ui/badge";
import { UserMenu } from "@/components/shared/UserMenu";
import { formatXP } from "@/lib/utils";

export default async function ProgressPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;
  const isAdmin = (session.user as { isAdmin?: boolean }).isAdmin ?? false;

  // Fetch all questions with user progress
  const [questions, stats, userProgresses] = await Promise.all([
    prisma.designQuestion.findMany({
      orderBy: [{ track: "asc" }, { difficulty: "asc" }],
      select: {
        id: true,
        title: true,
        track: true,
        difficulty: true,
        estimatedMin: true,
        xpTotal: true,
        tags: true,
        phases: { select: { id: true } },
      },
    }),
    prisma.userStats.findUnique({ where: { userId } }),
    prisma.progress.findMany({
      where: { userId },
      select: {
        questionId: true,
        status: true,
        currentPhase: true,
        completedPhases: true,
        exhaustedPhases: true,
        totalXp: true,
        startedAt: true,
        completedAt: true,
      },
    }),
  ]);

  const progressByQuestion = Object.fromEntries(
    userProgresses.map((p) => [p.questionId, p])
  );

  const lldQuestions = questions.filter((q) => q.track === "LLD");
  const hldQuestions = questions.filter((q) => q.track === "HLD");

  const lldCompleted = lldQuestions.filter(
    (q) => progressByQuestion[q.id]?.status === "COMPLETED"
  ).length;
  const hldCompleted = hldQuestions.filter(
    (q) => progressByQuestion[q.id]?.status === "COMPLETED"
  ).length;
  const totalXp = userProgresses.reduce((sum, p) => sum + p.totalXp, 0);

  return (
    <div className="min-h-screen bg-[#0F1117]">
      {/* Nav */}
      <nav className="border-b border-[#2D3148]/50 px-4 py-3 sticky top-0 bg-[#0F1117]/80 backdrop-blur-sm z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Brain className="h-5 w-5 text-indigo-400" />
            <span className="font-semibold text-slate-100 hidden sm:block">SystemDesignLearner</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm text-slate-400 hover:text-slate-200">Dashboard</Link>
            {session.user.email && (
              <UserMenu name={session.user.name ?? null} email={session.user.email} isAdmin={isAdmin} />
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">My Progress</h1>
          <p className="text-slate-400 text-sm mt-1">Track your journey across all questions</p>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: <Star className="h-4 w-4 text-amber-400" />, label: "Total XP", value: formatXP(totalXp) },
            { icon: <Flame className="h-4 w-4 text-orange-400" />, label: "Day streak", value: `${stats?.currentStreak ?? 0}d` },
            { icon: <Code2 className="h-4 w-4 text-violet-400" />, label: "LLD done", value: `${lldCompleted}/${lldQuestions.length}` },
            { icon: <Brain className="h-4 w-4 text-cyan-400" />, label: "HLD done", value: `${hldCompleted}/${hldQuestions.length}` },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">{s.icon}<span className="text-xs text-slate-500">{s.label}</span></div>
                <div className="text-2xl font-bold text-slate-100">{s.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* LLD track */}
        <TrackSection
          title="Low Level Design"
          trackSlug="lld"
          color="violet"
          icon={<Code2 className="h-4 w-4 text-violet-400" />}
          questions={lldQuestions}
          progressByQuestion={progressByQuestion}
        />

        {/* HLD track */}
        <TrackSection
          title="High Level Design"
          trackSlug="hld"
          color="cyan"
          icon={<Brain className="h-4 w-4 text-cyan-400" />}
          questions={hldQuestions}
          progressByQuestion={progressByQuestion}
        />
      </div>
    </div>
  );
}

type QuestionItem = {
  id: string;
  title: string;
  track: string;
  difficulty: string;
  estimatedMin: number;
  xpTotal: number;
  tags: string[];
  phases: { id: string }[];
};

type ProgressRecord = {
  questionId: string;
  status: string;
  currentPhase: number;
  completedPhases: number[];
  exhaustedPhases: number[];
  totalXp: number;
  startedAt: Date | null;
  completedAt: Date | null;
};

function TrackSection({
  title, trackSlug, color, icon, questions, progressByQuestion,
}: {
  title: string;
  trackSlug: string;
  color: "violet" | "cyan";
  icon: React.ReactNode;
  questions: QuestionItem[];
  progressByQuestion: Record<string, ProgressRecord>;
}) {
  const completed = questions.filter((q) => progressByQuestion[q.id]?.status === "COMPLETED").length;
  const pct = questions.length ? Math.round((completed / questions.length) * 100) : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
          <span className="text-sm text-slate-500">{completed}/{questions.length}</span>
        </div>
        <span className={`text-sm font-medium ${color === "violet" ? "text-violet-400" : "text-cyan-400"}`}>
          {pct}%
        </span>
      </div>
      <Progress value={pct} className="mb-5 h-1.5" />

      <div className="space-y-2">
        {questions.map((q) => {
          const p = progressByQuestion[q.id];
          const status = p?.status ?? "NOT_STARTED";
          const totalPhases = q.phases.length;
          const donePhasePct = p
            ? Math.round(((p.completedPhases.length + (p.exhaustedPhases?.length ?? 0)) / totalPhases) * 100)
            : 0;

          return (
            <Link
              key={q.id}
              href={`/tracks/${trackSlug}/questions/${q.id}`}
              className="flex items-center gap-4 p-4 rounded-xl border border-[#2D3148] bg-[#1A1D27] hover:border-indigo-500/30 transition-colors group"
            >
              {/* Status icon */}
              <div className="shrink-0">
                {status === "COMPLETED" ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                ) : status === "IN_PROGRESS" ? (
                  <Circle className="h-5 w-5 text-indigo-400" />
                ) : (
                  <Circle className="h-5 w-5 text-slate-700" />
                )}
              </div>

              {/* Question info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={`font-medium text-sm ${
                    status === "COMPLETED" ? "text-emerald-300" :
                    status === "IN_PROGRESS" ? "text-slate-100" :
                    "text-slate-400"
                  }`}>
                    {q.title}
                  </span>
                  <DifficultyBadge difficulty={q.difficulty} />
                  {p?.exhaustedPhases && p.exhaustedPhases.length > 0 && (
                    <span className="flex items-center gap-1 text-xs text-amber-500">
                      <AlertTriangle className="h-3 w-3" />
                      {p.exhaustedPhases.length} walkthrough{p.exhaustedPhases.length > 1 ? "s" : ""} used
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-600">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />~{q.estimatedMin}m
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    {p ? `${p.totalXp}/${q.xpTotal} XP` : `${q.xpTotal} XP`}
                  </span>
                  {status === "IN_PROGRESS" && (
                    <span className="text-indigo-400">
                      Phase {p!.currentPhase}/{totalPhases}
                    </span>
                  )}
                </div>

                {status === "IN_PROGRESS" && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1 bg-[#2D3148] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${donePhasePct}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-600">{donePhasePct}%</span>
                  </div>
                )}
              </div>

              <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-indigo-400 transition-colors shrink-0" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
