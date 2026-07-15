// Progress types

export type ProgressStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
export type SubmissionStatus = "PENDING" | "EVALUATING" | "PASSED" | "FAILED";

export interface PhaseProgress {
  phaseOrder: number;
  phaseId: string;
  status: "locked" | "active" | "passed" | "failed" | "exhausted";
  attemptCount: number;
  bestScore: number | null;
}

export interface QuestionProgress {
  questionId: string;
  status: ProgressStatus;
  currentPhase: number;
  completedPhases: number[];
  exhaustedPhases: number[];
  totalXp: number;
  startedAt: string | null;
  completedAt: string | null;
  phaseProgresses: PhaseProgress[];
}

export interface TrackProgress {
  trackId: string;
  trackSlug: string;
  enrolledAt: string | null;
  completedQuestions: number;
  totalQuestions: number;
  completedLessons: number;
  totalLessons: number;
  totalXp: number;
}

export interface UserStats {
  totalXp: number;
  currentStreak: number;
  longestStreak: number;
  lldCompleted: number;
  hldCompleted: number;
  badges: string[];
}

export interface DashboardData {
  user: { name: string | null; image: string | null; email: string };
  stats: UserStats;
  lldProgress: TrackProgress;
  hldProgress: TrackProgress;
  recentActivity: RecentActivity[];
}

export interface RecentActivity {
  type: "phase_passed" | "question_completed" | "lesson_completed";
  questionTitle?: string;
  phaseTitle?: string;
  xpEarned: number;
  timestamp: string;
}
