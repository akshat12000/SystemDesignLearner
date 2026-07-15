import { describe, it, expect } from "vitest";
import { cn, formatXP, getDifficultyColor, getTrackColor } from "@/lib/utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("removes duplicate Tailwind classes (tailwind-merge)", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "skipped", "included")).toBe("base included");
  });

  it("handles undefined and null gracefully", () => {
    expect(cn(undefined, null, "valid")).toBe("valid");
  });

  it("returns empty string when all falsy", () => {
    expect(cn(false, undefined, null)).toBe("");
  });
});

describe("formatXP", () => {
  it("returns number as string below 1000", () => {
    expect(formatXP(0)).toBe("0");
    expect(formatXP(999)).toBe("999");
    expect(formatXP(150)).toBe("150");
  });

  it("formats thousands with k suffix", () => {
    expect(formatXP(1000)).toBe("1.0k");
    expect(formatXP(1500)).toBe("1.5k");
    expect(formatXP(10000)).toBe("10.0k");
  });

  it("handles exact boundary of 1000", () => {
    expect(formatXP(999)).toBe("999");
    expect(formatXP(1000)).toBe("1.0k");
  });
});

describe("getDifficultyColor", () => {
  it("returns emerald for BEGINNER", () => {
    expect(getDifficultyColor("BEGINNER")).toContain("emerald");
  });

  it("returns amber for INTERMEDIATE", () => {
    expect(getDifficultyColor("INTERMEDIATE")).toContain("amber");
  });

  it("returns rose for ADVANCED", () => {
    expect(getDifficultyColor("ADVANCED")).toContain("rose");
  });

  it("returns slate for unknown difficulty", () => {
    expect(getDifficultyColor("UNKNOWN")).toContain("slate");
  });
});

describe("getTrackColor", () => {
  it("returns violet for LLD", () => {
    expect(getTrackColor("LLD")).toContain("violet");
  });

  it("returns cyan for HLD", () => {
    expect(getTrackColor("HLD")).toContain("cyan");
  });

  it("returns cyan for any non-LLD value", () => {
    expect(getTrackColor("OTHER")).toContain("cyan");
  });
});
