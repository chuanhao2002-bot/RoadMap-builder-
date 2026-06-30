"use client";

import { useState } from "react";
import { TimelineRoadmap } from "@/components/roadmap/TimelineRoadmap";
import { SwimlaneRoadmap } from "@/components/roadmap/SwimlaneRoadmap";
import { KanbanBoard } from "@/components/roadmap/KanbanBoard";
import { FilterBar } from "@/components/filters/FilterBar";

const TABS = [
  { id: "timeline", label: "Timeline" },
  { id: "swimlane", label: "Swimlane" },
  { id: "kanban", label: "Kanban" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function ViewsPage() {
  const [tab, setTab] = useState<TabId>("timeline");

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Views</h1>
      <p className="text-sm text-neutral-500">
        Auto-generated from the Projects spreadsheet. No manual positioning.
      </p>

      <FilterBar />

      <div className="flex gap-1 border-b border-neutral-200 dark:border-neutral-800">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px ${
              tab === t.id
                ? "border-neutral-900 dark:border-white text-neutral-900 dark:text-white"
                : "border-transparent text-neutral-500 hover:text-neutral-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "timeline" && <TimelineRoadmap />}
      {tab === "swimlane" && <SwimlaneRoadmap />}
      {tab === "kanban" && <KanbanBoard />}
    </div>
  );
}
