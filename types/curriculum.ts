// Curriculum types — safe types returned to the client (no AI internals)

export type TrackType = "LLD" | "HLD";
export type Difficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
export type ModuleType = "LESSON" | "DESIGN_QUESTION";
export type EditorType = "richtext" | "code" | "diagram";

export interface Track {
  id: string;
  slug: string;
  title: string;
  description: string;
  type: TrackType;
  order: number;
}

export interface Module {
  id: string;
  trackId: string;
  slug: string;
  title: string;
  description: string;
  order: number;
  type: ModuleType;
  difficulty: Difficulty;
  isLocked: boolean;
  questionCount?: number;
  lessonCount?: number;
}

// Safe phase — NO systemPrompt, NO rubricJson
export interface PhaseClient {
  id: string;
  questionId: string;
  order: number;
  title: string;
  instruction: string;
  passThreshold: number;
  maxAttempts: number;
  xpReward: number;
  editorType: EditorType;
  walkthroughText: string | null;
}

export interface DesignQuestion {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  track: TrackType;
  difficulty: Difficulty;
  estimatedMin: number;
  tags: string[];
  xpTotal: number;
  phases: PhaseClient[];
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  contentJson: unknown;
  order: number;
  xpReward: number;
  estimatedMin: number;
}
