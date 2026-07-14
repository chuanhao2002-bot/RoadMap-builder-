"use client";

import { useState } from "react";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { ChevronDown } from "lucide-react";

export function WorkspaceSwitcher() {
  const { workspaces, currentWorkspaceId, switchWorkspace } = useWorkspaceStore();
  const [open, setOpen] = useState(false);

  const current = workspaces.find((w) => w.id === currentWorkspaceId);
  if (!current) return null;
  if (workspaces.length <= 1) {
    return <div className="px-2 text-xs text-neutral-500 truncate mb-2">{current.name}</div>;
  }

  return (
    <div className="relative mb-2 px-2">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 truncate"
      >
        {current.name} <ChevronDown size={12} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 mt-1 min-w-[160px] rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-lg p-1">
            {workspaces.map((w) => (
              <button
                key={w.id}
                onClick={() => {
                  switchWorkspace(w.id);
                  setOpen(false);
                }}
                className={`block w-full text-left px-2 py-1.5 text-sm rounded hover:bg-neutral-100 dark:hover:bg-neutral-900 ${
                  w.id === currentWorkspaceId ? "font-semibold" : ""
                }`}
              >
                {w.name}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
