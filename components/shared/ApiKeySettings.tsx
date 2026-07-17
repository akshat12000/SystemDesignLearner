"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Key, X, CheckCircle2, Eye, EyeOff, Trash2, ShieldCheck, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const STORAGE_KEY = "sdl_user_api_configs";

export interface UserApiConfig {
  provider: "groq" | "openai" | "gemini";
  apiKey: string;
  model?: string;
}

// Stores all keys; returns the first available one for evaluation
export interface StoredKeys {
  groq?: string;
  openai?: string;
  gemini?: string;
}

export function getUserApiConfig(): UserApiConfig | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const stored = JSON.parse(raw) as StoredKeys;
    // Return first available key in priority order
    if (stored.groq) return { provider: "groq", apiKey: stored.groq, model: "llama-3.1-8b-instant" };
    if (stored.openai) return { provider: "openai", apiKey: stored.openai, model: "gpt-4o-mini" };
    if (stored.gemini) return { provider: "gemini", apiKey: stored.gemini, model: "gemini-1.5-flash" };
    return null;
  } catch {
    return null;
  }
}

export function setUserApiConfig(config: UserApiConfig | null) {
  if (typeof window === "undefined") return;
  if (!config) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  try {
    const existing: StoredKeys = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    existing[config.provider] = config.apiKey;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ [config.provider]: config.apiKey }));
  }
}

