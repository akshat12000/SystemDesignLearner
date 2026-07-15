import { Brain } from "lucide-react";
import { LoginForm } from "./LoginForm";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user?.id) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-[#0F1117] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 mb-4">
            <Brain className="h-6 w-6 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100">Welcome</h1>
          <p className="text-slate-400 text-sm mt-2">
            Sign in or create a local account
          </p>
        </div>

        <LoginForm />

        <p className="text-center text-xs text-slate-600 mt-6">
          Local development mode — no OAuth required
        </p>
      </div>
    </div>
  );
}
