"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { EMPTY_FILTERS, type ProjectFilters, type SavedView } from "@/types/filters";

function id() {
  return Math.random().toString(36).slice(2, 10);
}

interface FilterStore {
  filters: ProjectFilters;
  activeSavedViewId: string | null;
  savedViews: SavedView[];
  setFilters: (patch: Partial<ProjectFilters>) => void;
  resetFilters: () => void;
  saveCurrentAsView: (name: string) => void;
  applySavedView: (id: string) => void;
  deleteSavedView: (id: string) => void;
}

export const useFilterStore = create<FilterStore>()(
  persist(
    (set, get) => ({
      filters: EMPTY_FILTERS,
      activeSavedViewId: null,
      savedViews: [],
      setFilters: (patch) =>
        set((s) => ({ filters: { ...s.filters, ...patch }, activeSavedViewId: null })),
      resetFilters: () => set({ filters: EMPTY_FILTERS, activeSavedViewId: null }),
      saveCurrentAsView: (name) =>
        set((s) => ({
          savedViews: [...s.savedViews, { id: id(), name, filters: s.filters }],
        })),
      applySavedView: (viewId) => {
        const view = get().savedViews.find((v) => v.id === viewId);
        if (view) set({ filters: view.filters, activeSavedViewId: viewId });
      },
      deleteSavedView: (viewId) =>
        set((s) => ({
          savedViews: s.savedViews.filter((v) => v.id !== viewId),
          activeSavedViewId: s.activeSavedViewId === viewId ? null : s.activeSavedViewId,
        })),
    }),
    { name: "roadmap-studio-filters" }
  )
);
