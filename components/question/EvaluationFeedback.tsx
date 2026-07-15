"use client";

import { CheckCircle2, XCircle, AlertTriangle, Lightbulb, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EvaluationResult } from "@/types/evaluation";
import type { PhaseClient } from "@/types/curriculum";

interface EvaluationFeedbackProps {
  evaluation: EvaluationResult;
  phase: PhaseClient;
  attemptNumber: number;
  isLastPhase?: boolean;
}

export function EvaluationFeedback({
  evaluation,
  phase,
  attemptNumber,
  isLastPhase = false,
}: EvaluationFeedbackProps) {
  const { score, pass, strengths, missingElements, misconceptions, targetedFeedback, hint, nextPhaseTeaser } = evaluation;

  return (
    <div
      className={cn(
        "rounded-xl border p-5 space-y-4",
        pass
          ? "border-emerald-500/30 bg-emerald-500/5"
          : "border-amber-500/30 bg-amber-500/5"
      )}
    >
      {/* Score header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {pass ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          ) : (
            <XCircle className="h-5 w-5 text-amber-400" />
          )}
          <div>
            <p
              className={cn(
                "font-semibold",
                pass ? "text-emerald-300" : "text-amber-300"
              )}
            >
              {pass ? "Phase Passed!" : "Not quite there yet"}
            </p>
            <p className="text-xs text-slate-400">
              Attempt {attemptNumber} of {phase.maxAttempts}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div
            className={cn(
              "text-3xl font-bold font-mono",
              pass ? "text-emerald-400" : score >= 40 ? "text-amber-400" : "text-rose-400"
            )}
          >
            {score}
          </div>
          <div className="text-xs text-slate-500">/ 100</div>
        </div>
      </div>

      {/* Score bar */}
      <div className="h-2 bg-[#2D3148] rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700",
            pass ? "bg-emerald-500" : score >= 40 ? "bg-amber-500" : "bg-rose-500"
          )}
          style={{ width: `${score}%` }}
        />
      </div>

      {/* Targeted feedback */}
      <div className="text-sm text-slate-300 leading-relaxed">
        {targetedFeedback}
      </div>

      {/* Strengths */}
      {strengths.length > 0 && (
        <FeedbackSection
          icon={<CheckCircle2 className="h-4 w-4 text-emerald-400" />}
          title="What you got right"
          items={strengths}
          itemColor="text-emerald-300"
          bgColor="bg-emerald-500/5"
          borderColor="border-emerald-500/10"
        />
      )}

      {/* Missing elements */}
      {missingElements.length > 0 && (
        <FeedbackSection
          icon={<AlertTriangle className="h-4 w-4 text-amber-400" />}
          title="Missing elements"
          items={missingElements}
          itemColor="text-amber-300"
          bgColor="bg-amber-500/5"
          borderColor="border-amber-500/10"
        />
      )}

      {/* Misconceptions — most important to flag */}
      {misconceptions.length > 0 && (
        <FeedbackSection
          icon={<XCircle className="h-4 w-4 text-rose-400" />}
          title="Misconceptions to address"
          items={misconceptions}
          itemColor="text-rose-300"
          bgColor="bg-rose-500/5"
          borderColor="border-rose-500/10"
        />
      )}

      {/* Hint — shown on attempt 3+ */}
      {hint && !pass && (
        <div className="rounded-lg border border-indigo-500/20 bg-indigo-500/5 p-4">
          <div className="flex items-start gap-2">
            <Lightbulb className="h-4 w-4 text-indigo-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-medium text-indigo-400 mb-1">Hint</p>
              <p className="text-sm text-slate-300">{hint}</p>
            </div>
          </div>
        </div>
      )}

      {/* Next phase teaser — only shown when there IS a next phase */}
      {nextPhaseTeaser && pass && !isLastPhase && (
        <div className="rounded-lg border border-emerald-500/10 bg-[#0F1117] p-4">
          <div className="flex items-start gap-2">
            <ChevronRight className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-medium text-emerald-400 mb-1">
                Next up — think about this:
              </p>
              <p className="text-sm text-slate-300 italic">{nextPhaseTeaser}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FeedbackSection({
  icon,
  title,
  items,
  itemColor,
  bgColor,
  borderColor,
}: {
  icon: React.ReactNode;
  title: string;
  items: string[];
  itemColor: string;
  bgColor: string;
  borderColor: string;
}) {
  return (
    <div className={cn("rounded-lg border p-4", bgColor, borderColor)}>
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
          {title}
        </span>
      </div>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className={cn("text-sm flex items-start gap-2", itemColor)}>
            <span className="mt-1 shrink-0">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
