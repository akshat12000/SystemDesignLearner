import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PhaseSubmissionEditor } from "@/components/question/PhaseSubmissionEditor";
import type { PhaseClient } from "@/types/curriculum";
import type { PhaseSubmissionState } from "@/types/evaluation";

const PHASE: PhaseClient = {
  id: "phase-1",
  questionId: "q-1",
  order: 1,
  title: "Requirements",
  instruction: "List requirements.",
  passThreshold: 60,
  maxAttempts: 4,
  xpReward: 25,
  editorType: "richtext",
  walkthroughText: null,
};

const IDLE_STATE: PhaseSubmissionState = {
  status: "idle",
  attemptNumber: 0,
  lastEvaluation: null,
  error: null,
};

const EVALUATING_STATE: PhaseSubmissionState = {
  ...IDLE_STATE,
  status: "evaluating",
};

const ERROR_STATE: PhaseSubmissionState = {
  ...IDLE_STATE,
  status: "error",
  error: "AI evaluation service unavailable.",
};

beforeEach(() => vi.clearAllMocks());

describe("PhaseSubmissionEditor — basic rendering", () => {
  it("renders the textarea for richtext editor type", () => {
    render(
      <PhaseSubmissionEditor
        phase={PHASE}
        state={IDLE_STATE}
        onSubmit={vi.fn()}
        isCompleted={false}
      />
    );
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("renders code editor (also textarea) for code editor type", () => {
    const codePhaseProp: PhaseClient = { ...PHASE, editorType: "code" };
    render(
      <PhaseSubmissionEditor
        phase={codePhaseProp}
        state={IDLE_STATE}
        onSubmit={vi.fn()}
        isCompleted={false}
      />
    );
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("shows character count", () => {
    render(
      <PhaseSubmissionEditor
        phase={PHASE}
        state={IDLE_STATE}
        onSubmit={vi.fn()}
        isCompleted={false}
      />
    );
    expect(screen.getByText(/0 characters/i)).toBeInTheDocument();
  });
});

describe("PhaseSubmissionEditor — submit button state", () => {
  it("submit button is disabled when content is empty", () => {
    render(
      <PhaseSubmissionEditor
        phase={PHASE}
        state={IDLE_STATE}
        onSubmit={vi.fn()}
        isCompleted={false}
      />
    );
    expect(screen.getByRole("button", { name: /submit/i })).toBeDisabled();
  });

  it("submit button is disabled when content is < 50 chars", async () => {
    const user = userEvent.setup();
    render(
      <PhaseSubmissionEditor
        phase={PHASE}
        state={IDLE_STATE}
        onSubmit={vi.fn()}
        isCompleted={false}
      />
    );
    await user.type(screen.getByRole("textbox"), "too short");
    expect(screen.getByRole("button", { name: /submit/i })).toBeDisabled();
  });

  it("submit button is enabled when content is >= 50 chars", async () => {
    const user = userEvent.setup();
    render(
      <PhaseSubmissionEditor
        phase={PHASE}
        state={IDLE_STATE}
        onSubmit={vi.fn()}
        isCompleted={false}
      />
    );
    await user.type(screen.getByRole("textbox"), "a".repeat(50));
    expect(screen.getByRole("button", { name: /submit/i })).not.toBeDisabled();
  });

  it("calls onSubmit with content when submit button clicked", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(
      <PhaseSubmissionEditor
        phase={PHASE}
        state={IDLE_STATE}
        onSubmit={onSubmit}
        isCompleted={false}
      />
    );
    const content = "a".repeat(60);
    await user.type(screen.getByRole("textbox"), content);
    await user.click(screen.getByRole("button", { name: /submit/i }));
    expect(onSubmit).toHaveBeenCalledWith(content);
  });
});

describe("PhaseSubmissionEditor — evaluating state", () => {
  it("shows evaluating text when status is evaluating", () => {
    render(
      <PhaseSubmissionEditor
        phase={PHASE}
        state={EVALUATING_STATE}
        onSubmit={vi.fn()}
        isCompleted={false}
      />
    );
    expect(screen.getByText(/evaluating/i)).toBeInTheDocument();
  });

  it("disables textarea during evaluation", () => {
    render(
      <PhaseSubmissionEditor
        phase={PHASE}
        state={EVALUATING_STATE}
        onSubmit={vi.fn()}
        isCompleted={false}
      />
    );
    expect(screen.getByRole("textbox")).toBeDisabled();
  });
});

describe("PhaseSubmissionEditor — error state", () => {
  it("shows error message when state.error is set", () => {
    render(
      <PhaseSubmissionEditor
        phase={PHASE}
        state={ERROR_STATE}
        onSubmit={vi.fn()}
        isCompleted={false}
      />
    );
    expect(
      screen.getByText("AI evaluation service unavailable.")
    ).toBeInTheDocument();
  });
});

describe("PhaseSubmissionEditor — completed state", () => {
  it("hides submit button when phase is completed", () => {
    render(
      <PhaseSubmissionEditor
        phase={PHASE}
        state={IDLE_STATE}
        onSubmit={vi.fn()}
        isCompleted={true}
      />
    );
    expect(screen.queryByRole("button", { name: /submit/i })).not.toBeInTheDocument();
  });

  it("shows completion message when isCompleted is true", () => {
    render(
      <PhaseSubmissionEditor
        phase={PHASE}
        state={IDLE_STATE}
        onSubmit={vi.fn()}
        isCompleted={true}
      />
    );
    expect(screen.getByText(/completed/i)).toBeInTheDocument();
  });

  it("disables textarea when phase is completed", () => {
    render(
      <PhaseSubmissionEditor
        phase={PHASE}
        state={IDLE_STATE}
        onSubmit={vi.fn()}
        isCompleted={true}
      />
    );
    expect(screen.getByRole("textbox")).toBeDisabled();
  });
});

describe("PhaseSubmissionEditor — max attempts", () => {
  const maxAttemptsState: PhaseSubmissionState = {
    ...IDLE_STATE,
    attemptNumber: 4, // equals maxAttempts
  };

  it("hides submit button when max attempts reached", () => {
    render(
      <PhaseSubmissionEditor
        phase={PHASE}
        state={maxAttemptsState}
        onSubmit={vi.fn()}
        isCompleted={false}
      />
    );
    expect(screen.queryByRole("button", { name: /submit/i })).not.toBeInTheDocument();
  });

  it("shows max attempts message", () => {
    render(
      <PhaseSubmissionEditor
        phase={PHASE}
        state={maxAttemptsState}
        onSubmit={vi.fn()}
        isCompleted={false}
      />
    );
    expect(screen.getByText(/maximum attempts/i)).toBeInTheDocument();
  });
});
