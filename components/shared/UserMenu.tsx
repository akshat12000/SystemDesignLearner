"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { User, LayoutDashboard, LogOut, Shield, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface UserMenuProps {
  name: string | null;
  email: string;
  isAdmin?: boolean;
}

export function UserMenu({ name, email, isAdmin }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const initials = name
    ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : email[0].toUpperCase();

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/");
    router.refresh();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-2.5 rounded-lg px-3 py-2 transition-colors",
          "bg-[#1A1D27] border border-[#2D3148] hover:border-indigo-500/40",
          open && "border-indigo-500/40"
        )}
      >
        {/* Avatar */}
        <div className="w-7 h-7 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
          <span className="text-xs font-semibold text-indigo-300">{initials}</span>
        </div>
        <span className="text-sm text-slate-200 hidden sm:block max-w-[120px] truncate">
          {name ?? email}
        </span>
        {isAdmin && (
          <Shield className="h-3 w-3 text-rose-400 shrink-0" />
        )}
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-slate-400 shrink-0 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-56 rounded-xl border border-[#2D3148] bg-[#1A1D27] shadow-xl z-50 overflow-hidden">
            {/* Identity */}
            <div className="px-4 py-3 border-b border-[#2D3148]">
              <p className="text-sm font-medium text-slate-200 truncate">{name ?? "User"}</p>
              <p className="text-xs text-slate-500 truncate mt-0.5">{email}</p>
              {isAdmin && (
                <span className="inline-flex items-center gap-1 mt-1.5 text-xs text-rose-400 bg-rose-400/10 px-2 py-0.5 rounded-md">
                  <Shield className="h-3 w-3" /> Admin
                </span>
              )}
            </div>

            {/* Menu items */}
            <div className="py-1.5">
              <MenuItem href="/dashboard" icon={<LayoutDashboard className="h-4 w-4" />} onClick={() => setOpen(false)}>
                Dashboard
              </MenuItem>
              {isAdmin && (
                <MenuItem href="/admin" icon={<Shield className="h-4 w-4 text-rose-400" />} onClick={() => setOpen(false)}>
                  <span className="text-rose-400">Admin panel</span>
                </MenuItem>
              )}
            </div>

            <div className="border-t border-[#2D3148] py-1.5">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function MenuItem({
  href,
  icon,
  children,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-[#2D3148]/60 hover:text-slate-100 transition-colors"
    >
      <span className="text-slate-400">{icon}</span>
      {children}
    </Link>
  );
}
