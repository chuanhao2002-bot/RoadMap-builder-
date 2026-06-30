"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Table2, GanttChartSquare, Settings } from "lucide-react";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: Table2 },
  { href: "/views", label: "Views", icon: GanttChartSquare },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <nav className="w-56 shrink-0 border-r border-neutral-200 dark:border-neutral-800 p-4 space-y-1">
      <div className="text-lg font-semibold mb-6 px-2">Roadmap Studio</div>
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
    </nav>
  );
}
