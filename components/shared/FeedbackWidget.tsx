"use client";

import { useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import { MessageSquarePlus, X, Star, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { submitFeedback } from "@/app/actions/feedback";

const CATEGORIES = [
  { value: "praise", label: "👍 Praise" },
  { value: "bug", label: "🐛 Bug report" },
  { value: "suggestion", label: "💡 Suggestion" },
  { value: "content", label: "📚 Content issue" },
];

export function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [category, setCategory] = useState("suggestion");
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();

  const reset = () => {
    setRating(0); setHovered(0); setCategory("suggestion");
    setMessage(""); setDone(false); setError(null);
  };

  const handleSubmit = () => {
    setError(null);
    startTransition(async () => {
      const result = await submitFeedback({ rating, category, message, page: pathname });
      if (!result.success) { setError(result.error ?? "Failed"); return; }
      setDone(true);
      setTimeout(() => { setOpen(false); reset(); }, 2000);
    });
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => { reset(); setOpen(true); }}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg hover:bg-indigo-500 transition-all hover:scale-105 active:scale-95"
        title="Send feedback"
      >
        <MessageSquarePlus className="h-4 w-4" />
        <span className="hidden sm:inline">Feedback</span>
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="w-full max-w-md rounded-2xl border border-[#2D3148] bg-[#1A1D27] p-6 shadow-2xl">
            {done ? (
              <div className="flex flex-col items-center gap-3 py-6">
                <CheckCircle2 className="h-12 w-12 text-emerald-400" />
                <p className="text-lg font-semibold text-slate-100">Thanks for your feedback!</p>
                <p className="text-sm text-slate-400">It helps us improve the platform.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-base font-semibold text-slate-100">Share feedback</h2>
                  <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-slate-300">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Stars */}
                <div className="mb-4">
                  <p className="text-xs text-slate-400 mb-2">Overall rating</p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        onMouseEnter={() => setHovered(n)}
                        onMouseLeave={() => setHovered(0)}
                        onClick={() => setRating(n)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star className={cn(
                          "h-7 w-7 transition-colors",
                          n <= (hovered || rating)
                            ? "text-amber-400 fill-amber-400"
                            : "text-slate-700"
                        )} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category */}
                <div className="mb-4">
                  <p className="text-xs text-slate-400 mb-2">Category</p>
                  <div className="grid grid-cols-2 gap-2">
                    {CATEGORIES.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => setCategory(c.value)}
                        className={cn(
                          "px-3 py-2 rounded-lg text-sm border transition-colors text-left",
                          category === c.value
                            ? "border-indigo-500/50 bg-indigo-500/10 text-indigo-300"
                            : "border-[#2D3148] text-slate-400 hover:border-slate-500"
                        )}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <div className="mb-5">
                  <p className="text-xs text-slate-400 mb-2">Your message</p>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us what you think, what's broken, or what could be better..."
                    className="w-full h-24 resize-none bg-[#0F1117] border border-[#2D3148] rounded-lg p-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {error && (
                  <p className="text-sm text-rose-400 mb-3">{error}</p>
                )}

                <Button
                  onClick={handleSubmit}
                  disabled={isPending || rating === 0 || message.trim().length < 5}
                  loading={isPending}
                  className="w-full"
                >
                  {isPending ? <><Loader2 className="h-4 w-4 animate-spin" />Submitting...</> : "Submit feedback"}
                </Button>
                <p className="text-xs text-slate-600 mt-2 text-center">
                  Page: {pathname}
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
