"use client";

import { cn } from "@/lib/utils";
import type { PhaseClient } from "@/types/curriculum";
import type { PhaseProgress } from "@/types/progress";

interface PhaseProgressBarProps {
  phases: PhaseClient[];
  phaseProgresses: PhaseProgress[];
  activePhaseOrder: number;
  onSelectPhase: (order: number) => void;
  progressPct: number;
}

export function PhaseProgressBar({
  phases,
  phaseProgresses,
  activePhaseOrder,
  onSelectPhase,
  progressPct,
}: PhaseProgressBarProps) {
  return (
    <div className="flex items-center gap-1">
      {phases.map((phase, index) => {
        const pp = phaseProgresses.find((p) => p.phaseOrder === phase.order);
        const isActive = phase.order === activePhaseOrder;
        const isPassed = pp?.status === "passed";
        const isLocked = pp?.status === "locked";

        return (
          <div key={phase.id} className="flex items-center flex-1 min-w-0">
            <button
              onClick={() => !isLocked && onSelectPhase(phase.order)}
              disabled={isLocked}
              title={phase.title}
              className={cn(
                "flex-1 h-1.5 rounded-full transition-all",
                isPassed && "bg-emerald-500",
                isActive && !isPassed && "bg-indigo-500",
                !isActive && !isPassed && !isLocked && "bg-slate-600 hover:bg-slate-500",
                isLocked && "bg-slate-700/50 cursor-not-allowed"
              )}
            />
            {index < phases.length - 1 && (
              <div className="w-0.5 shrink-0" />
            )}
          </div>
        );
      })}
      <span className="text-xs text-slate-500 ml-2 shrink-0">{progressPct}%</span>
    </div>
  );
}
