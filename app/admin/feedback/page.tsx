import { prisma } from "@/lib/db/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Star, MessageSquare } from "lucide-react";

export const dynamic = "force-dynamic";

const CATEGORY_LABELS: Record<string, string> = {
  praise: "👍 Praise",
  bug: "🐛 Bug",
  suggestion: "💡 Suggestion",
  content: "📚 Content",
};

export default async function AdminFeedbackPage() {
  const feedbacks = await prisma.feedback.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { user: { select: { name: true, email: true } } },
  });

  const avgRating =
    feedbacks.length > 0
      ? (feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length).toFixed(1)
      : "—";

  const byCategory = feedbacks.reduce<Record<string, number>>((acc, f) => {
    acc[f.category] = (acc[f.category] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Feedback</h1>
          <p className="text-slate-400 text-sm mt-1">{feedbacks.length} responses</p>
        </div>
        <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2">
          <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
          <span className="text-xl font-bold text-amber-400">{avgRating}</span>
          <span className="text-slate-500 text-sm">avg</span>
        </div>
      </div>

      {/* Category breakdown */}
      <div className="grid grid-cols-4 gap-3">
        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
          <Card key={key}>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-slate-100">{byCategory[key] ?? 0}</div>
              <div className="text-xs text-slate-500 mt-1">{label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Feedback list */}
      <div className="space-y-3">
        {feedbacks.length === 0 && (
          <div className="text-center py-16 text-slate-600">
            <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-30" />
            No feedback yet
          </div>
        )}
        {feedbacks.map((f) => (
          <Card key={f.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    {/* Stars */}
                    <div className="flex">
                      {[1,2,3,4,5].map((n) => (
                        <Star key={n} className={`h-3.5 w-3.5 ${n <= f.rating ? "text-amber-400 fill-amber-400" : "text-slate-700"}`} />
                      ))}
                    </div>
                    <span className="text-xs bg-[#2D3148] text-slate-300 px-2 py-0.5 rounded">
                      {CATEGORY_LABELS[f.category] ?? f.category}
                    </span>
                    {f.page && (
                      <span className="text-xs text-slate-600 font-mono">{f.page}</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">{f.message}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-slate-400">
                    {f.user?.name ?? f.user?.email ?? "Anonymous"}
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {f.createdAt.toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
