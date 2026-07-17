"use client";

import { useCallback, useState, useTransition } from "react";
import { CheckCircle2, Lock, Circle, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { PhaseSubmissionEditor } from "./PhaseSubmissionEditor";
import { EvaluationFeedback } from "./EvaluationFeedback";
import { PhaseProgressBar } from "./PhaseProgressBar";
import { PhaseExhaustedWalkthrough } from "./PhaseExhaustedWalkthrough";
import { CompletionModal } from "./CompletionModal";
import { submitPhaseResponse } from "@/app/actions/evaluation";
import { ApiKeySettings } from "@/components/shared/ApiKeySettings";
import type { DesignQuestion, PhaseClient } from "@/types/curriculum";
import type { QuestionProgress } from "@/types/progress";
import type { EvaluationResult, PhaseSubmissionState } from "@/types/evaluation";
import { DifficultyBadge, TrackBadge } from "@/components/ui/badge";
import { Badge } from "@/components/ui/badge";

interface QuestionWorkspaceProps {
  question: DesignQuestion;
  initialProgress: QuestionProgress | null;
  trackSlug: string;
}

export function QuestionWorkspace({
  question,
  initialProgress,
  trackSlug,
}: QuestionWorkspaceProps) {
  const [progress, setProgress] = useState<QuestionProgress>(
    initialProgress ?? {
      questionId: question.id,
      status: "NOT_STARTED",
      currentPhase: 1,
      completedPhases: [],
      exhaustedPhases: [],
      totalXp: 0,
      startedAt: null,
      completedAt: null,
      phaseProgresses: question.phases.map((p, i) => ({
        phaseOrder: p.order,
        phaseId: p.id,
        status: i === 0 ? "active" : "locked",
        attemptCount: 0,
        bestScore: null,
      })),
    }
  );

  // Show completion modal automatically if already completed on page load
  const [showCompletion, setShowCompletion] = useState(
    initialProgress?.status === "COMPLETED"
  );

  const [activePhaseOrder, setActivePhaseOrder] = useState(
    initialProgress?.currentPhase ?? 1
  );

  const [phaseStates, setPhaseStates] = useState<
    Record<number, PhaseSubmissionState>
  >(
    Object.fromEntries(
      question.phases.map((p) => [
        p.order,
        {
          status: "idle",
          attemptNumber:
            initialProgress?.phaseProgresses.find(
              (pp) => pp.phaseOrder === p.order
            )?.attemptCount ?? 0,
          lastEvaluation: null,
          error: null,
        },
      ])
    )
  );

  const [, startTransition] = useTransition();

  const activePhase = question.phases.find((p) => p.order === activePhaseOrder);

  const handleSubmit = useCallback(
    async (content: string, userApiConfig?: { provider: string; apiKey: string; model?: string } | null) => {
      if (!activePhase) return;

      setPhaseStates((prev) => ({
        ...prev,
        [activePhaseOrder]: {
          ...prev[activePhaseOrder],
          status: "evaluating",
          error: null,
        },
      }));

      startTransition(async () => {
        const result = await submitPhaseResponse(
          question.id,
          activePhase.id,
          content,
          userApiConfig ?? null
        );

        if (!result.success || !result.evaluation) {
          setPhaseStates((prev) => ({
            ...prev,
            [activePhaseOrder]: {
              ...prev[activePhaseOrder],
              status: "error",
              error: result.error ?? "Evaluation failed. Please try again.",
            },
          }));
          return;
        }

        const evaluation = result.evaluation;
        const newAttemptNumber =
          (phaseStates[activePhaseOrder]?.attemptNumber ?? 0) + 1;

        setPhaseStates((prev) => ({
          ...prev,
          [activePhaseOrder]: {
            status: "done",
            attemptNumber: newAttemptNumber,
            lastEvaluation: evaluation,
            error: null,
          },
        }));

        if (evaluation.pass) {
          // Unlock next phase
          const nextPhaseOrder = activePhaseOrder + 1;
          const hasNextPhase = question.phases.some(
            (p) => p.order === nextPhaseOrder
          );

          setProgress((prev) => ({
            ...prev,
            currentPhase: hasNextPhase ? nextPhaseOrder : activePhaseOrder,
            completedPhases: [...prev.completedPhases, activePhaseOrder],
            status: hasNextPhase ? "IN_PROGRESS" : "COMPLETED",
            totalXp: prev.totalXp + (activePhase.xpReward ?? 25),
            phaseProgresses: prev.phaseProgresses.map((pp) => {
              if (pp.phaseOrder === activePhaseOrder) {
                return { ...pp, status: "passed", bestScore: evaluation.score };
              }
              if (pp.phaseOrder === nextPhaseOrder) {
                return { ...pp, status: "active" };
              }
              return pp;
            }),
          }));

          if (hasNextPhase) {
            setTimeout(() => setActivePhaseOrder(nextPhaseOrder), 1500);
          } else {
            // Last phase passed — show completion modal after a short delay
            setTimeout(() => setShowCompletion(true), 800);
          }
        } else {
          setProgress((prev) => ({
            ...prev,
            phaseProgresses: prev.phaseProgresses.map((pp) =>
              pp.phaseOrder === activePhaseOrder
                ? { ...pp, status: "active", bestScore: evaluation.score }
                : pp
            ),
          }));
        }
      });
    },
    [activePhase, activePhaseOrder, question.id, question.phases, phaseStates]
  );

  const handleForceUnlock = useCallback((phaseOrder: number) => {
    const nextPhaseOrder = phaseOrder + 1;
    const hasNextPhase = question.phases.some((p) => p.order === nextPhaseOrder);
    setProgress((prev) => ({
      ...prev,
      currentPhase: hasNextPhase ? nextPhaseOrder : phaseOrder,
      exhaustedPhases: [...(prev.exhaustedPhases ?? []), phaseOrder],
      status: hasNextPhase ? "IN_PROGRESS" : "COMPLETED",
      phaseProgresses: prev.phaseProgresses.map((pp) => {
        if (pp.phaseOrder === phaseOrder) return { ...pp, status: "exhausted" as const };
        if (pp.phaseOrder === nextPhaseOrder) return { ...pp, status: "active" as const };
        return pp;
      }),
    }));
    if (hasNextPhase) {
      setTimeout(() => setActivePhaseOrder(nextPhaseOrder), 400);
    } else {
      // Last phase exhausted — also a completion, show modal
      setTimeout(() => setShowCompletion(true), 600);
    }
  }, [question.phases]);

  const completedCount = progress.completedPhases.length + (progress.exhaustedPhases?.length ?? 0);
  const totalPhases = question.phases.length;
  const progressPct = Math.round((completedCount / totalPhases) * 100);

  return (
    <div className="min-h-screen bg-[#0F1117]">
      {/* Completion modal */}
      {showCompletion && (
        <CompletionModal
          questionTitle={question.title}
          totalXp={progress.totalXp}
          exhaustedPhases={progress.exhaustedPhases ?? []}
          totalPhases={totalPhases}
          trackSlug={trackSlug}
          onClose={() => setShowCompletion(false)}
        />
      )}
      {/* Header */}
      <div className="border-b border-[#2D3148] bg-[#0F1117]/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <TrackBadge track={question.track} />
                <DifficultyBadge difficulty={question.difficulty} />
                <span className="text-slate-500 text-xs">
                  ~{question.estimatedMin} min
                </span>
                <span className="text-slate-500 text-xs">
                  {question.xpTotal} XP total
                </span>
              </div>
              <h1 className="text-xl font-semibold text-slate-100 truncate">
                {question.title}
              </h1>
            </div>
            <div className="text-right shrink-0 flex items-center gap-3">
              <ApiKeySettings />
              <div>
                <div className="text-xs text-slate-400 mb-1">
                  Phase {completedCount}/{totalPhases} complete
                </div>
                <div className="text-sm font-medium text-indigo-400">
                  +{progress.totalXp} XP earned
                </div>
              </div>
            </div>
          </div>
          <div className="mt-3">
            <PhaseProgressBar
              phases={question.phases}
              phaseProgresses={progress.phaseProgresses}
              activePhaseOrder={activePhaseOrder}
              onSelectPhase={(order) => {
                // Only allow selecting completed phases or active phase
                const pp = progress.phaseProgresses.find(
                  (p) => p.phaseOrder === order
                );
                if (pp?.status !== "locked") {
                  setActivePhaseOrder(order);
                }
              }}
              progressPct={progressPct}
            />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          {/* Phase list sidebar */}
          <div className="order-2 lg:order-1">
            <div className="sticky top-[120px]">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Phases
              </h2>
              <div className="space-y-1">
                {question.phases.map((phase) => {
                  const pp = progress.phaseProgresses.find(
                    (p) => p.phaseOrder === phase.order
                  );
                  const isActive = phase.order === activePhaseOrder;
                  const isPassed = pp?.status === "passed";
                  const isExhausted = pp?.status === "exhausted";
                  const isLocked = pp?.status === "locked";

                  return (
                    <button
                      key={phase.id}
                      onClick={() => !isLocked && setActivePhaseOrder(phase.order)}
                      disabled={isLocked}
                      className={cn(
                        "w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 transition-colors text-sm",
                        isActive && !isPassed && !isExhausted &&
                          "bg-indigo-600/20 border border-indigo-600/40 text-indigo-300",
                        isPassed &&
                          "bg-emerald-600/10 border border-emerald-600/20 text-emerald-300",
                        isExhausted &&
                          "bg-amber-600/10 border border-amber-600/20 text-amber-300",
                        isLocked &&
                          "opacity-40 cursor-not-allowed text-slate-500",
                        !isActive && !isPassed && !isExhausted && !isLocked &&
                          "hover:bg-[#1A1D27] text-slate-300 border border-transparent"
                      )}
                    >
                      <span className="shrink-0">
                        {isPassed ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        ) : isExhausted ? (
                          <CheckCircle2 className="h-4 w-4 text-amber-400" />
                        ) : isLocked ? (
                          <Lock className="h-4 w-4 text-slate-600" />
                        ) : (
                          <Circle
                            className={cn(
                              "h-4 w-4",
                              isActive ? "text-indigo-400" : "text-slate-500"
                            )}
                          />
                        )}
                      </span>
                      <span className="flex-1 truncate">
                        <span className="text-slate-500 mr-1.5">
                          {phase.order}.
                        </span>
                        {phase.title}
                      </span>
                      {isExhausted && (
                        <span className="text-xs text-amber-500 shrink-0">no XP</span>
                      )}
                      {pp?.bestScore !== null && pp?.bestScore !== undefined && (
                        <span
                          className={cn(
                            "text-xs font-mono shrink-0",
                            pp.bestScore >= phase.passThreshold
                              ? "text-emerald-400"
                              : "text-amber-400"
                          )}
                        >
                          {pp.bestScore}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Active phase panel */}
          <div className="order-1 lg:order-2">
            {activePhase && (
              <PhasePanel
                phase={activePhase}
                state={phaseStates[activePhaseOrder]}
                onSubmit={handleSubmit}
                onForceUnlock={handleForceUnlock}
                questionId={question.id}
                isCompleted={progress.completedPhases.includes(activePhaseOrder)}
                isExhausted={(progress.exhaustedPhases ?? []).includes(activePhaseOrder)}
                isLastPhase={activePhaseOrder === question.phases.length}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Phase Panel ────────────────────────────────────────────────────────────

interface PhasePanelProps {
  phase: PhaseClient;
  state: PhaseSubmissionState;
  onSubmit: (content: string) => Promise<void>;
  onForceUnlock: (phaseOrder: number) => void;
  questionId: string;
  isCompleted: boolean;
  isExhausted: boolean;
  isLastPhase: boolean;
}

function PhasePanel({
  phase,
  state,
  onSubmit,
  onForceUnlock,
  questionId,
  isCompleted,
  isExhausted,
  isLastPhase,
}: PhasePanelProps) {
  const attemptsExhausted =
    !isCompleted && !isExhausted && state.attemptNumber >= phase.maxAttempts;

  return (
    <div className="space-y-4">
      {/* Phase instruction */}
      <div className="rounded-xl border border-[#2D3148] bg-[#1A1D27] p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-mono text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded">
            Phase {phase.order}
          </span>
          <h2 className="text-base font-semibold text-slate-100">{phase.title}</h2>
          <div className="ml-auto flex items-center gap-2">
            {isExhausted && (
              <span className="text-xs text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                needed help
              </span>
            )}
            <span className="text-xs text-slate-500">
              {isExhausted ? "0" : `+${phase.xpReward}`} XP
            </span>
          </div>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
          {phase.instruction}
        </p>
        <div className="mt-3 pt-3 border-t border-[#2D3148] flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Pass threshold: {phase.passThreshold}/100 · Max attempts:{" "}
            {phase.maxAttempts}
          </span>
          {state.attemptNumber > 0 && (
            <span className="text-xs text-slate-500">
              Attempt {state.attemptNumber}/{phase.maxAttempts}
            </span>
          )}
        </div>
      </div>

      {/* Submission editor — hide when exhausted or completed */}
      {!isCompleted && !isExhausted && (
        <PhaseSubmissionEditor
          phase={phase}
          state={state}
          onSubmit={onSubmit}
          isCompleted={false}
        />
      )}

      {/* Evaluation feedback from last attempt */}
      {state.lastEvaluation && (
        <EvaluationFeedback
          evaluation={state.lastEvaluation}
          phase={phase}
          attemptNumber={state.attemptNumber}
          isLastPhase={isLastPhase}
        />
      )}

      {/* Exhausted — show walkthrough and force-unlock */}
      {attemptsExhausted && (
        <PhaseExhaustedWalkthrough
          questionId={questionId}
          phaseOrder={phase.order}
          phaseTitle={phase.title}
          walkthroughText={phase.walkthroughText}
          isLastPhase={isLastPhase}
          onUnlocked={() => onForceUnlock(phase.order)}
        />
      )}

      {/* Already force-unlocked (exhausted) banner */}
      {isExhausted && !state.lastEvaluation && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-amber-400 shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-300">
              Proceeded after using all attempts
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              No XP was awarded for this phase. Review the walkthrough to fill the gaps.
            </p>
          </div>
        </div>
      )}

      {/* Normal completed state */}
      {isCompleted && !state.lastEvaluation && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <div>
            <p className="text-sm font-medium text-emerald-300">Phase completed!</p>
            <p className="text-xs text-slate-400 mt-0.5">
              You have already passed this phase.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
