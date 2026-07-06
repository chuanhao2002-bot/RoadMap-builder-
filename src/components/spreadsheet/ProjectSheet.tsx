"use client";

import { useState } from "react";
import { useProjectStore } from "@/store/useProjectStore";
import { useFilteredProjects } from "@/lib/useFilteredProjects";
import { PROJECT_COLUMNS, type Project, type ProjectStatus, type ProjectPriority } from "@/types/project";
import { exportProjectsAsCsv } from "@/lib/exportCsv";
import { Plus, Copy, Trash2, Download, X } from "lucide-react";

const STATUSES: ProjectStatus[] = ["Planning", "In Progress", "Blocked", "Completed"];
const PRIORITIES: ProjectPriority[] = ["Low", "Medium", "High", "Critical"];
const COLOR_PRESETS = [
  "#3b82f6",
  "#a855f7",
  "#f97316",
  "#10b981",
  "#ec4899",
  "#06b6d4",
  "#eab308",
  "#ef4444",
];

export function ProjectSheet() {
  const { updateProject, addProject, removeProject, duplicateProject } = useProjectStore();
  const projects = useFilteredProjects();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const allSelected = projects.length > 0 && selectedIds.length === projects.length;

  const toggleAll = () => {
    setSelectedIds(allSelected ? [] : projects.map((p) => p.id));
  };

  const toggleOne = (id: string) => {
    setSelectedIds((ids) => (ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id]));
  };

  const bulkUpdate = (patch: Partial<Project>) => {
    selectedIds.forEach((id) => updateProject(id, patch));
  };

  const bulkDelete = () => {
    selectedIds.forEach((id) => removeProject(id));
    setSelectedIds([]);
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-end">
        <button
          onClick={() => exportProjectsAsCsv(projects)}
          className="flex items-center gap-1.5 rounded-md bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-3 py-1.5 text-sm font-medium hover:opacity-90"
        >
          <Download size={14} /> Export CSV
        </button>
      </div>
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-neutral-900 dark:border-white bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-sm">
          <span className="font-medium">{selectedIds.length} selected</span>
          <select
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) bulkUpdate({ status: e.target.value as ProjectStatus });
              e.target.value = "";
            }}
            className="rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-2 py-1 text-sm"
          >
            <option value="" disabled>
              Set status...
            </option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) bulkUpdate({ priority: e.target.value as ProjectPriority });
              e.target.value = "";
            }}
            className="rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-2 py-1 text-sm"
          >
            <option value="" disabled>
              Set priority...
            </option>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <input
            placeholder="Set owner..."
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.currentTarget.value.trim()) {
                bulkUpdate({ owner: e.currentTarget.value.trim() });
                e.currentTarget.value = "";
              }
            }}
            className="rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-2 py-1 text-sm w-32"
          />
          <button
            onClick={bulkDelete}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
          >
            <Trash2 size={14} /> Delete
          </button>
          <button
            onClick={() => setSelectedIds([])}
            className="ml-auto flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
          >
            <X size={14} /> Clear
          </button>
        </div>
      )}
      <div className="overflow-auto rounded-lg border border-neutral-200 dark:border-neutral-800">
      <table className="min-w-full text-sm">
        <thead className="sticky top-0 bg-neutral-100 dark:bg-neutral-900 z-10">
          <tr>
            <th className="w-8 px-2">
              <input type="checkbox" checked={allSelected} onChange={toggleAll} />
            </th>
            <th className="w-8" />
            {PROJECT_COLUMNS.map((c) => (
              <th key={c.key} className="px-3 py-2 text-left font-medium text-neutral-600 dark:text-neutral-300 whitespace-nowrap">
                {c.label}
              </th>
            ))}
            <th className="w-16" />
          </tr>
        </thead>
        <tbody>
          {projects.map((p) => (
            <tr key={p.id} className="border-t border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
              <td className="px-2">
                <input type="checkbox" checked={selectedIds.includes(p.id)} onChange={() => toggleOne(p.id)} />
              </td>
              <td className="px-2">
                <span className="inline-block w-3 h-3 rounded-full" style={{ background: p.color }} />
              </td>
              <WrapCell value={p.name} onChange={(v) => updateProject(p.id, { name: v })} />
              <WrapCell value={p.description} onChange={(v) => updateProject(p.id, { description: v })} />
              <Cell value={p.category} onChange={(v) => updateProject(p.id, { category: v })} />
              <Cell value={p.department} onChange={(v) => updateProject(p.id, { department: v })} />
              <Cell value={p.owner} onChange={(v) => updateProject(p.id, { owner: v })} />
              <SelectCell value={p.status} options={STATUSES} onChange={(v) => updateProject(p.id, { status: v as ProjectStatus })} />
              <SelectCell value={p.priority} options={PRIORITIES} onChange={(v) => updateProject(p.id, { priority: v as ProjectPriority })} />
              <td className="px-3 py-1">
                <input
                  type="date"
                  value={p.startDate}
                  onChange={(e) => updateProject(p.id, { startDate: e.target.value })}
                  className="bg-transparent outline-none"
                />
              </td>
              <td className="px-3 py-1">
                <input
                  type="date"
                  value={p.endDate}
                  onChange={(e) => updateProject(p.id, { endDate: e.target.value })}
                  className="bg-transparent outline-none"
                />
              </td>
              <ColorCell value={p.color} onChange={(v) => updateProject(p.id, { color: v })} />
              <td className="px-3 py-1 text-center">
                <input
                  type="checkbox"
                  checked={p.milestone}
                  onChange={(e) => updateProject(p.id, { milestone: e.target.checked })}
                />
              </td>
              <Cell value={p.targetGoal} onChange={(v) => updateProject(p.id, { targetGoal: v })} />
              <Cell value={p.mandays} onChange={(v) => updateProject(p.id, { mandays: v })} />
              <td className="px-2 py-1 whitespace-nowrap">
                <button onClick={() => duplicateProject(p.id)} className="p-1 text-neutral-400 hover:text-neutral-700">
                  <Copy size={14} />
                </button>
                <button onClick={() => removeProject(p.id)} className="p-1 text-neutral-400 hover:text-red-600">
                  <Trash2 size={14} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        onClick={() => addProject()}
        className="flex items-center gap-1 px-3 py-2 text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
      >
        <Plus size={14} /> Add row
      </button>
      </div>
    </div>
  );
}

function Cell({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <td className="px-3 py-1">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent outline-none min-w-[8rem]"
      />
    </td>
  );
}

function WrapCell({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <td className="px-3 py-1 align-top">
      <textarea
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          e.target.style.height = "auto";
          e.target.style.height = `${e.target.scrollHeight}px`;
        }}
        ref={(el) => {
          if (el) {
            el.style.height = "auto";
            el.style.height = `${el.scrollHeight}px`;
          }
        }}
        rows={1}
        className="w-full bg-transparent outline-none resize-none whitespace-pre-wrap break-words min-w-[10rem] leading-snug"
      />
    </td>
  );
}

function ColorCell({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <td className="px-3 py-1">
      <div className="flex items-center gap-1">
        {COLOR_PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            title={preset}
            onClick={() => onChange(preset)}
            className={`w-4 h-4 rounded-full shrink-0 transition-transform hover:scale-110 ${
              value.toLowerCase() === preset ? "ring-2 ring-offset-1 ring-neutral-500 dark:ring-offset-neutral-950" : ""
            }`}
            style={{ background: preset }}
          />
        ))}
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          title="Custom color"
          className="w-4 h-4 bg-transparent shrink-0 cursor-pointer"
        />
      </div>
    </td>
  );
}

function SelectCell<T extends string>({ value, options, onChange }: { value: T; options: T[]; onChange: (v: T) => void }) {
  return (
    <td className="px-3 py-1">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="bg-transparent outline-none"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </td>
  );
}

export type { Project };
