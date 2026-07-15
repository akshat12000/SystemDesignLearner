import { describe, it, expect } from "vitest";
import {
  getLLDSystemPrompt,
  LLD_PHASE_PROMPTS,
} from "@/lib/ai/prompts/lld-phases";

const Q_TITLE = "Design a Parking Lot";
const Q_DESC = "Multi-level parking lot with different vehicle types.";

describe("LLD_PHASE_PROMPTS", () => {
  it("has prompts for phases 1 through 6", () => {
    for (let i = 1; i <= 6; i++) {
      expect(LLD_PHASE_PROMPTS[i]).toBeDefined();
      expect(typeof LLD_PHASE_PROMPTS[i]).toBe("string");
      expect(LLD_PHASE_PROMPTS[i].length).toBeGreaterThan(100);
    }
  });

  it("each prompt contains a scoring rubric section", () => {
    for (let i = 1; i <= 6; i++) {
      expect(LLD_PHASE_PROMPTS[i]).toMatch(/SCORING RUBRIC/i);
    }
  });

  it("each prompt mentions common mistakes", () => {
    for (let i = 1; i <= 6; i++) {
      expect(LLD_PHASE_PROMPTS[i]).toMatch(/COMMON MISTAKES/i);
    }
  });
});

describe("getLLDSystemPrompt", () => {
  it("returns a string combining base prompt with question context", () => {
    const result = getLLDSystemPrompt(1, Q_TITLE, Q_DESC);
    expect(typeof result).toBe("string");
    expect(result).toContain(Q_TITLE);
    expect(result).toContain(Q_DESC);
  });

  it("includes the phase-specific base prompt content", () => {
    const result = getLLDSystemPrompt(1, Q_TITLE, Q_DESC);
    expect(result).toContain(LLD_PHASE_PROMPTS[1]);
  });

  it("generates different prompts for each phase", () => {
    const prompts = Array.from({ length: 6 }, (_, i) =>
      getLLDSystemPrompt(i + 1, Q_TITLE, Q_DESC)
    );
    const unique = new Set(prompts);
    expect(unique.size).toBe(6);
  });

  it("includes JSON output instruction", () => {
    const result = getLLDSystemPrompt(1, Q_TITLE, Q_DESC);
    expect(result).toContain("JSON");
  });

  it("throws for an unsupported phase number", () => {
    expect(() => getLLDSystemPrompt(0, Q_TITLE, Q_DESC)).toThrow();
    expect(() => getLLDSystemPrompt(7, Q_TITLE, Q_DESC)).toThrow();
    expect(() => getLLDSystemPrompt(99, Q_TITLE, Q_DESC)).toThrow();
  });

  it.each([1, 2, 3, 4, 5, 6])(
    "phase %i prompt includes question title",
    (phase) => {
      expect(getLLDSystemPrompt(phase, Q_TITLE, Q_DESC)).toContain(Q_TITLE);
    }
  );
});
