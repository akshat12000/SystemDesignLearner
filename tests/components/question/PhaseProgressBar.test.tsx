import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PhaseProgressBar } from "@/components/question/PhaseProgressBar";
import type { PhaseClient } from "@/types/curriculum";
import type { PhaseProgress } from "@/types/progress";

const PHASES: PhaseClient[] = [
  { id: "p1", questionId: "q1", order: 1, title: "Requirements", instruction: "", passThreshold: 60, maxAttempts: 4, xpReward: 25, editorType: "richtext", walkthroughText: null },
  { id: "p2", questionId: "q1", order: 2, title: "Entities", instruction: "", passThreshold: 60, maxAttempts: 4, xpReward: 25, editorType: "richtext", walkthroughText: null },
  { id: "p3", questionId: "q1", order: 3, title: "Relationships", instruction: "", passThreshold: 60, maxAttempts: 4, xpReward: 25, editorType: "richtext", walkthroughText: null },
];

const makeProgresses = (states: Array<PhaseProgress["status"]>): PhaseProgress[] =>
  PHASES.map((p, i) => ({
    phaseOrder: p.order,
    phaseId: p.id,
    status: states[i],
    attemptCount: 0,
    bestScore: states[i] === "passed" ? 80 : null,
  }));

describe("PhaseProgressBar", () => {
  it("renders one segment per phase", () => {
    const progresses = makeProgresses(["passed", "active", "locked"]);
    const { container } = render(
      <PhaseProgressBar
        phases={PHASES}
        phaseProgresses={progresses}
        activePhaseOrder={2}
        onSelectPhase={vi.fn()}
        progressPct={33}
      />
    );
    // One button per phase
    const buttons = container.querySelectorAll("button");
    expect(buttons).toHaveLength(3);
  });

  it("shows percentage label", () => {
    const progresses = makeProgresses(["passed", "active", "locked"]);
    render(
      <PhaseProgressBar
        phases={PHASES}
        phaseProgresses={progresses}
        activePhaseOrder={2}
        onSelectPhase={vi.fn()}
        progressPct={67}
      />
    );
    expect(screen.getByText("67%")).toBeInTheDocument();
  });

  it("calls onSelectPhase when clicking a non-locked phase", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const progresses = makeProgresses(["passed", "active", "locked"]);
    const { container } = render(
      <PhaseProgressBar
        phases={PHASES}
        phaseProgresses={progresses}
        activePhaseOrder={2}
        onSelectPhase={onSelect}
        progressPct={33}
      />
    );
    const buttons = container.querySelectorAll("button");
    await user.click(buttons[0]); // phase 1 is passed — clickable
    expect(onSelect).toHaveBeenCalledWith(1);
  });

  it("does not call onSelectPhase when clicking a locked phase", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const progresses = makeProgresses(["passed", "active", "locked"]);
    const { container } = render(
      <PhaseProgressBar
        phases={PHASES}
        phaseProgresses={progresses}
        activePhaseOrder={2}
        onSelectPhase={onSelect}
        progressPct={33}
      />
    );
    const buttons = container.querySelectorAll("button");
    await user.click(buttons[2]); // phase 3 is locked
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("applies emerald class to passed phase buttons", () => {
    const progresses = makeProgresses(["passed", "active", "locked"]);
    const { container } = render(
      <PhaseProgressBar
        phases={PHASES}
        phaseProgresses={progresses}
        activePhaseOrder={2}
        onSelectPhase={vi.fn()}
        progressPct={33}
      />
    );
    const firstBtn = container.querySelectorAll("button")[0];
    expect(firstBtn.className).toContain("emerald");
  });

  it("applies indigo class to active phase button", () => {
    const progresses = makeProgresses(["passed", "active", "locked"]);
    const { container } = render(
      <PhaseProgressBar
        phases={PHASES}
        phaseProgresses={progresses}
        activePhaseOrder={2}
        onSelectPhase={vi.fn()}
        progressPct={33}
      />
    );
    const secondBtn = container.querySelectorAll("button")[1];
    expect(secondBtn.className).toContain("indigo");
  });

  it("disables locked phase buttons", () => {
    const progresses = makeProgresses(["passed", "active", "locked"]);
    const { container } = render(
      <PhaseProgressBar
        phases={PHASES}
        phaseProgresses={progresses}
        activePhaseOrder={2}
        onSelectPhase={vi.fn()}
        progressPct={33}
      />
    );
    const thirdBtn = container.querySelectorAll("button")[2] as HTMLButtonElement;
    expect(thirdBtn.disabled).toBe(true);
  });

  it("handles all phases passed state", () => {
    const progresses = makeProgresses(["passed", "passed", "passed"]);
    render(
      <PhaseProgressBar
        phases={PHASES}
        phaseProgresses={progresses}
        activePhaseOrder={3}
        onSelectPhase={vi.fn()}
        progressPct={100}
      />
    );
    expect(screen.getByText("100%")).toBeInTheDocument();
  });
});
