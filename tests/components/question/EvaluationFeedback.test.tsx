import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EvaluationFeedback } from "@/components/question/EvaluationFeedback";
import type { EvaluationResult } from "@/types/evaluation";
import type { PhaseClient } from "@/types/curriculum";

const PHASE: PhaseClient = {
  id: "phase-1",
  questionId: "q-1",
  order: 1,
  title: "Requirements Gathering",
  instruction: "List requirements.",
  passThreshold: 60,
  maxAttempts: 4,
  xpReward: 25,
  editorType: "richtext",
  walkthroughText: null,
};

const PASS_EVAL: EvaluationResult = {
  score: 80,
  pass: true,
  strengths: ["Identified all actors", "Clear non-functional requirements"],
  missingElements: [],
  misconceptions: [],
  targetedFeedback: "Excellent requirements gathering!",
  hint: null,
  nextPhaseTeaser: "Now think about the entities in the system.",
};

const FAIL_EVAL: EvaluationResult = {
  score: 45,
  pass: false,
  strengths: ["Mentioned functional requirements"],
  missingElements: ["No non-functional requirements", "Missing scale questions"],
  misconceptions: ["Requirements are not implementation details"],
  targetedFeedback: "You need to address non-functional requirements.",
  hint: null,
  nextPhaseTeaser: null,
};

const FAIL_WITH_HINT: EvaluationResult = {
  ...FAIL_EVAL,
  hint: "Think about performance, availability, and scale constraints.",
};

describe("EvaluationFeedback — pass state", () => {
  it("shows PASSED status text", () => {
    render(<EvaluationFeedback evaluation={PASS_EVAL} phase={PHASE} attemptNumber={1} />);
    expect(screen.getByText("Phase Passed!")).toBeInTheDocument();
  });

  it("displays the numeric score", () => {
    render(<EvaluationFeedback evaluation={PASS_EVAL} phase={PHASE} attemptNumber={1} />);
    expect(screen.getByText("80")).toBeInTheDocument();
  });

  it("renders strengths section with all items", () => {
    render(<EvaluationFeedback evaluation={PASS_EVAL} phase={PHASE} attemptNumber={1} />);
    expect(screen.getByText("What you got right")).toBeInTheDocument();
    expect(screen.getByText("Identified all actors")).toBeInTheDocument();
    expect(screen.getByText("Clear non-functional requirements")).toBeInTheDocument();
  });

  it("renders targeted feedback text", () => {
    render(<EvaluationFeedback evaluation={PASS_EVAL} phase={PHASE} attemptNumber={1} />);
    expect(screen.getByText("Excellent requirements gathering!")).toBeInTheDocument();
  });

  it("renders next-phase teaser when present on pass", () => {
    render(<EvaluationFeedback evaluation={PASS_EVAL} phase={PHASE} attemptNumber={1} />);
    expect(screen.getByText("Now think about the entities in the system.")).toBeInTheDocument();
    expect(screen.getByText(/Next up/i)).toBeInTheDocument();
  });

  it("does not render missing-elements section when empty", () => {
    render(<EvaluationFeedback evaluation={PASS_EVAL} phase={PHASE} attemptNumber={1} />);
    expect(screen.queryByText("Missing elements")).not.toBeInTheDocument();
  });

  it("does not render hint section when hint is null", () => {
    render(<EvaluationFeedback evaluation={PASS_EVAL} phase={PHASE} attemptNumber={1} />);
    expect(screen.queryByText("Hint")).not.toBeInTheDocument();
  });
});

describe("EvaluationFeedback — fail state", () => {
  it("shows 'Not quite there yet' text", () => {
    render(<EvaluationFeedback evaluation={FAIL_EVAL} phase={PHASE} attemptNumber={2} />);
    expect(screen.getByText("Not quite there yet")).toBeInTheDocument();
  });

  it("displays the numeric score", () => {
    render(<EvaluationFeedback evaluation={FAIL_EVAL} phase={PHASE} attemptNumber={2} />);
    expect(screen.getByText("45")).toBeInTheDocument();
  });

  it("renders missing elements section", () => {
    render(<EvaluationFeedback evaluation={FAIL_EVAL} phase={PHASE} attemptNumber={2} />);
    expect(screen.getByText("Missing elements")).toBeInTheDocument();
    expect(screen.getByText("No non-functional requirements")).toBeInTheDocument();
    expect(screen.getByText("Missing scale questions")).toBeInTheDocument();
  });

  it("renders misconceptions section", () => {
    render(<EvaluationFeedback evaluation={FAIL_EVAL} phase={PHASE} attemptNumber={2} />);
    expect(screen.getByText("Misconceptions to address")).toBeInTheDocument();
    expect(
      screen.getByText("Requirements are not implementation details")
    ).toBeInTheDocument();
  });

  it("shows attempt number", () => {
    render(<EvaluationFeedback evaluation={FAIL_EVAL} phase={PHASE} attemptNumber={2} />);
    expect(screen.getByText("Attempt 2 of 4")).toBeInTheDocument();
  });

  it("does not render next-phase teaser on fail", () => {
    render(<EvaluationFeedback evaluation={FAIL_EVAL} phase={PHASE} attemptNumber={2} />);
    expect(screen.queryByText(/Next up/i)).not.toBeInTheDocument();
  });
});

describe("EvaluationFeedback — hint", () => {
  it("renders hint when provided and not passed", () => {
    render(
      <EvaluationFeedback
        evaluation={FAIL_WITH_HINT}
        phase={PHASE}
        attemptNumber={3}
      />
    );
    expect(screen.getByText("Hint")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Think about performance, availability, and scale constraints."
      )
    ).toBeInTheDocument();
  });

  it("does not render hint section when hint is null", () => {
    render(
      <EvaluationFeedback evaluation={FAIL_EVAL} phase={PHASE} attemptNumber={3} />
    );
    expect(screen.queryByText("Hint")).not.toBeInTheDocument();
  });
});

describe("EvaluationFeedback — empty sections", () => {
  it("does not render strengths section when strengths array is empty", () => {
    const noStrengths: EvaluationResult = { ...FAIL_EVAL, strengths: [] };
    render(
      <EvaluationFeedback evaluation={noStrengths} phase={PHASE} attemptNumber={1} />
    );
    expect(screen.queryByText("What you got right")).not.toBeInTheDocument();
  });

  it("does not render misconceptions section when array is empty", () => {
    const noMisconceptions: EvaluationResult = {
      ...FAIL_EVAL,
      misconceptions: [],
    };
    render(
      <EvaluationFeedback
        evaluation={noMisconceptions}
        phase={PHASE}
        attemptNumber={1}
      />
    );
    expect(screen.queryByText("Misconceptions to address")).not.toBeInTheDocument();
  });
});
