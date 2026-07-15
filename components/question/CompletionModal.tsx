"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import { CheckCircle2, ArrowRight, RotateCcw, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CompletionModalProps {
  questionTitle: string;
  totalXp: number;
  exhaustedPhases: number[];
  totalPhases: number;
  trackSlug: string;
  onClose: () => void;
}

export function CompletionModal({
  questionTitle,
  totalXp,
  exhaustedPhases,
  totalPhases,
  trackSlug,
  onClose,
}: CompletionModalProps) {
  const router = useRouter();
  const firedRef = useRef(false);

  const passedPhases = totalPhases - exhaustedPhases.length;
  const isPerfect = exhaustedPhases.length === 0;

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;

    const fire = (opts: confetti.Options) =>
      confetti({ zIndex: 9999, ...opts });

    if (isPerfect) {
      // Burst from both sides
      setTimeout(() => fire({ particleCount: 80, angle: 60, spread: 70, origin: { x: 0, y: 0.65 } }), 0);
      setTimeout(() => fire({ particleCount: 80, angle: 120, spread: 70, origin: { x: 1, y: 0.65 } }), 150);
      setTimeout(() => fire({ particleCount: 60, angle: 90, spread: 100, origin: { x: 0.5, y: 0.5 }, gravity: 0.6 }), 400);
    } else {
      // Single centre burst for partial completion
      setTimeout(() => fire({ particleCount: 60, spread: 80, origin: { x: 0.5, y: 0.6 }, colors: ["#f59e0b", "#d97706", "#fbbf24"] }), 0);
    }
  }, [isPerfect]);

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={cn(
        "relative w-full max-w-md rounded-2xl border p-8 shadow-2xl",
        isPerfect
          ? "border-emerald-500/40 bg-[#111827]"
          : "border-amber-500/30 bg-[#111827]"
      )}>
        {/* Glow ring */}
        <div className={cn(
          "absolute -inset-px rounded-2xl opacity-30 pointer-events-none",
          isPerfect
            ? "bg-gradient-to-b from-emerald-500/20 to-transparent"
            : "bg-gradient-to-b from-amber-500/20 to-transparent"
        )} />

        {/* Icon */}
        <div className="flex justify-center mb-5">
          <div className={cn(
            "w-20 h-20 rounded-full flex items-center justify-center",
            isPerfect
              ? "bg-emerald-500/10 border border-emerald-500/30"
              : "bg-amber-500/10 border border-amber-500/30"
          )}>
            {isPerfect
              ? <Trophy className="h-9 w-9 text-emerald-400" />
              : <CheckCircle2 className="h-9 w-9 text-amber-400" />
            }
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-100 mb-1">
            {isPerfect ? "Perfect completion! 🎉" : "Question complete!"}
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            {isPerfect
              ? "You passed all phases on your own. That's the real deal."
              : `You completed ${passedPhases}/${totalPhases} phases independently.`
            }
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <StatTile
            label="XP earned"
            value={`+${totalXp}`}
            color={isPerfect ? "emerald" : "amber"}
          />
          <StatTile
            label="Phases passed"
            value={`${passedPhases}/${totalPhases}`}
            color={isPerfect ? "emerald" : "amber"}
          />
          <StatTile
            label="Walkthroughs"
            value={exhaustedPhases.length === 0 ? "None needed" : `${exhaustedPhases.length} used`}
            color={exhaustedPhases.length === 0 ? "emerald" : "amber"}
          />
        </div>

        {/* Question title */}
        <div className="mb-6 rounded-lg bg-[#0F1117] border border-[#2D3148] px-4 py-3">
          <p className="text-xs text-slate-500 mb-0.5">Completed</p>
          <p className="text-sm font-medium text-slate-200">{questionTitle}</p>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <Button
            className="w-full"
            size="lg"
            onClick={() => router.push(`/tracks/${trackSlug}`)}
          >
            Next question
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => router.push("/dashboard")}
          >
            Back to dashboard
          </Button>
          <button
            onClick={onClose}
            className="w-full text-center text-xs text-slate-600 hover:text-slate-400 pt-1 transition-colors"
          >
            Stay on this page
          </button>
        </div>
      </div>
    </div>
  );
}

function StatTile({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: "emerald" | "amber";
}) {
  return (
    <div className={cn(
      "rounded-lg border px-3 py-3 text-center",
      color === "emerald"
        ? "border-emerald-500/20 bg-emerald-500/5"
        : "border-amber-500/20 bg-amber-500/5"
    )}>
      <p className={cn(
        "text-lg font-bold",
        color === "emerald" ? "text-emerald-400" : "text-amber-400"
      )}>
        {value}
      </p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}
