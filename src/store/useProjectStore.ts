"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Project } from "@/types/project";

function id() {
  return Math.random().toString(36).slice(2, 10);
}

const seedProjects: Project[] = [
  {
    id: id(),
    name: "Login Redesign",
    description: "Modernize authentication flow",
    category: "Product",
    department: "Engineering",
    owner: "Alex Chen",
    status: "In Progress",
    priority: "High",
    progress: 40,
    startDate: "2026-01-05",
    endDate: "2026-02-15",
    color: "#3b82f6",
    milestone: false,
    tags: ["auth", "ux"],
  },
  {
    id: id(),
    name: "AI Search",
    description: "Semantic search across roadmap data",
    category: "Product",
    department: "Engineering",
    owner: "Priya Nair",
    status: "Planning",
    priority: "Critical",
    progress: 10,
    startDate: "2026-03-01",
    endDate: "2026-04-10",
    color: "#a855f7",
    milestone: false,
    tags: ["ai", "search"],
  },
  {
    id: id(),
    name: "Payments Overhaul",
    description: "Migrate billing to new provider",
    category: "Infrastructure",
    department: "Finance",
    owner: "Sam Lee",
    status: "Blocked",
    priority: "High",
    progress: 5,
    startDate: "2026-04-01",
    endDate: "2026-05-20",
    color: "#f97316",
    milestone: true,
    tags: ["billing"],
  },
];

interface ProjectStore {
  projects: Project[];
  addProject: (p?: Partial<Project>) => void;
  updateProject: (id: string, patch: Partial<Project>) => void;
  removeProject: (id: string) => void;
  duplicateProject: (id: string) => void;
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set) => ({
      projects: seedProjects,
      addProject: (p) =>
        set((s) => ({
          projects: [
            ...s.projects,
            {
              id: id(),
              name: "New Project",
              description: "",
              category: "",
              department: "",
              owner: "",
              status: "Planning",
              priority: "Medium",
              progress: 0,
              startDate: new Date().toISOString().slice(0, 10),
              endDate: new Date().toISOString().slice(0, 10),
              color: "#64748b",
              milestone: false,
              tags: [],
              ...p,
            },
          ],
        })),
      updateProject: (id, patch) =>
        set((s) => ({
          projects: s.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        })),
      removeProject: (id) =>
        set((s) => ({ projects: s.projects.filter((p) => p.id !== id) })),
      duplicateProject: (projectId) =>
        set((s) => {
          const target = s.projects.find((p) => p.id === projectId);
          if (!target) return s;
          return { projects: [...s.projects, { ...target, id: id(), name: `${target.name} (copy)` }] };
        }),
    }),
    { name: "roadmap-studio-projects" }
  )
);
