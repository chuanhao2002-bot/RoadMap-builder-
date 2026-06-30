"use client";

import { useToastStore } from "@/store/useToastStore";
import { X } from "lucide-react";

export function Toast() {
  const { toasts, dismiss } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 w-80">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-start gap-2 rounded-md border px-3 py-2 text-sm shadow-lg ${
            t.kind === "error"
              ? "bg-red-50 border-red-200 text-red-700 dark:bg-red-950 dark:border-red-900 dark:text-red-300"
              : "bg-neutral-900 border-neutral-800 text-white dark:bg-white dark:text-neutral-900"
          }`}
        >
          <span className="flex-1">{t.message}</span>
          <button onClick={() => dismiss(t.id)} className="opacity-70 hover:opacity-100">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
