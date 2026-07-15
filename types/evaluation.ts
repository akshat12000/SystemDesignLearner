// Evaluation types — the shape of AI responses and rubrics

export interface RubricCriterion {
  label: string;
  points: number;
  required: boolean;
  description?: string;
}

export interface PhaseRubric {
  totalPoints: number;
  passingThreshold: number;
  requiredCriteriaMustPass: boolean;
  criteria: RubricCriterion[];
  commonMistakes: string[];
  antiPatterns: string[];
}

export interface EvaluationResult {
  score: number;               // 0–100
  pass: boolean;
  strengths: string[];
  missingElements: string[];
  misconceptions: string[];
  targetedFeedback: string;
  hint: string | null;         // Populated only on attempt 3+
  nextPhaseTeaser: string | null; // Populated only on pass
}

export interface EvaluationResponse {
  submissionId: string;
  evaluation: EvaluationResult;
  modelUsed: string;
  evaluationMs: number;
}

export type EvaluationStatus = "idle" | "submitting" | "evaluating" | "done" | "error";

export interface PhaseSubmissionState {
  status: EvaluationStatus;
  attemptNumber: number;
  lastEvaluation: EvaluationResult | null;
  error: string | null;
}
