import Link from "next/link";
import { Brain, ArrowLeft, Zap, Shield, Star, Bug, Sparkles } from "lucide-react";
import { auth } from "@/lib/auth";
import { UserMenu } from "@/components/shared/UserMenu";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

const RELEASES = [
  {
    version: "1.4.0",
    date: "2026-07-17",
    tag: "latest",
    changes: [
      { type: "feature", text: "Phase instructions now render full markdown — bold headings, bullet lists, inline code all properly formatted" },
      { type: "feature", text: "API key modal redesigned with tabs (Groq / OpenAI / Gemini) — one provider visible at a time, much cleaner" },
      { type: "feature", text: "Per-provider model selection dropdown — choose lightweight vs powerful model per provider (e.g. Gemini 2.0 Flash, GPT-4o Mini)" },
      { type: "feature", text: "API key modal now renders as a true centered overlay via React Portal — no longer clipped by parent containers" },
      { type: "feature", text: "Multi-provider key storage — save Groq, OpenAI, and Gemini keys independently; Groq used first when multiple are set" },
      { type: "feature", text: "Release notes page at /changelog — visible from footer on every page" },
      { type: "feature", text: "Footer links on every page — Release notes, Curriculum, My progress" },
      { type: "fix", text: "Cancel button added to API key modal" },
      { type: "fix", text: "Neon DB seeding fixed — dotenv/config now correctly loaded in all seed scripts" },
    ],
  },
  {
    version: "1.3.0",
    date: "2026-07-17",
    tag: null,
    changes: [
      { type: "feature", text: "Page transition loader — indigo progress bar on every navigation, no more stuck-then-jump feeling" },
      { type: "feature", text: "Feedback widget — floating button on every page, 1–5 stars + category + message, visible in admin dashboard" },
      { type: "feature", text: "User API key support — paste your own Groq, OpenAI, or Gemini key; stored in browser only, used for all evaluations" },
      { type: "feature", text: "Admin Feedback page — view all feedback with average rating and category breakdown at /admin/feedback" },
    ],
  },
  {
    version: "1.2.0",
    date: "2026-07-16",
    tag: null,
    changes: [
      { type: "feature", text: "13 LLD questions + 14 HLD questions — 27 total (doubled from v1.0)" },
      { type: "feature", text: "Admin dashboard — /admin with overview, evaluation logs, user list, and feedback" },
      { type: "feature", text: "Admin account with unlimited attempts and no phase locking for testing" },
      { type: "feature", text: "Dark / Light theme toggle — respects system preference, stored in localStorage" },
      { type: "feature", text: "Day streak tracking — updates on every phase pass" },
      { type: "feature", text: "/tracks page — full curriculum overview for signed-in and anonymous users" },
      { type: "feature", text: "/progress page — all questions with status, XP earned, and phase progress bars" },
      { type: "fix", text: "Fixed 'Phase 7' teaser appearing after the last phase" },
      { type: "fix", text: "Fixed attempt limit guard — admin bypasses all limits" },
      { type: "fix", text: "Fixed sign-in state on landing page — shows Dashboard button when already signed in" },
    ],
  },
  {
    version: "1.1.0",
    date: "2026-07-15",
    tag: null,
    changes: [
      { type: "feature", text: "Exhausted attempts walkthrough — model answer revealed after all 4 attempts fail, proceed with 0 XP" },
      { type: "feature", text: "Completion modal with confetti — celebrates finishing all phases, different burst for perfect vs partial" },
      { type: "feature", text: "Phase-locked progression — previous phase must be completed (or exhausted) before next unlocks" },
      { type: "feature", text: "Streak counter correctly increments on consecutive active days" },
      { type: "feature", text: "User profile dropdown in nav — avatar initials, Dashboard, Admin panel, Sign out" },
      { type: "fix", text: "Force-unlocked phases now correctly allow submission on the next phase" },
      { type: "fix", text: "Turbopack cache cleared — fixes PrismaClientValidationError in admin pages" },
    ],
  },
  {
    version: "1.0.0",
    date: "2026-07-15",
    tag: "initial",
    changes: [
      { type: "feature", text: "Phase engine — 6-phase LLD questions, 5-phase HLD questions, all phase-locked" },
      { type: "feature", text: "AI evaluation — local Ollama (llama3.2:3b / llama3.1:8b) with Groq cloud fallback" },
      { type: "feature", text: "Structured feedback — score, strengths, missing elements, misconceptions, targeted feedback, hints" },
      { type: "feature", text: "XP system — earned per phase, scaled by difficulty" },
      { type: "feature", text: "6 LLD questions: Parking Lot, Library, Vending Machine, Hotel, Movie Tickets, Rate Limiter" },
      { type: "feature", text: "7 HLD questions: URL Shortener, Key-Value Store, Twitter, WhatsApp, YouTube, Distributed Cache, Uber" },
      { type: "feature", text: "Credentials auth — email + password, no OAuth required" },
      { type: "feature", text: "Phase walkthrough — model answer shown after attempt exhaustion" },
      { type: "feature", text: "178 unit tests — 98%+ code coverage (Vitest + React Testing Library)" },
    ],
  },
];

