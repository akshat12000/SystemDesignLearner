import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatXP(xp: number): string {
  if (xp >= 1000) return `${(xp / 1000).toFixed(1)}k`;
  return xp.toString();
}

export function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case "BEGINNER": return "text-emerald-400 bg-emerald-400/10";
    case "INTERMEDIATE": return "text-amber-400 bg-amber-400/10";
    case "ADVANCED": return "text-rose-400 bg-rose-400/10";
    default: return "text-slate-400 bg-slate-400/10";
  }
}

export function getTrackColor(track: string): string {
  return track === "LLD"
    ? "text-violet-400 bg-violet-400/10"
    : "text-cyan-400 bg-cyan-400/10";
}
