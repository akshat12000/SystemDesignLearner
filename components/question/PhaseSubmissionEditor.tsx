"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PhaseClient } from "@/types/curriculum";
import type { PhaseSubmissionState } from "@/types/evaluation";
import { Loader2 } from "lucide-react";

interface PhaseSubmissionEditorProps {
  phase: PhaseClient;
  state: PhaseSubmissionState;
  onSubmit: (content: string) => Promise<void>;
  isCompleted: boolean;
}

export function PhaseSubmissionEditor({
  phase,
  state,
  onSubmit,
  isCompleted,
}: PhaseSubmissionEditorProps) {
  const [content, setContent] = useState("");
  const isEvaluating = state.status === "evaluating";
  const hasMaxAttempts = state.attemptNumber >= phase.maxAttempts;
  const canSubmit =
    !isCompleted &&
    !isEvaluating &&
    !hasMaxAttempts &&
    content.trim().length >= 50;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    await onSubmit(content);
  };

  return (
    <div className="rounded-xl border border-[#2D3148] bg-[#1A1D27]">
      <div className="p-4 border-b border-[#2D3148] flex items-center justify-between">
        <span className="text-sm font-medium text-slate-300">Your Response</span>
        <span className="text-xs text-slate-500">
          {content.length} characters
          {content.length < 50 && (
            <span className="text-amber-500/70 ml-1">(min 50)</span>
          )}
        </span>
      </div>

      <div className="p-4">
        {phase.editorType === "code" ? (
          <CodeEditor
            value={content}
            onChange={setContent}
            disabled={isEvaluating || isCompleted}
          />
        ) : (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isEvaluating || isCompleted || hasMaxAttempts}
            placeholder={getPlaceholder(phase.order, phase.title)}
            className={cn(
              "w-full min-h-[280px] resize-y bg-[#0F1117] border border-[#2D3148] rounded-lg p-4",
              "text-sm text-slate-200 placeholder:text-slate-600",
              "focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500",
              "font-mono leading-relaxed",
              (isEvaluating || isCompleted || hasMaxAttempts) && "opacity-60 cursor-not-allowed"
            )}
          />
        )}
      </div>

      <div className="px-4 pb-4 flex items-center justify-between gap-3">
        <div className="text-xs text-slate-500">
          {hasMaxAttempts ? (
            <span className="text-amber-500">
              Maximum attempts reached. Review feedback above.
            </span>
          ) : isCompleted ? (
            <span className="text-emerald-400">
              This phase is completed. Move to the next phase.
            </span>
          ) : (
            <span>
              Write your answer clearly. The AI evaluates the quality of your
              reasoning, not just keywords.
            </span>
          )}
        </div>

        {!isCompleted && !hasMaxAttempts && (
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            loading={isEvaluating}
            className="shrink-0"
          >
            {isEvaluating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Evaluating...
              </>
            ) : (
              "Submit for Evaluation"
            )}
          </Button>
        )}
      </div>

      {state.error && (
        <div className="mx-4 mb-4 rounded-lg bg-rose-500/10 border border-rose-500/20 px-4 py-3">
          <p className="text-sm text-rose-400">{state.error}</p>
        </div>
      )}
    </div>
  );
}

function getPlaceholder(phaseOrder: number, phaseTitle: string): string {
  const placeholders: Record<number, string> = {
    1: "List the functional requirements (what the system must do) and non-functional requirements (performance, reliability, scale).\n\nExample:\nFunctional:\n- Users can...\n- The system must...\n\nNon-functional:\n- Must handle X concurrent users\n- 99.9% availability\n...",
    2: "List all entities/classes you've identified and their key attributes.\n\nExample:\nUser: id, name, email, createdAt\nBook: id, title, author, isbn, status\n...\n\nFor each entity, briefly explain its responsibility.",
    3: "Describe the relationships between entities. Specify the type and cardinality.\n\nExample:\n- User HAS-MANY Reservations (1:N)\n- Reservation HAS-ONE Book (via foreign key)\n- LibraryCard IS-A Document\n...",
    4: "Write or describe your class diagram. You can use text notation or Mermaid classDiagram syntax.\n\nExample:\nclass Book {\n  -id: String\n  -status: BookStatus\n  +checkout(userId: String): void\n  +isAvailable(): boolean\n}",
    5: "Identify which design patterns you applied and WHY.\n\nExample:\nI used the Observer pattern for the notification system because...\nThe Factory pattern was applied to book creation because...\n\nExplain the problem each pattern solves in your design.",
    6: "Write the code skeleton — interfaces, abstract classes, and key method signatures.\n\nFocus on:\n- Public interfaces and their contracts\n- Key classes with method signatures\n- Custom exceptions for domain errors",
  };
  return placeholders[phaseOrder] ?? `Your answer for: ${phaseTitle}`;
}

// Lazy-loaded code editor for Phase 6
function CodeEditor({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  // Use a simple textarea for now — Monaco can be lazy-loaded
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      placeholder="// Write your code skeleton here\n// Focus on interfaces, class structure, and method signatures\n// No need to write full implementation\n\ninterface IBookRepository {\n  findById(id: string): Promise<Book | null>;\n  save(book: Book): Promise<void>;\n}"
      className={cn(
        "w-full min-h-[320px] resize-y bg-[#0F1117] border border-[#2D3148] rounded-lg p-4",
        "text-sm text-slate-200 placeholder:text-slate-600",
        "focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500",
        "font-mono leading-relaxed",
        disabled && "opacity-60 cursor-not-allowed"
      )}
    />
  );
}