const TYPE_CONFIG = {
  feature: { icon: <Sparkles className="h-3.5 w-3.5" />, color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20" },
  fix: { icon: <Bug className="h-3.5 w-3.5" />, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
  security: { icon: <Shield className="h-3.5 w-3.5" />, color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20" },
};

export default async function ChangelogPage() {
  const session = await auth();
  const isSignedIn = !!session?.user?.id;
  const isAdmin = isSignedIn ? ((session.user as { isAdmin?: boolean }).isAdmin ?? false) : false;

  return (
    <div className="min-h-screen bg-[#0F1117]">
      <nav className="border-b border-[#2D3148]/50 px-4 py-3 sticky top-0 bg-[#0F1117]/80 backdrop-blur-sm z-10">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Brain className="h-5 w-5 text-indigo-400" />
            <span className="font-semibold text-slate-100">SystemDesignLearner</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {isSignedIn && session.user.email ? (
              <UserMenu name={session.user.name ?? null} email={session.user.email} isAdmin={isAdmin} />
            ) : (
              <Link href="/login" className="text-sm text-slate-400 hover:text-slate-200">Sign in</Link>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="mb-10">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 mb-6 transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <Zap className="h-6 w-6 text-indigo-400" />
            <h1 className="text-3xl font-bold text-slate-100">Release Notes</h1>
          </div>
          <p className="text-slate-400">What&apos;s new in SystemDesignLearner.</p>
        </div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[11px] top-2 bottom-2 w-px bg-[#2D3148]" />

          <div className="space-y-10">
            {RELEASES.map((release) => (
              <div key={release.version} className="relative pl-8">
                {/* Timeline dot */}
                <div className="absolute left-0 top-1.5 w-[23px] h-[23px] rounded-full bg-[#1A1D27] border-2 border-indigo-500 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-indigo-500" />
                </div>

                <div className="rounded-xl border border-[#2D3148] bg-[#1A1D27] p-6">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-4 flex-wrap">
                    <span className="text-lg font-bold text-slate-100 font-mono">v{release.version}</span>
                    {release.tag && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
                        release.tag === "latest"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-slate-700/50 text-slate-400 border-slate-600/50"
                      }`}>
                        {release.tag}
                      </span>
                    )}
                    <span className="text-sm text-slate-500 ml-auto">{release.date}</span>
                  </div>

                  {/* Changes */}
                  <ul className="space-y-2.5">
                    {release.changes.map((change, i) => {
                      const cfg = TYPE_CONFIG[change.type as keyof typeof TYPE_CONFIG] ?? TYPE_CONFIG.feature;
                      return (
                        <li key={i} className="flex items-start gap-3">
                          <span className={`mt-0.5 shrink-0 flex items-center justify-center w-5 h-5 rounded border ${cfg.bg} ${cfg.color}`}>
                            {cfg.icon}
                          </span>
                          <span className="text-sm text-slate-300 leading-relaxed">{change.text}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
