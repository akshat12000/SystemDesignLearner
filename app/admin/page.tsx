import { prisma } from "@/lib/db/prisma";
import { Users, FileText, CheckCircle2, XCircle, Clock, Cpu } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - 7);

  const [
    totalUsers,
    activeToday,
    totalSubmissionsToday,
    passedToday,
    failedToday,
    completedQuestions,
    recentEvals,
    modelBreakdown,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.submission.findMany({
      where: { createdAt: { gte: startOfToday } },
      distinct: ["userId"],
      select: { userId: true },
    }).then((r) => r.length),
    prisma.submission.count({ where: { createdAt: { gte: startOfToday } } }),
    prisma.submission.count({ where: { createdAt: { gte: startOfToday }, status: "PASSED" } }),
    prisma.submission.count({ where: { createdAt: { gte: startOfToday }, status: "FAILED" } }),
    prisma.progress.count({ where: { status: "COMPLETED" } }),
    prisma.evaluation.findMany({
      take: 15,
      orderBy: { createdAt: "desc" },
      include: {
        submission: {
          include: {
            user: { select: { name: true, email: true } },
            question: { select: { title: true, track: true } },
            phase: { select: { title: true, order: true } },
          },
        },
      },
    }),
    prisma.evaluation.groupBy({
      by: ["modelUsed"],
      _count: true,
      orderBy: { _count: { modelUsed: "desc" } },
    }),
  ]);

  const passRate = totalSubmissionsToday > 0
    ? Math.round((passedToday / totalSubmissionsToday) * 100)
    : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Overview</h1>
        <p className="text-slate-400 text-sm mt-1">Real-time platform activity</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard icon={<Users className="h-4 w-4 text-indigo-400" />} label="Total users" value={totalUsers} />
        <StatCard icon={<Users className="h-4 w-4 text-emerald-400" />} label="Active today" value={activeToday} />
        <StatCard icon={<FileText className="h-4 w-4 text-slate-400" />} label="Submissions today" value={totalSubmissionsToday} />
        <StatCard icon={<CheckCircle2 className="h-4 w-4 text-emerald-400" />} label="Passed today" value={passedToday} />
        <StatCard icon={<XCircle className="h-4 w-4 text-rose-400" />} label="Failed today" value={failedToday} />
        <StatCard icon={<CheckCircle2 className="h-4 w-4 text-amber-400" />} label="Questions done" value={completedQuestions} />
      </div>

      <div className="grid lg:grid-cols-[1fr_280px] gap-6">
        {/* Recent evaluations */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              Recent Evaluations
              <span className="text-xs font-normal text-slate-500">Last 15</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#2D3148]">
                    {["User", "Question", "Phase", "Score", "Pass", "Model", "Time"].map((h) => (
                      <th key={h} className="px-4 py-2 text-left text-xs text-slate-500 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentEvals.map((ev) => (
                    <tr key={ev.id} className="border-b border-[#1A1D27] hover:bg-[#1A1D27]/50">
                      <td className="px-4 py-2.5 text-slate-300 max-w-[120px] truncate">
                        {ev.submission.user.name ?? ev.submission.user.email}
                      </td>
                      <td className="px-4 py-2.5 text-slate-400 max-w-[160px] truncate">
                        {ev.submission.question.title}
                      </td>
                      <td className="px-4 py-2.5 text-slate-500 whitespace-nowrap">
                        Ph {ev.submission.phase.order}
                      </td>
                      <td className="px-4 py-2.5 font-mono font-medium">
                        <span className={ev.score >= 60 ? "text-emerald-400" : "text-rose-400"}>
                          {ev.score}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        {ev.pass
                          ? <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          : <XCircle className="h-4 w-4 text-rose-400" />
                        }
                      </td>
                      <td className="px-4 py-2.5 text-slate-500 text-xs whitespace-nowrap">
                        {ev.modelUsed.split("/")[1] ?? ev.modelUsed}
                      </td>
                      <td className="px-4 py-2.5 text-slate-500 text-xs whitespace-nowrap">
                        <span title={ev.createdAt.toISOString()}>
                          {formatRelative(ev.createdAt)}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {recentEvals.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-slate-600">
                        No evaluations yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {/* Pass rate */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400">Today&apos;s pass rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-slate-100 mb-2">{passRate}%</div>
              <div className="h-2 bg-[#2D3148] rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{ width: `${passRate}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-500 mt-1.5">
                <span>{passedToday} passed</span>
                <span>{failedToday} failed</span>
              </div>
            </CardContent>
          </Card>

          {/* Model usage */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Cpu className="h-4 w-4 text-slate-500" />
                Model usage (all time)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {modelBreakdown.length === 0 && (
                <p className="text-sm text-slate-600">No evaluations yet</p>
              )}
              {modelBreakdown.map((m) => (
                <div key={m.modelUsed} className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 truncate max-w-[160px]">
                    {m.modelUsed}
                  </span>
                  <span className="text-xs font-mono text-slate-300 shrink-0">
                    {m._count}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-1.5">{icon}<span className="text-xs text-slate-500">{label}</span></div>
        <div className="text-2xl font-bold text-slate-100">{value.toLocaleString()}</div>
      </CardContent>
    </Card>
  );
}

function formatRelative(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}
