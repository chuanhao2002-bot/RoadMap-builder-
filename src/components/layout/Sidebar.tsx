"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Table2, GanttChartSquare, ListTodo, Settings, PanelLeftClose, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { useSession } from "@/lib/useSession";
import { WorkspaceSwitcher } from "@/components/layout/WorkspaceSwitcher";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: Table2 },
  { href: "/views", label: "Views", icon: GanttChartSquare },
  { href: "/todos", label: "To-Do", icon: ListTodo },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ onCollapse }: { onCollapse: () => void }) {
  const pathname = usePathname();
  const { user } = useSession();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
  };

  return (
    <nav className="w-56 shrink-0 border-r border-neutral-200 dark:border-neutral-800 p-4 flex flex-col">
      <div className="flex items-center justify-between mb-2 px-2">
        <span className="text-lg font-semibold">Roadmap Studio</span>
        <button
          onClick={onCollapse}
          title="Hide sidebar"
          className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-900 dark:hover:text-neutral-200"
        >
          <PanelLeftClose size={16} />
        </button>
      </div>
      <WorkspaceSwitcher />
      <div className="space-y-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${
                active
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                  : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900"
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </div>
      <div className="mt-auto pt-4 border-t border-neutral-100 dark:border-neutral-900 space-y-1">
        {user && <div className="px-2 text-xs text-neutral-400 truncate">{user.email}</div>}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 w-full rounded-md px-3 py-2 text-sm text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </nav>
  );
}
