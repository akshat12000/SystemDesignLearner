import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge, DifficultyBadge, TrackBadge } from "@/components/ui/badge";

describe("Badge", () => {
  it("renders children", () => {
    render(<Badge>Hello</Badge>);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("applies default variant", () => {
    render(<Badge>Default</Badge>);
    const el = screen.getByText("Default");
    expect(el).toHaveClass("bg-slate-700/50");
  });

  it("applies success variant", () => {
    render(<Badge variant="success">Pass</Badge>);
    expect(screen.getByText("Pass")).toHaveClass("text-emerald-400");
  });

  it("applies warning variant", () => {
    render(<Badge variant="warning">Warn</Badge>);
    expect(screen.getByText("Warn")).toHaveClass("text-amber-400");
  });

  it("applies error variant", () => {
    render(<Badge variant="error">Fail</Badge>);
    expect(screen.getByText("Fail")).toHaveClass("text-rose-400");
  });

  it("applies lld variant", () => {
    render(<Badge variant="lld">LLD</Badge>);
    expect(screen.getByText("LLD")).toHaveClass("text-violet-400");
  });

  it("applies hld variant", () => {
    render(<Badge variant="hld">HLD</Badge>);
    expect(screen.getByText("HLD")).toHaveClass("text-cyan-400");
  });

  it("merges custom className", () => {
    render(<Badge className="my-class">Test</Badge>);
    expect(screen.getByText("Test")).toHaveClass("my-class");
  });
});

describe("DifficultyBadge", () => {
  it("renders Beginner with success variant for BEGINNER", () => {
    render(<DifficultyBadge difficulty="BEGINNER" />);
    const el = screen.getByText("Beginner");
    expect(el).toBeInTheDocument();
    expect(el).toHaveClass("text-emerald-400");
  });

  it("renders Intermediate with warning variant", () => {
    render(<DifficultyBadge difficulty="INTERMEDIATE" />);
    const el = screen.getByText("Intermediate");
    expect(el).toHaveClass("text-amber-400");
  });

  it("renders Advanced with error variant", () => {
    render(<DifficultyBadge difficulty="ADVANCED" />);
    const el = screen.getByText("Advanced");
    expect(el).toHaveClass("text-rose-400");
  });

  it("falls back to default variant for unknown difficulty", () => {
    render(<DifficultyBadge difficulty="UNKNOWN" />);
    expect(screen.getByText("Unknown")).toBeInTheDocument();
  });
});

describe("TrackBadge", () => {
  it("renders LLD with lld variant", () => {
    render(<TrackBadge track="LLD" />);
    const el = screen.getByText("LLD");
    expect(el).toHaveClass("text-violet-400");
  });

  it("renders HLD with hld variant", () => {
    render(<TrackBadge track="HLD" />);
    const el = screen.getByText("HLD");
    expect(el).toHaveClass("text-cyan-400");
  });
});
