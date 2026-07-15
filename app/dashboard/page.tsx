import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDashboardData } from "@/app/actions/progress";
import { Brain, Code2, Flame, Star, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatXP } from "@/lib/utils";
import { UserMenu } from "@/components/shared/UserMenu";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const data = await getDashboardData();
  if (!data) redirect("/login");

  const isAdmin = (session.user as { isAdmin?: boolean }).isAdmin ?? false;

  const { stats, lldProgress, hldProgress } = data;
  const firstName = data.user.name?.split(" ")[0] ?? "there";

  const lldPct = lldProgress.totalQuestions
    ? Math.round((lldProgress.completedQuestions / lldProgress.totalQuestions) * 100)
    : 0;
  const hldPct = hldProgress.totalQuestions
    ? Math.round((hldProgress.completedQuestions / hldProgress.totalQuestions) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-[#0F1117]">
      {/* Top nav */}
      <nav className="border-b border-[#2D3148]/50 px-4 py-3 sticky top-0 bg-[#0F1117]/80 backdrop-blur-sm z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Brain className="h-5 w-5 text-indigo-400" />
            <span className="font-semibold text-slate-100 hidden sm:block">SystemDesignLearner</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/tracks/lld" className="text-sm text-slate-400 hover:text-slate-200 hidden sm:block">LLD</Link>
            <Link href="/tracks/hld" className="text-sm text-slate-400 hover:text-slate-200 hidden sm:block">HLD</Link>
            <ThemeToggle />
            {session.user.email && (
              <UserMenu
                name={data.user.name}
                email={session.user.email}
                isAdmin={isAdmin}
              />
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-100">
            Hey {firstName} 👋
          </h1>
          <p className="text-slate-400 mt-1">
            Ready to practice? Pick up where you left off.
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<Star className="h-4 w-4 text-amber-400" />} label="Total XP" value={formatXP(stats.totalXp)} color="amber" />
          <StatCard icon={<Flame className="h-4 w-4 text-orange-400" />} label="Day Streak" value={`${stats.currentStreak}d`} color="orange" />
          <StatCard icon={<Code2 className="h-4 w-4 text-violet-400" />} label="LLD Solved" value={`${stats.lldCompleted}`} color="violet" />
          <StatCard icon={<Brain className="h-4 w-4 text-cyan-400" />} label="HLD Solved" value={`${stats.hldCompleted}`} color="cyan" />
        </div>

        {/* Track progress */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <TrackProgressCard
            track="LLD"
            slug="lld"
            icon={<Code2 className="h-4 w-4 text-violet-400" />}
            progress={lldProgress}
            pct={lldPct}
            color="violet"
          />
          <TrackProgressCard
            track="HLD"
            slug="hld"
            icon={<Brain className="h-4 w-4 text-cyan-400" />}
            progress={hldProgress}
            pct={hldPct}
            color="cyan"
          />
        </div>

        {/* Quick actions */}
        <div className="rounded-xl border border-[#2D3148] bg-[#1A1D27] p-6">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Quick actions
          </h2>
          <div className="grid sm:grid-cols-3 gap-3">
            <Link href="/tracks/lld">
              <Button variant="secondary" className="w-full justify-between">
                Browse LLD Questions <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/tracks/hld">
              <Button variant="secondary" className="w-full justify-between">
                Browse HLD Questions <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/progress">
              <Button variant="secondary" className="w-full justify-between">
                View my progress <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: {
  icon: React.ReactNode; label: string; value: string;
  color: "amber" | "orange" | "violet" | "cyan";
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">{icon}<span className="text-xs text-slate-500">{label}</span></div>
        <div className="text-2xl font-bold text-slate-100">{value}</div>
      </CardContent>
    </Card>
  );
}

function TrackProgressCard({ track, slug, icon, progress, pct, color }: {
  track: string; slug: string; icon: React.ReactNode;
  progress: { completedQuestions: number; totalQuestions: number; totalXp: number };
  pct: number; color: "violet" | "cyan";
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <CardTitle className="text-base">{track} Track</CardTitle>
          </div>
          <span className="text-xs text-slate-500">{formatXP(progress.totalXp)} XP</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-slate-400">
            {progress.completedQuestions}/{progress.totalQuestions} questions
          </span>
          <span className="text-slate-300 font-medium">{pct}%</span>
        </div>
        <Progress value={pct} className="mb-4" />
        <Link href={`/tracks/${slug}`}>
          <Button variant="outline" size="sm" className="w-full">
            Continue {track} <ArrowRight className="h-3 w-3" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
