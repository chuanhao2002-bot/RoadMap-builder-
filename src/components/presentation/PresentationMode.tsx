"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { TimelineRoadmap } from "@/components/roadmap/TimelineRoadmap";
import { SwimlaneRoadmap } from "@/components/roadmap/SwimlaneRoadmap";
import { KanbanBoard } from "@/components/roadmap/KanbanBoard";
import { X, Maximize, Minimize, Moon, Sun } from "lucide-react";

const VIEWS = [
  { id: "timeline", label: "Timeline" },
  { id: "swimlane", label: "Swimlane" },
  { id: "kanban", label: "Kanban" },
] as const;

type ViewId = (typeof VIEWS)[number]["id"];

const CONTROLS_HIDE_DELAY = 2500;

export function PresentationMode() {
  const router = useRouter();
  const [view, setView] = useState<ViewId>("timeline");
  const [dark, setDark] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const exit = useCallback(() => router.push("/views"), [router]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      rootRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }, []);

  const cycleView = useCallback((direction: 1 | -1) => {
    setView((current) => {
      const idx = VIEWS.findIndex((v) => v.id === current);
      const next = (idx + direction + VIEWS.length) % VIEWS.length;
      return VIEWS[next].id;
    });
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") exit();
      else if (e.key === "f" || e.key === "F") toggleFullscreen();
      else if (e.key === "ArrowRight") cycleView(1);
      else if (e.key === "ArrowLeft") cycleView(-1);
      else if (e.key === "1") setView("timeline");
      else if (e.key === "2") setView("swimlane");
      else if (e.key === "3") setView("kanban");
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [exit, toggleFullscreen, cycleView]);

  useEffect(() => {
    const showControls = () => {
      setControlsVisible(true);
      if (hideTimer.current) clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(() => setControlsVisible(false), CONTROLS_HIDE_DELAY);
    };
    showControls();
    window.addEventListener("mousemove", showControls);
    return () => {
      window.removeEventListener("mousemove", showControls);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className={`${dark ? "dark" : ""} fixed inset-0 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col`}
    >
      <div
        className={`flex items-center justify-between gap-3 px-4 py-2 border-b border-neutral-200 dark:border-neutral-800 transition-opacity duration-300 ${
          controlsVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="flex gap-1">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                view === v.id
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                  : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDark((d) => !d)}
            className="p-2 rounded-md text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
            title="Toggle dark mode"
          >
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-md text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
            title="Toggle fullscreen (f)"
          >
            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
          </button>
          <button
            onClick={exit}
            className="p-2 rounded-md text-neutral-500 hover:text-red-600"
            title="Exit presentation (Esc)"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {view === "timeline" && <TimelineRoadmap />}
        {view === "swimlane" && <SwimlaneRoadmap />}
        {view === "kanban" && <KanbanBoard />}
      </div>
    </div>
  );
}
