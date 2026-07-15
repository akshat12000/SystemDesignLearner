import Link from "next/link";
import { ArrowRight, Brain, Code2, Zap, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/shared/UserMenu";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { auth } from "@/lib/auth";

export default async function LandingPage() {
  const session = await auth();
  const isSignedIn = !!session?.user?.id;
  const isAdmin = isSignedIn ? ((session.user as { isAdmin?: boolean }).isAdmin ?? false) : false;

  return (
    <div className="min-h-screen bg-[#0F1117]">
      {/* Nav */}
      <nav className="border-b border-[#2D3148]/50 px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Brain className="h-5 w-5 text-indigo-400" />
            <span className="font-semibold text-slate-100">SystemDesignLearner</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {isSignedIn && session.user.email ? (
              <UserMenu
                name={session.user.name ?? null}
                email={session.user.email}
                isAdmin={isAdmin}
              />
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">Sign in</Button>
                </Link>
                <Link href="/login">
                  <Button size="sm">Get started free</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 mb-8">
          <Zap className="h-3.5 w-3.5 text-indigo-400" />
          <span className="text-xs font-medium text-indigo-300">
            AI-powered phase-by-phase evaluation
          </span>
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold text-slate-100 leading-tight mb-6">
          Stop reading about{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
            system design.
          </span>
          <br />
          Start doing it.
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Phase-by-phase AI evaluation ensures you actually understand each step
          before moving forward — for both LLD and HLD.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href={isSignedIn ? "/dashboard" : "/login"}>
            <Button size="lg" className="w-full sm:w-auto">
              {isSignedIn ? "Go to dashboard" : "Start learning free"} <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/tracks">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              Browse curriculum
            </Button>
          </Link>
        </div>
      </section>

      {/* Tracks */}
      <section className="max-w-5xl mx-auto px-4 py-20">
        <h2 className="text-2xl font-bold text-center text-slate-100 mb-12">
          Two tracks. Structured progression.
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <TrackCard
            track="LLD"
            color="violet"
            icon={<Code2 className="h-5 w-5" />}
            title="Low Level Design"
            description="Master OOP, SOLID principles, and design patterns. Each question has 6 mandatory phases — from requirements gathering to code skeleton."
            features={[
              "SOLID principles with violation exercises",
              "10 core GoF design patterns",
              "15+ LLD questions (Parking Lot → Rate Limiter)",
              "AI gate between every phase",
            ]}
          />
          <TrackCard
            track="HLD"
            color="cyan"
            icon={<Brain className="h-5 w-5" />}
            title="High Level Design"
            description="Design distributed systems under real constraints. 5-phase structure from requirements clarification to failure mode analysis."
            features={[
              "Back-of-envelope estimation practice",
              "Database & caching trade-off decisions",
              "15+ HLD questions (URL Shortener → Uber)",
              "AI evaluates reasoning quality, not keywords",
            ]}
          />
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-[#2D3148]/50 py-20">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center text-slate-100 mb-12">
            How the phase engine works
          </h2>
          <div className="space-y-6">
            {[
              { n: "01", t: "Phase 1 unlocks", d: "You start with Phase 1. All subsequent phases are locked." },
              { n: "02", t: "You submit your response", d: "Write your answer in the editor. The AI evaluates the quality of your reasoning." },
              { n: "03", t: "Structured AI feedback", d: "Score, specific strengths, missing elements, and misconceptions. No vague feedback." },
              { n: "04", t: "Score ≥ threshold → Next phase", d: "Pass and you move forward. Fail and get targeted guidance to improve." },
            ].map((item) => (
              <div key={item.n} className="flex gap-5">
                <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                  <span className="text-xs font-mono text-indigo-400">{item.n}</span>
                </div>
                <div className="pt-2">
                  <h3 className="font-medium text-slate-100 mb-0.5">{item.t}</h3>
                  <p className="text-sm text-slate-400">{item.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-[#2D3148]/50 py-8 text-center">
        <Link href={isSignedIn ? "/dashboard" : "/login"}>
          <Button size="lg" className="mb-6">
            {isSignedIn ? "Go to dashboard" : "Get started now"} <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
        <p className="text-sm text-slate-600">
          SystemDesignLearner — Built for engineers who learn by doing
        </p>
      </footer>
    </div>
  );
}

function TrackCard({ track, color, icon, title, description, features }: {
  track: string; color: "violet" | "cyan"; icon: React.ReactNode;
  title: string; description: string; features: string[];
}) {
  const c = color === "violet"
    ? { badge: "bg-violet-500/10 text-violet-400 border-violet-500/20", card: "border-violet-500/20", check: "text-violet-400" }
    : { badge: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20", card: "border-cyan-500/20", check: "text-cyan-400" };
  return (
    <div className={`rounded-xl border bg-[#1A1D27] p-6 ${c.card}`}>
      <div className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 mb-4 ${c.badge}`}>
        {icon}<span className="text-xs font-semibold">{track}</span>
      </div>
      <h3 className="text-lg font-semibold text-slate-100 mb-2">{title}</h3>
      <p className="text-sm text-slate-400 mb-5 leading-relaxed">{description}</p>
      <ul className="space-y-2">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
            <CheckCircle className={`h-4 w-4 mt-0.5 shrink-0 ${c.check}`} />{f}
          </li>
        ))}
      </ul>
      <div className="mt-6">
        <Link href={`/tracks/${track.toLowerCase()}`}>
          <Button variant="outline" size="sm" className="w-full">
            View {track} curriculum <ArrowRight className="h-3 w-3" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