function removeProviderKey(provider: "groq" | "openai" | "gemini") {
  if (typeof window === "undefined") return;
  try {
    const existing: StoredKeys = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    delete existing[provider];
    if (Object.keys(existing).length === 0) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function getAllStoredKeys(): StoredKeys {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as StoredKeys;
  } catch {
    return {};
  }
}

const PROVIDERS = [
  {
    value: "groq" as const,
    label: "Groq",
    badge: "Free",
    color: "text-violet-400",
    docsUrl: "https://console.groq.com",
    placeholder: "gsk_...",
    models: [
      { value: "llama-3.1-8b-instant", label: "Llama 3.1 8B Instant", tag: "Fast · Free" },
      { value: "llama-3.3-70b-versatile", label: "Llama 3.3 70B Versatile", tag: "Smart · Free" },
      { value: "gemma2-9b-it", label: "Gemma 2 9B", tag: "Lightweight · Free" },
    ],
  },
  {
    value: "openai" as const,
    label: "OpenAI",
    badge: "Paid",
    color: "text-emerald-400",
    docsUrl: "https://platform.openai.com/api-keys",
    placeholder: "sk-...",
    models: [
      { value: "gpt-4o-mini", label: "GPT-4o Mini", tag: "Recommended · Cheap" },
      { value: "gpt-4o", label: "GPT-4o", tag: "Best quality" },
      { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo", label2: "", tag: "Cheapest" },
    ],
  },
  {
    value: "gemini" as const,
    label: "Gemini",
    badge: "Free",
    color: "text-blue-400",
    docsUrl: "https://aistudio.google.com/apikey",
    placeholder: "AIza...",
    models: [
      { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash", tag: "Fast · Free" },
      { value: "gemini-2.0-flash", label: "Gemini 2.0 Flash", tag: "Latest · Free" },
      { value: "gemini-1.5-flash-8b", label: "Gemini 1.5 Flash-8B", tag: "Lightest · Free" },
    ],
  },
];

interface ApiKeySettingsProps {
  className?: string;
}

export function ApiKeySettings({ className }: ApiKeySettingsProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"groq" | "openai" | "gemini">("groq");
  useEffect(() => { setMounted(true); }, []);
  const [storedKeys, setStoredKeys] = useState<StoredKeys>({});
  const [drafts, setDrafts] = useState<StoredKeys>({});
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  const [savedProvider, setSavedProvider] = useState<string | null>(null);
  const [selectedModels, setSelectedModels] = useState<Record<string, string>>({
    groq: "llama-3.1-8b-instant",
    openai: "gpt-4o-mini",
    gemini: "gemini-1.5-flash",
  });

  const hasAnyKey = Object.values(storedKeys).some(Boolean);

  useEffect(() => {
    if (open) {
      const keys = getAllStoredKeys();
      setStoredKeys(keys);
      setDrafts({ ...keys });
      setSavedProvider(null);
    }
  }, [open]);

  const handleSave = (provider: "groq" | "openai" | "gemini") => {
    const key = (drafts[provider] ?? "").trim();
    if (!key) return;
    const model = selectedModels[provider] ?? PROVIDERS.find((p) => p.value === provider)!.models[0].value;
    setUserApiConfig({ provider, apiKey: key, model });
    setStoredKeys((prev) => ({ ...prev, [provider]: key }));
    setSavedProvider(provider);
    setTimeout(() => setSavedProvider(null), 1500);
  };

  const handleRemove = (provider: "groq" | "openai" | "gemini") => {
    removeProviderKey(provider);
    setStoredKeys((prev) => { const n = { ...prev }; delete n[provider]; return n; });
    setDrafts((prev) => { const n = { ...prev }; delete n[provider]; return n; });
  };

  const activeProvider = PROVIDERS.find((p) => p.value === activeTab)!;
  const isSaved = savedProvider === activeTab;
  const hasKey = !!storedKeys[activeTab];
  const draft = drafts[activeTab] ?? "";

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        title="Configure your AI API keys"
        className={cn(
          "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors border",
          hasAnyKey
            ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/20"
            : "bg-[#1A1D27] border-[#2D3148] text-slate-400 hover:text-slate-200 hover:border-slate-500",
          className
        )}
      >
        <Key className="h-3.5 w-3.5 shrink-0" />
        <span className="hidden sm:inline">
          {hasAnyKey
            ? `${Object.values(storedKeys).filter(Boolean).length} key${Object.values(storedKeys).filter(Boolean).length > 1 ? "s" : ""} configured`
            : "Use my API key"}
        </span>
      </button>

      {/* Modal via portal */}
      {mounted && open && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="w-full max-w-[420px] rounded-2xl border border-[#2D3148] bg-[#0F1117] shadow-2xl overflow-hidden">

            {/* Header */}
            <div className="px-6 pt-5 pb-4 border-b border-[#2D3148]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                    <Key className="h-4 w-4 text-indigo-400" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-slate-100">Your AI API Keys</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Keys saved per provider, independently</p>
                  </div>
                </div>
                <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-slate-300 transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Provider tabs */}
            <div className="flex border-b border-[#2D3148]">
              {PROVIDERS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setActiveTab(p.value)}
                  className={cn(
                    "flex-1 py-3 text-xs font-medium transition-colors relative flex items-center justify-center gap-1.5",
                    activeTab === p.value
                      ? "text-slate-100 bg-[#1A1D27]"
                      : "text-slate-500 hover:text-slate-300"
                  )}
                >
                  <span className={activeTab === p.value ? p.color : ""}>{p.label}</span>
                  {storedKeys[p.value] && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  )}
                  {activeTab === p.value && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />
                  )}
                </button>
              ))}
            </div>

            {/* Active tab content */}
            <div className="px-6 py-5 space-y-4">
              {/* Provider info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={cn("text-sm font-semibold", activeProvider.color)}>{activeProvider.label}</span>
                  <span className={cn(
                    "text-xs px-1.5 py-0.5 rounded font-medium",
                    activeProvider.badge === "Free"
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-amber-500/10 text-amber-400"
                  )}>
                    {activeProvider.badge}
                  </span>
                  {hasKey && (
                    <span className="flex items-center gap-1 text-xs text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" /> Active
                    </span>
                  )}
                </div>
                <a
                  href={activeProvider.docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors"
                >
                  Get key <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              {/* Model dropdown */}
              <div>
                <p className="text-xs text-slate-500 mb-1.5">Model</p>
                <select
                  value={selectedModels[activeTab] ?? activeProvider.models[0].value}
                  onChange={(e) => setSelectedModels((prev) => ({ ...prev, [activeTab]: e.target.value }))}
                  className="w-full bg-[#1A1D27] border border-[#2D3148] rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors cursor-pointer"
                >
                  {activeProvider.models.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label} — {m.tag}
                    </option>
                  ))}
                </select>
              </div>

              {/* API key input */}
              <div>
                <p className="text-xs text-slate-500 mb-1.5">API Key</p>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showKey[activeTab] ? "text" : "password"}
                      value={draft}
                      onChange={(e) => setDrafts((prev) => ({ ...prev, [activeTab]: e.target.value }))}
                      placeholder={activeProvider.placeholder}
                      autoFocus
                      className="w-full bg-[#1A1D27] border border-[#2D3148] rounded-lg px-3 py-2.5 pr-9 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-mono transition-colors"
                    />
                    <button
                      onClick={() => setShowKey((prev) => ({ ...prev, [activeTab]: !prev[activeTab] }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors"
                    >
                      {showKey[activeTab] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <Button
                    onClick={() => handleSave(activeTab)}
                    disabled={!draft.trim() || isSaved}
                    className="shrink-0"
                  >
                    {isSaved ? <><CheckCircle2 className="h-4 w-4" /> Saved</> : "Save"}
                  </Button>
                </div>
                {hasKey && (
                  <button
                    onClick={() => handleRemove(activeTab)}
                    className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Remove saved key
                  </button>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 pb-5 space-y-3">
              <div className="flex items-start gap-2 rounded-lg bg-[#1A1D27] border border-[#2D3148] px-3 py-2.5">
                <ShieldCheck className="h-4 w-4 text-slate-500 mt-0.5 shrink-0" />
                <p className="text-xs text-slate-500 leading-relaxed">
                  Keys live in your browser only. When multiple keys are saved, Groq is used first.
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-full py-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

