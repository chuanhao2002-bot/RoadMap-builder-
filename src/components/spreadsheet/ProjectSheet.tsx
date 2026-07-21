"use client";

import { useRef, useState } from "react";
import { useProjectStore } from "@/store/useProjectStore";
import { useFilteredProjects } from "@/lib/useFilteredProjects";
import { PROJECT_COLUMNS, type Project, type ProjectStatus, type ProjectPriority } from "@/types/project";
import { STATUSES, PRIORITIES } from "@/lib/projectOptions";
import { exportProjectsAsCsv } from "@/lib/exportCsv";
import { parseProjectsCsv } from "@/lib/importCsv";
import { COLOR_PALETTE, colorForCategory } from "@/lib/colorPalette";
import { Plus, Copy, Trash2, Download, Upload, X } from "lucide-react";

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

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportFile = async (file: File) => {
    const text = await file.text();
    const parsed = parseProjectsCsv(text);
    parsed.forEach((p) => addProject(p));
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-end gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImportFile(file);
            e.target.value = "";
          }}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 rounded-md border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-900"
        >
          <Upload size={14} /> Import CSV
        </button>
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
            <th className="px-3 py-2 text-left font-medium text-neutral-600 dark:text-neutral-300 whitespace-nowrap">
              Depends On
            </th>
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
              <Cell
                value={p.category}
                onChange={(v) => updateProject(p.id, { category: v, color: colorForCategory(v) })}
              />
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
              <td className="px-3 py-1">
                <input
                  type="date"
                  value={p.actualStartDate}
                  onChange={(e) => updateProject(p.id, { actualStartDate: e.target.value })}
                  className="bg-transparent outline-none"
                />
              </td>
              <td className="px-3 py-1">
                <div className="flex items-center gap-1.5">
                  <input
                    type="date"
                    value={p.actualEndDate}
                    onChange={(e) => updateProject(p.id, { actualEndDate: e.target.value })}
                    className="bg-transparent outline-none"
                  />
                  <SlippageBadge endDate={p.endDate} actualEndDate={p.actualEndDate} />
                </div>
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
              <td className="px-3 py-1">
                <div className="flex items-center gap-2 min-w-[7rem]">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={p.progress}
                    onChange={(e) => updateProject(p.id, { progress: Number(e.target.value) })}
                    className="w-16"
                  />
                  <span className="text-xs text-neutral-500 w-8 text-right">{p.progress}%</span>
                </div>
              </td>
              <DependsOnCell
                project={p}
                allProjects={projects}
                onChange={(ids) => updateProject(p.id, { dependsOn: ids })}
              />
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
        {COLOR_PALETTE.map((preset) => (
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

function SlippageBadge({ endDate, actualEndDate }: { endDate: string; actualEndDate: string }) {
  if (!actualEndDate || !endDate) return null;
  const planned = new Date(endDate);
  const actual = new Date(actualEndDate);
  if (Number.isNaN(planned.getTime()) || Number.isNaN(actual.getTime())) return null;
  const diffDays = Math.round((actual.getTime() - planned.getTime()) / 86400000);
  const late = diffDays > 0;
  const text = diffDays === 0 ? "On time" : late ? `+${diffDays}d` : `${Math.abs(diffDays)}d early`;
  return (
    <span
      className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium whitespace-nowrap ${
        late
          ? "bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400"
          : "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
      }`}
    >
      {text}
    </span>
  );
}

function DependsOnCell({
  project,
  allProjects,
  onChange,
}: {
  project: Project;
  allProjects: Project[];
  onChange: (ids: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const options = allProjects.filter((p) => p.id !== project.id);
  const selectedNames = project.dependsOn
    .map((id) => allProjects.find((p) => p.id === id)?.name)
    .filter((n): n is string => !!n);

  const toggle = (id: string) => {
    onChange(project.dependsOn.includes(id) ? project.dependsOn.filter((i) => i !== id) : [...project.dependsOn, id]);
  };

  return (
    <td className="px-3 py-1 relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full text-left truncate rounded-md px-1.5 py-1 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-900 min-w-[8rem]"
      >
        {selectedNames.length > 0 ? (
          <span className="truncate">{selectedNames.join(", ")}</span>
        ) : (
          <span className="italic text-neutral-400">None</span>
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 mt-1 min-w-[200px] max-h-56 overflow-auto rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-lg p-1">
            {options.length === 0 && <div className="px-2 py-1 text-xs text-neutral-400">No other projects</div>}
            {options.map((o) => (
              <label
                key={o.id}
                className="flex items-center gap-2 px-2 py-1 text-sm rounded hover:bg-neutral-100 dark:hover:bg-neutral-900 cursor-pointer"
              >
                <input type="checkbox" checked={project.dependsOn.includes(o.id)} onChange={() => toggle(o.id)} />
                <span className="truncate">{o.name}</span>
              </label>
            ))}
          </div>
        </>
      )}
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
