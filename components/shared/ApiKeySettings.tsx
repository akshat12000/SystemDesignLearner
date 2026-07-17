"use client";

import { useState, useEffect } from "react";
import { Key, X, CheckCircle2, Eye, EyeOff, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const STORAGE_KEY = "sdl_user_api_config";

export interface UserApiConfig {
  provider: "groq" | "openai" | "gemini";
  apiKey: string;
  model?: string;
}

export function getUserApiConfig(): UserApiConfig | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as UserApiConfig) : null;
  } catch {
    return null;
  }
}

export function setUserApiConfig(config: UserApiConfig | null) {
  if (typeof window === "undefined") return;
  if (config) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

const PROVIDERS = [
  {
    value: "groq" as const,
    label: "Groq",
    hint: "Free at console.groq.com",
    defaultModel: "llama-3.1-8b-instant",
    placeholder: "gsk_...",
  },
  {
    value: "openai" as const,
    label: "OpenAI",
    hint: "platform.openai.com",
    defaultModel: "gpt-4o-mini",
    placeholder: "sk-...",
  },
  {
    value: "gemini" as const,
    label: "Gemini",
    hint: "aistudio.google.com",
    defaultModel: "gemini-1.5-flash",
    placeholder: "AIza...",
  },
];

interface ApiKeySettingsProps {
  className?: string;
}

export function ApiKeySettings({ className }: ApiKeySettingsProps) {
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState<UserApiConfig | null>(null);
  const [provider, setProvider] = useState<UserApiConfig["provider"]>("groq");
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const existing = getUserApiConfig();
    setConfig(existing);
    if (existing) {
      setProvider(existing.provider);
      setApiKey(existing.apiKey);
    }
  }, [open]);

  const handleSave = () => {
    if (!apiKey.trim()) return;
    const selected = PROVIDERS.find((p) => p.value === provider)!;
    const newConfig: UserApiConfig = {
      provider,
      apiKey: apiKey.trim(),
      model: selected.defaultModel,
    };
    setUserApiConfig(newConfig);
    setConfig(newConfig);
    setSaved(true);
    setTimeout(() => { setSaved(false); setOpen(false); }, 1200);
  };

  const handleRemove = () => {
    setUserApiConfig(null);
    setConfig(null);
    setApiKey("");
    setSaved(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Configure your AI API key"
        className={cn(
          "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors",
          config
            ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
            : "bg-[#1A1D27] border border-[#2D3148] text-slate-400 hover:text-slate-200 hover:border-slate-500",
          className
        )}
      >
        <Key className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">{config ? "Custom key active" : "Use my API key"}</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="w-full max-w-md rounded-2xl border border-[#2D3148] bg-[#1A1D27] p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                <Key className="h-4 w-4 text-indigo-400" /> Your AI API Key
              </h2>
              <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-slate-300">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-5">
              Your key is stored only in your browser — never sent to our servers except for the evaluation request itself.
            </p>

            {/* Provider tabs */}
            <div className="flex rounded-lg bg-[#0F1117] p-1 gap-1 mb-4">
              {PROVIDERS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setProvider(p.value)}
                  className={cn(
                    "flex-1 py-1.5 rounded-md text-xs font-medium transition-colors",
                    provider === p.value
                      ? "bg-indigo-600 text-white"
                      : "text-slate-400 hover:text-slate-200"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Provider hint */}
            <p className="text-xs text-slate-500 mb-3">
              {PROVIDERS.find((p) => p.value === provider)?.hint} — free tier available
            </p>

            {/* Key input */}
            <div className="relative mb-5">
              <input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={PROVIDERS.find((p) => p.value === provider)?.placeholder}
                className="w-full bg-[#0F1117] border border-[#2D3148] rounded-lg px-3 py-2.5 pr-10 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
              />
              <button
                onClick={() => setShowKey((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={!apiKey.trim() || saved}
                className="flex-1"
              >
                {saved ? (
                  <><CheckCircle2 className="h-4 w-4" /> Saved!</>
                ) : (
                  "Save key"
                )}
              </Button>
              {config && (
                <Button variant="destructive" onClick={handleRemove} className="px-3">
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            {config && (
              <p className="text-xs text-emerald-400 mt-3 text-center">
                ✓ Using your {PROVIDERS.find((p) => p.value === config.provider)?.label} key for evaluations
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
