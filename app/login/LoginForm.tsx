"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Mode = "login" | "register";

export function LoginForm() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        name: name.trim(),
        action: mode,
        redirect: false,
      });

      if (result?.error) {
        // NextAuth wraps the message — show a clean version
        const msg = result.error;
        if (msg.includes("Email already registered")) setError("That email is already registered. Sign in instead.");
        else if (msg.includes("No account found")) setError("No account found. Register first.");
        else if (msg.includes("Incorrect password")) setError("Incorrect password.");
        else if (msg.includes("at least 6")) setError("Password must be at least 6 characters.");
        else setError("Something went wrong. Try again.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    });
  };

  return (
    <div className="rounded-xl border border-[#2D3148] bg-[#1A1D27] p-6">
      {/* Tab switcher */}
      <div className="flex rounded-lg bg-[#0F1117] p-1 mb-5 gap-1">
        {(["login", "register"] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => { setMode(m); setError(null); }}
            className={cn(
              "flex-1 py-1.5 rounded-md text-sm font-medium transition-colors",
              mode === m
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            {m === "login" ? "Sign in" : "Register"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {mode === "register" && (
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full bg-[#0F1117] border border-[#2D3148] rounded-lg px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
            className="w-full bg-[#0F1117] border border-[#2D3148] rounded-lg px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={mode === "register" ? "Min 6 characters" : "Your password"}
            required
            autoComplete={mode === "register" ? "new-password" : "current-password"}
            className="w-full bg-[#0F1117] border border-[#2D3148] rounded-lg px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {error && (
          <p className="text-sm text-rose-400 bg-rose-400/10 border border-rose-400/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <Button
          type="submit"
          className="w-full mt-1"
          size="lg"
          loading={isPending}
        >
          {mode === "login" ? "Sign in" : "Create account"}
        </Button>
      </form>
    </div>
  );
}
