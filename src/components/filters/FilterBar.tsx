"use client";

import { useState } from "react";
import { useProjectStore } from "@/store/useProjectStore";
import { useFilterStore } from "@/store/useFilterStore";
import { isFiltersEmpty } from "@/types/filters";
import type { ProjectStatus, ProjectPriority } from "@/types/project";
import { Search, X, Bookmark, Trash2 } from "lucide-react";

const STATUSES: ProjectStatus[] = ["Planning", "In Progress", "Blocked", "Completed"];
const PRIORITIES: ProjectPriority[] = ["Low", "Medium", "High", "Critical"];

function toggle<T>(arr: T[], value: T): T[] {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
}

export function FilterBar() {
  const { projects } = useProjectStore();
  const { filters, setFilters, resetFilters, savedViews, activeSavedViewId, saveCurrentAsView, applySavedView, deleteSavedView } =
    useFilterStore();
  const [newViewName, setNewViewName] = useState("");

  const departments = [...new Set(projects.map((p) => p.department).filter(Boolean))];
  const categories = [...new Set(projects.map((p) => p.category).filter(Boolean))];
  const owners = [...new Set(projects.map((p) => p.owner).filter(Boolean))];

  const empty = isFiltersEmpty(filters);

  return (
    <div className="space-y-3 rounded-lg border border-neutral-200 dark:border-neutral-800 p-3">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-2 rounded-md border border-neutral-300 dark:border-neutral-700 px-2 py-1.5 flex-1 min-w-[180px]">
          <Search size={14} className="text-neutral-400" />
          <input
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
            placeholder="Search projects..."
            className="bg-transparent outline-none text-sm flex-1"
          />
        </div>

        <MultiSelect label="Status" options={STATUSES} selected={filters.status} onToggle={(v) => setFilters({ status: toggle(filters.status, v) })} />
        <MultiSelect label="Priority" options={PRIORITIES} selected={filters.priority} onToggle={(v) => setFilters({ priority: toggle(filters.priority, v) })} />
        <MultiSelect label="Request By" options={departments} selected={filters.department} onToggle={(v) => setFilters({ department: toggle(filters.department, v) })} />
        <MultiSelect label="Category" options={categories} selected={filters.category} onToggle={(v) => setFilters({ category: toggle(filters.category, v) })} />
        <MultiSelect label="Owner" options={owners} selected={filters.owner} onToggle={(v) => setFilters({ owner: toggle(filters.owner, v) })} />

        <input
          type="date"
          value={filters.startAfter}
          onChange={(e) => setFilters({ startAfter: e.target.value })}
          title="Start on/after"
          className="rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-2 py-1.5 text-sm"
        />
        <input
          type="date"
          value={filters.endBefore}
          onChange={(e) => setFilters({ endBefore: e.target.value })}
          title="End on/before"
          className="rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-2 py-1.5 text-sm"
        />

        {!empty && (
          <button onClick={resetFilters} className="flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-800">
            <X size={14} /> Clear
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-neutral-100 dark:border-neutral-900">
        <Bookmark size={14} className="text-neutral-400" />
        {savedViews.length === 0 && <span className="text-xs text-neutral-400">No saved views yet</span>}
        {savedViews.map((v) => (
          <span
            key={v.id}
            className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs cursor-pointer ${
              activeSavedViewId === v.id
                ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                : "bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300"
            }`}
            onClick={() => applySavedView(v.id)}
          >
            {v.name}
            <Trash2
              size={11}
              className="hover:text-red-500"
              onClick={(e) => {
                e.stopPropagation();
                deleteSavedView(v.id);
              }}
            />
          </span>
        ))}
        <div className="flex items-center gap-1 ml-auto">
          <input
            value={newViewName}
            onChange={(e) => setNewViewName(e.target.value)}
            placeholder="Save current filters as..."
            className="rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-2 py-1 text-xs w-44"
          />
          <button
            disabled={!newViewName.trim() || empty}
            onClick={() => {
              saveCurrentAsView(newViewName.trim());
              setNewViewName("");
            }}
            className="rounded-md bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 px-2 py-1 text-xs font-medium disabled:opacity-40"
          >
            Save view
          </button>
        </div>
      </div>
    </div>
  );
}

function MultiSelect<T extends string>({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: T[];
  selected: T[];
  onToggle: (v: T) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`rounded-md border px-2 py-1.5 text-sm ${
          selected.length
            ? "border-neutral-900 dark:border-white"
            : "border-neutral-300 dark:border-neutral-700"
        }`}
      >
        {label}
        {selected.length > 0 && ` (${selected.length})`}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 mt-1 min-w-[160px] max-h-56 overflow-auto rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-lg p-1">
            {options.length === 0 && <div className="px-2 py-1 text-xs text-neutral-400">No options</div>}
            {options.map((o) => (
              <label key={o} className="flex items-center gap-2 px-2 py-1 text-sm rounded hover:bg-neutral-100 dark:hover:bg-neutral-900 cursor-pointer">
                <input type="checkbox" checked={selected.includes(o)} onChange={() => onToggle(o)} />
                {o}
              </label>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
