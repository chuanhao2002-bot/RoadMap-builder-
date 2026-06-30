"use client";

import { useState } from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Sidebar } from "./Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  const toggle = () => setCollapsed((prev) => !prev);

  return (
    <div className="min-h-full flex">
      {!collapsed && <Sidebar />}
      <main className="flex-1 p-6 overflow-auto relative">
        <button
          onClick={toggle}
          title={collapsed ? "Show sidebar" : "Hide sidebar"}
          className="absolute top-4 left-4 z-20 p-1.5 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-900 dark:hover:text-neutral-200"
        >
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
        <div className={collapsed ? "pl-8" : ""}>{children}</div>
      </main>
    </div>
  );
}
