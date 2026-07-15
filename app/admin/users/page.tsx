import { prisma } from "@/lib/db/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Star, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      isAdmin: true,
      createdAt: true,
      stats: {
        select: {
          totalXp: true,
          currentStreak: true,
          lldCompleted: true,
          hldCompleted: true,
          lastActiveAt: true,
        },
      },
      _count: {
        select: { submissions: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Users</h1>
        <p className="text-slate-400 text-sm mt-1">{users.length} registered accounts</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2D3148]">
                  {["User", "Role", "Joined", "Total XP", "Streak", "LLD", "HLD", "Submissions", "Last active"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs text-slate-500 font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-[#1A1D27] hover:bg-[#1A1D27]/50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-slate-200">{u.name ?? "—"}</p>
                        <p className="text-xs text-slate-500">{u.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {u.isAdmin ? (
                        <span className="flex items-center gap-1 text-xs text-rose-400">
                          <Shield className="h-3 w-3" /> Admin
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500">Student</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                      {u.createdAt.toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-amber-400 font-mono text-sm">
                        <Star className="h-3 w-3" />
                        {u.stats?.totalXp ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300 font-mono">
                      {u.stats?.currentStreak ?? 0}d
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-violet-400">
                        <CheckCircle2 className="h-3 w-3" />
                        {u.stats?.lldCompleted ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-cyan-400">
                        <CheckCircle2 className="h-3 w-3" />
                        {u.stats?.hldCompleted ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 font-mono">
                      {u._count.submissions}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                      {u.stats?.lastActiveAt
                        ? u.stats.lastActiveAt.toLocaleDateString()
                        : "Never"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
