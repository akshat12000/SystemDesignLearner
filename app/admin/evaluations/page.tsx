import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminEvaluationsPage() {
  const evaluations = await prisma.evaluation.findMany({
    take: 100,
    orderBy: { createdAt: "desc" },
    include: {
      submission: {
        include: {
          user: { select: { name: true, email: true } },
          question: { select: { title: true, track: true, difficulty: true } },
          phase: { select: { title: true, order: true } },
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Evaluation Logs</h1>
        <p className="text-slate-400 text-sm mt-1">Last 100 AI evaluations</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2D3148]">
                  {["User", "Question", "Track", "Phase", "Attempt", "Score", "Pass", "Model", "Duration", "Time"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs text-slate-500 font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {evaluations.map((ev) => (
                  <tr key={ev.id} className="border-b border-[#1A1D27] hover:bg-[#1A1D27]/50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-slate-300 max-w-[130px] truncate block">
                        {ev.submission.user.name ?? ev.submission.user.email}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 max-w-[180px]">
                      <span className="truncate block">{ev.submission.question.title}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                        ev.submission.question.track === "LLD"
                          ? "bg-violet-500/10 text-violet-400"
                          : "bg-cyan-500/10 text-cyan-400"
                      }`}>
                        {ev.submission.question.track}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-xs">
                      Ph {ev.submission.phase.order} · {ev.submission.phase.title.substring(0, 15)}…
                    </td>
                    <td className="px-4 py-3 text-slate-500 font-mono">
                      #{ev.submission.attemptNumber}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-mono font-bold ${
                        ev.score >= 80 ? "text-emerald-400"
                        : ev.score >= 60 ? "text-amber-400"
                        : "text-rose-400"
                      }`}>
                        {ev.score}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {ev.pass
                        ? <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        : <XCircle className="h-4 w-4 text-rose-400" />}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {ev.modelUsed.split("/")[1] ?? ev.modelUsed}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {(ev.evaluationMs / 1000).toFixed(1)}s
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-xs whitespace-nowrap">
                      {ev.createdAt.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
