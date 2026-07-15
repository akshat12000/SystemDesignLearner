import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "lld" | "hld";
  className?: string;
}

const variantClasses = {
  default: "bg-slate-700/50 text-slate-300 border-slate-600/50",
  success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  error: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  lld: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  hld: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const variantMap: Record<string, BadgeProps["variant"]> = {
    BEGINNER: "success",
    INTERMEDIATE: "warning",
    ADVANCED: "error",
  };
  return (
    <Badge variant={variantMap[difficulty] ?? "default"}>
      {difficulty.charAt(0) + difficulty.slice(1).toLowerCase()}
    </Badge>
  );
}

export function TrackBadge({ track }: { track: string }) {
  return <Badge variant={track === "LLD" ? "lld" : "hld"}>{track}</Badge>;
}
