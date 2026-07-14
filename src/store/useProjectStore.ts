"use client";

import { create } from "zustand";
import { createClient } from "@/lib/supabase";
import { projectToRow, rowToProject, type ProjectRow } from "@/lib/projectMapper";
import type { Project } from "@/types/project";
import { useToastStore } from "@/store/useToastStore";

function id() {
  return Math.random().toString(36).slice(2, 10);
}

const seedProjects: Omit<Project, "id">[] = [
  {
    name: "Login Redesign",
    description: "Modernize authentication flow",
    category: "Product",
    department: "Engineering",
    owner: "Alex Chen",
    status: "In Progress",
    priority: "High",
    startDate: "2026-01-05",
    endDate: "2026-02-15",
    color: "#3b82f6",
    milestone: false,
    targetGoal: "",
    mandays: "",
    progress: 0,
    actualStartDate: "",
    actualEndDate: "",
    updatedAt: "",
    dependsOn: [],
  },
  {
    name: "AI Search",
    description: "Semantic search across roadmap data",
    category: "Product",
    department: "Engineering",
    owner: "Priya Nair",
    status: "Planning",
    priority: "Critical",
    startDate: "2026-03-01",
    endDate: "2026-04-10",
    color: "#a855f7",
    milestone: false,
    targetGoal: "",
    mandays: "",
    progress: 0,
    actualStartDate: "",
    actualEndDate: "",
    updatedAt: "",
    dependsOn: [],
  },
  {
    name: "Payments Overhaul",
    description: "Migrate billing to new provider",
    category: "Infrastructure",
    department: "Finance",
    owner: "Sam Lee",
    status: "Blocked",
    priority: "High",
    startDate: "2026-04-01",
    endDate: "2026-05-20",
    color: "#f97316",
    milestone: true,
    targetGoal: "",
    mandays: "",
    progress: 0,
    actualStartDate: "",
    actualEndDate: "",
    updatedAt: "",
    dependsOn: [],
  },
];

let realtimeUnsubscribe: (() => void) | null = null;

interface ProjectStore {
  projects: Project[];
  loaded: boolean;
  workspaceId: string | null;
  init: (workspaceId: string) => Promise<void>;
  reset: () => void;
  addProject: (p?: Partial<Project>) => void;
  updateProject: (id: string, patch: Partial<Project>) => void;
  removeProject: (id: string) => void;
  duplicateProject: (id: string) => void;
}

