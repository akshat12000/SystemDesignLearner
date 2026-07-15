"use client";

import { useState, useTransition } from "react";
import { AlertTriangle, BookOpen, ChevronRight, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { forceUnlockNextPhase } from "@/app/actions/forceUnlock";
import { cn } from "@/lib/utils";

interface PhaseExhaustedWalkthroughProps {
  questionId: string;
  phaseOrder: number;
  phaseTitle: string;
  walkthroughText: string | null;
  isLastPhase: boolean;
  onUnlocked: () => void;
}

export function PhaseExhaustedWalkthrough({
  questionId,
  phaseOrder,
  phaseTitle,
  walkthroughText,
  isLastPhase,
  onUnlocked,
}: PhaseExhaustedWalkthroughProps) {
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleProceed = () => {
    setError(null);
    startTransition(async () => {
      const result = await forceUnlockNextPhase(questionId, phaseOrder);
      if (!result.success) {
        setError(result.error ?? "Failed to proceed.");
        return;
      }
      onUnlocked();
    });
  };

  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5 shrink-0" />
        <div>
          <p className="font-semibold text-amber-300">All attempts exhausted</p>
          <p className="text-sm text-slate-400 mt-0.5">
            You&apos;ve used all {4} attempts on <span className="text-slate-300">{phaseTitle}</span>.
            Review the walkthrough below, then proceed — <span className="text-amber-400">no XP will be awarded</span> for this phase.
          </p>
        </div>
      </div>

      {/* Reveal walkthrough toggle */}
      {walkthroughText && (
        <div>
          <button
            onClick={() => setShowWalkthrough((v) => !v)}
            className="flex items-center gap-2 text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <BookOpen className="h-4 w-4" />
            {showWalkthrough ? "Hide" : "Show"} model answer walkthrough
            <ChevronRight
              className={cn(
                "h-4 w-4 transition-transform",
                showWalkthrough && "rotate-90"
              )}
            />
          </button>

          {showWalkthrough && (
            <div className="mt-3 rounded-lg bg-[#0F1117] border border-[#2D3148] p-5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
                What you should have covered
              </p>
              <div className="prose-walkthrough">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h2: ({ children }) => (
                      <h2 className="text-sm font-semibold text-slate-300 mt-4 mb-1.5 first:mt-0">{children}</h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mt-3 mb-1">{children}</h3>
                    ),
                    p: ({ children }) => (
                      <p className="text-sm text-slate-300 leading-relaxed mb-2">{children}</p>
                    ),
                    strong: ({ children }) => (
                      <strong className="text-slate-100 font-semibold">{children}</strong>
                    ),
                    ul: ({ children }) => (
                      <ul className="space-y-1 mb-3">{children}</ul>
                    ),
                    li: ({ children }) => (
                      <li className="text-sm text-slate-300 flex items-start gap-2">
                        <span className="text-indigo-400 mt-0.5 shrink-0">→</span>
                        <span>{children}</span>
                      </li>
                    ),
                    code: ({ children, className }) => {
                      const isBlock = className?.includes("language-");
                      return isBlock ? (
                        <code className="block bg-[#1A1D27] border border-[#2D3148] rounded-lg p-4 text-xs text-slate-300 font-mono leading-relaxed overflow-x-auto whitespace-pre my-3">
                          {children}
                        </code>
                      ) : (
                        <code className="bg-[#1A1D27] text-indigo-300 text-xs font-mono px-1.5 py-0.5 rounded">
                          {children}
                        </code>
                      );
                    },
                    pre: ({ children }) => <>{children}</>,
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-2 border-indigo-500/40 pl-3 text-slate-400 italic my-2">
                        {children}
                      </blockquote>
                    ),
                  }}
                >
                  {walkthroughText}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Confirmation + proceed */}
      <div className="pt-1 border-t border-amber-500/20">
        {!confirmed ? (
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="confirm-exhausted"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="h-4 w-4 rounded border-slate-600 bg-[#0F1117] accent-amber-500 cursor-pointer"
            />
            <label
              htmlFor="confirm-exhausted"
              className="text-sm text-slate-400 cursor-pointer select-none"
            >
              I&apos;ve reviewed the walkthrough and understand what I missed
            </label>
          </div>
        ) : (
          <div className="flex items-center gap-3 flex-wrap">
            <Button
              onClick={handleProceed}
              loading={isPending}
              className="bg-amber-600/20 text-amber-300 border border-amber-600/40 hover:bg-amber-600/30"
            >
              {isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Unlocking...</>
              ) : isLastPhase ? (
                "Mark question complete (0 XP)"
              ) : (
                "Proceed to next phase (0 XP)"
              )}
            </Button>
            <button
              onClick={() => setConfirmed(false)}
              className="text-xs text-slate-500 hover:text-slate-400"
            >
              Go back
            </button>
          </div>
        )}

        {!confirmed && (
          <button
            onClick={() => setConfirmed(true)}
            disabled={!showWalkthrough && !!walkthroughText}
            className={cn(
              "mt-3 text-sm font-medium transition-colors",
              showWalkthrough || !walkthroughText
                ? "text-amber-400 hover:text-amber-300 cursor-pointer"
                : "text-slate-600 cursor-not-allowed"
            )}
          >
            {showWalkthrough || !walkthroughText
              ? "I've reviewed it → proceed anyway"
              : "You must open the walkthrough first"}
          </button>
        )}
      </div>

      {error && (
        <p className="text-sm text-rose-400 bg-rose-400/10 border border-rose-400/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
    </div>
  );
}
