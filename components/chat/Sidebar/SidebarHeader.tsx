"use client";

import Avatar from "@/components/shared/Avatar";
import LogoMark from "@/components/ui/LogoMark";
import { useAuth } from "@/contexts/AuthContext";

export default function SidebarHeader() {
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
      <LogoMark size={28} />
      <div className="flex items-center gap-2">
        <Avatar id={user.id} name={user.name} size="sm" />
        <span className="hidden text-default font-medium text-white sm:inline">{user.name}</span>
        <button
          type="button"
          onClick={logout}
          className="cursor-pointer rounded-pill border border-border px-3 py-1.5 text-meta font-medium text-pale-blue transition-colors hover:border-plum hover:text-white"
        >
          Log out
        </button>
      </div>
    </div>
  );
}