export const useProjectStore = create<ProjectStore>()((set, get) => ({
  projects: [],
  loaded: false,
  workspaceId: null,

  init: async (workspaceId) => {
    if (get().loaded && get().workspaceId === workspaceId) return;
    realtimeUnsubscribe?.();
    set({ loaded: false, projects: [], workspaceId });

    const supabase = createClient();
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Failed to load projects", error);
      useToastStore.getState().push("Could not load projects — check your connection and reload.");
      set({ loaded: true });
      return;
    }

    let rows = (data ?? []) as ProjectRow[];

    if (rows.length === 0) {
      const { data: inserted, error: insertError } = await supabase
        .from("projects")
        .insert(seedProjects.map((p) => ({ ...projectToRow(p), workspace_id: workspaceId })))
        .select("*");
      if (insertError) {
        console.error("Failed to seed projects", insertError);
      } else {
        rows = (inserted ?? []) as ProjectRow[];
      }
    }

    set({ projects: rows.map(rowToProject), loaded: true });

    const channel = supabase
      .channel(`projects-${workspaceId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "projects", filter: `workspace_id=eq.${workspaceId}` },
        (payload) => {
          set((s) => {
            if (payload.eventType === "DELETE") {
              return { projects: s.projects.filter((p) => p.id !== (payload.old as ProjectRow).id) };
            }
            const incoming = rowToProject(payload.new as ProjectRow);
            const exists = s.projects.some((p) => p.id === incoming.id);
            return {
              projects: exists
                ? s.projects.map((p) => (p.id === incoming.id ? incoming : p))
                : [...s.projects, incoming],
            };
          });
        }
      )
      .subscribe();

    realtimeUnsubscribe = () => {
      supabase.removeChannel(channel);
    };
  },

  reset: () => {
    realtimeUnsubscribe?.();
    realtimeUnsubscribe = null;
    set({ projects: [], loaded: false, workspaceId: null });
  },

  addProject: (p) => {
    const workspaceId = get().workspaceId;
    if (!workspaceId) return;
    const optimistic: Project = {
      id: id(),
      name: "New Project",
      description: "",
      category: "",
      department: "",
      owner: "",
      status: "Planning",
      priority: "Medium",
      startDate: new Date().toISOString().slice(0, 10),
      endDate: new Date().toISOString().slice(0, 10),
      color: "#64748b",
      milestone: false,
      targetGoal: "",
      mandays: "",
      progress: 0,
      actualStartDate: "",
      actualEndDate: "",
      updatedAt: "",
      dependsOn: [],
      ...p,
    };
    set((s) => ({ projects: [...s.projects, optimistic] }));

    const supabase = createClient();
    supabase
      .from("projects")
      .insert({ ...projectToRow(optimistic), workspace_id: workspaceId })
      .select("*")
      .single()
      .then(({ data, error }) => {
        if (error) {
          console.error("Failed to add project", error);
          useToastStore.getState().push("Failed to save new project — it was not persisted.");
          set((s) => ({ projects: s.projects.filter((proj) => proj.id !== optimistic.id) }));
          return;
        }
        const saved = rowToProject(data as ProjectRow);
        set((s) => ({
          projects: s.projects.map((proj) => (proj.id === optimistic.id ? saved : proj)),
        }));
      });
  },

  updateProject: (projectId, patch) => {
    const previous = get().projects.find((p) => p.id === projectId);
    set((s) => ({
      projects: s.projects.map((p) => (p.id === projectId ? { ...p, ...patch } : p)),
    }));
    const supabase = createClient();
    supabase
      .from("projects")
      .update(projectToRow(patch))
      .eq("id", projectId)
      .then(({ error }) => {
        if (error) {
          console.error("Failed to update project", error);
          useToastStore.getState().push("Failed to save your change — it was not persisted.");
          if (previous) {
            set((s) => ({
              projects: s.projects.map((p) => (p.id === projectId ? previous : p)),
            }));
          }
        }
      });
  },

  removeProject: (projectId) => {
    const previous = get().projects;
    set((s) => ({ projects: s.projects.filter((p) => p.id !== projectId) }));
    const supabase = createClient();
    supabase
      .from("projects")
      .delete()
      .eq("id", projectId)
      .then(({ error }) => {
        if (error) {
          console.error("Failed to remove project", error);
          useToastStore.getState().push("Failed to delete project — it was not removed.");
          set({ projects: previous });
        }
      });
  },

  duplicateProject: (projectId) => {
    const target = get().projects.find((p) => p.id === projectId);
    const workspaceId = get().workspaceId;
    if (!target || !workspaceId) return;
    const copy: Project = { ...target, id: id(), name: `${target.name} (copy)` };
    set((s) => ({ projects: [...s.projects, copy] }));

    const supabase = createClient();
    supabase
      .from("projects")
      .insert({ ...projectToRow(copy), workspace_id: workspaceId })
      .select("*")
      .single()
      .then(({ data, error }) => {
        if (error) {
          console.error("Failed to duplicate project", error);
          useToastStore.getState().push("Failed to save duplicated project — it was not persisted.");
          set((s) => ({ projects: s.projects.filter((p) => p.id !== copy.id) }));
          return;
        }
        const saved = rowToProject(data as ProjectRow);
        set((s) => ({
          projects: s.projects.map((p) => (p.id === copy.id ? saved : p)),
        }));
      });
  },
}));
