import { describe, it, expect } from "vitest";
import {
  getHLDSystemPrompt,
  HLD_PHASE_PROMPTS,
} from "@/lib/ai/prompts/hld-phases";

const Q_TITLE = "Design Twitter Feed";
const Q_DESC = "Design a social feed system for 300M DAU.";

describe("HLD_PHASE_PROMPTS", () => {
  it("has prompts for phases 1 through 5", () => {
    for (let i = 1; i <= 5; i++) {
      expect(HLD_PHASE_PROMPTS[i]).toBeDefined();
      expect(typeof HLD_PHASE_PROMPTS[i]).toBe("string");
      expect(HLD_PHASE_PROMPTS[i].length).toBeGreaterThan(100);
    }
  });

  it("phase 1 focuses on requirements clarification", () => {
    expect(HLD_PHASE_PROMPTS[1]).toMatch(/requirement|clarif/i);
  });

  it("phase 2 focuses on capacity estimation", () => {
    expect(HLD_PHASE_PROMPTS[2]).toMatch(/capacity|estimat/i);
  });

  it("phase 3 focuses on high-level architecture", () => {
    expect(HLD_PHASE_PROMPTS[3]).toMatch(/architect/i);
  });

  it("phase 4 focuses on deep dive", () => {
    expect(HLD_PHASE_PROMPTS[4]).toMatch(/deep|component/i);
  });

  it("phase 5 focuses on failure modes", () => {
    expect(HLD_PHASE_PROMPTS[5]).toMatch(/failure|bottleneck/i);
  });
});

describe("getHLDSystemPrompt", () => {
  it("returns a string combining base prompt with question context", () => {
    const result = getHLDSystemPrompt(1, Q_TITLE, Q_DESC);
    expect(typeof result).toBe("string");
    expect(result).toContain(Q_TITLE);
    expect(result).toContain(Q_DESC);
  });

  it("generates different prompts for each phase", () => {
    const prompts = Array.from({ length: 5 }, (_, i) =>
      getHLDSystemPrompt(i + 1, Q_TITLE, Q_DESC)
    );
    const unique = new Set(prompts);
    expect(unique.size).toBe(5);
  });

  it("includes JSON output instruction", () => {
    const result = getHLDSystemPrompt(1, Q_TITLE, Q_DESC);
    expect(result).toContain("JSON");
  });

  it("throws for phase 0", () => {
    expect(() => getHLDSystemPrompt(0, Q_TITLE, Q_DESC)).toThrow(
      "No HLD prompt configured for phase 0"
    );
  });

  it("throws for phase 6 (HLD only has 5 phases)", () => {
    expect(() => getHLDSystemPrompt(6, Q_TITLE, Q_DESC)).toThrow();
  });

  it.each([1, 2, 3, 4, 5])(
    "phase %i includes question description",
    (phase) => {
      expect(getHLDSystemPrompt(phase, Q_TITLE, Q_DESC)).toContain(Q_DESC);
    }
  );
});
