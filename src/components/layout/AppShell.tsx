"use client";

import { useState } from "react";
import { PanelLeftOpen } from "lucide-react";
import { Sidebar } from "./Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  const toggle = () => setCollapsed((prev) => !prev);

  return (
    <div className="min-h-full flex">
      {!collapsed && <Sidebar onCollapse={toggle} />}
      <main className="flex-1 p-6 overflow-auto">
        {collapsed && (
          <button
            onClick={toggle}
            title="Show sidebar"
            className="mb-4 p-1.5 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-900 dark:hover:text-neutral-200"
          >
            <PanelLeftOpen size={18} />
          </button>
        )}
        {children}
      </main>
    </div>
  );
}
