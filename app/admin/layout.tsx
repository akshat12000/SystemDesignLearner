import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Shield } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  // Check admin: either email matches ADMIN_EMAIL env var OR isAdmin is in the JWT token
  const adminEmail = process.env.ADMIN_EMAIL;
  const isAdminByEmail = adminEmail && session.user.email === adminEmail;
  const isAdminByToken = (session.user as { isAdmin?: boolean }).isAdmin === true;

  if (!isAdminByEmail && !isAdminByToken) {
    redirect("/dashboard");
  }

  const name = session.user.name ?? session.user.email;

  return (
    <div className="min-h-screen bg-[#0F1117]">
      <div className="border-b border-[#2D3148] bg-[#0A0C12]">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-1.5">
              <Shield className="h-4 w-4 text-rose-400" />
              <span className="text-xs font-semibold text-rose-400">ADMIN</span>
            </div>
            <nav className="flex items-center gap-1">
              {[
                { href: "/admin", label: "Overview" },
                { href: "/admin/evaluations", label: "Evaluations" },
                { href: "/admin/users", label: "Users" },
                { href: "/admin/feedback", label: "Feedback" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-3 py-1.5 rounded-md text-sm text-slate-400 hover:text-slate-200 hover:bg-[#1A1D27] transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500">{name}</span>
            <Link href="/dashboard" className="text-xs text-slate-500 hover:text-slate-300">
              ← Back to app
            </Link>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8">{children}</div>
    </div>
  );
}
