"use client";

import { create } from "zustand";
import { createClient } from "@/lib/supabase";
import { EMPTY_FILTERS, type ProjectFilters, type SavedView } from "@/types/filters";

interface SavedViewRow {
  id: string;
  name: string;
  filters: ProjectFilters;
}

interface FilterStore {
  filters: ProjectFilters;
  activeSavedViewId: string | null;
  savedViews: SavedView[];
  userId: string | null;
  loaded: boolean;
  init: (userId: string) => Promise<void>;
  reset: () => void;
  setFilters: (patch: Partial<ProjectFilters>) => void;
  resetFilters: () => void;
  saveCurrentAsView: (name: string) => void;
  applySavedView: (id: string) => void;
  deleteSavedView: (id: string) => void;
}

export const useFilterStore = create<FilterStore>()((set, get) => ({
  filters: EMPTY_FILTERS,
  activeSavedViewId: null,
  savedViews: [],
  userId: null,
  loaded: false,

  init: async (userId) => {
    if (get().userId === userId && get().loaded) return;
    set({ userId, loaded: false, savedViews: [] });

    const supabase = createClient();
    const { data, error } = await supabase
      .from("saved_views")
      .select("id, name, filters")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Failed to load saved views", error);
      set({ loaded: true });
      return;
    }

    const rows = (data ?? []) as SavedViewRow[];
    set({ savedViews: rows.map((r) => ({ id: r.id, name: r.name, filters: r.filters })), loaded: true });
  },

  reset: () => set({ savedViews: [], userId: null, loaded: false, filters: EMPTY_FILTERS, activeSavedViewId: null }),

  setFilters: (patch) =>
    set((s) => ({ filters: { ...s.filters, ...patch }, activeSavedViewId: null })),

  resetFilters: () => set({ filters: EMPTY_FILTERS, activeSavedViewId: null }),

  saveCurrentAsView: (name) => {
    const userId = get().userId;
    if (!userId) return;
    const filters = get().filters;
    const supabase = createClient();
    supabase
      .from("saved_views")
      .insert({ user_id: userId, name, filters })
      .select("id, name, filters")
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          console.error("Failed to save view", error);
          return;
        }
        const row = data as SavedViewRow;
        set((s) => ({
          savedViews: [...s.savedViews, { id: row.id, name: row.name, filters: row.filters }],
        }));
      });
  },

  applySavedView: (viewId) => {
    const view = get().savedViews.find((v) => v.id === viewId);
    if (view) set({ filters: view.filters, activeSavedViewId: viewId });
  },

  deleteSavedView: (viewId) => {
    set((s) => ({
      savedViews: s.savedViews.filter((v) => v.id !== viewId),
      activeSavedViewId: s.activeSavedViewId === viewId ? null : s.activeSavedViewId,
    }));
    const supabase = createClient();
    supabase
      .from("saved_views")
      .delete()
      .eq("id", viewId)
      .then(({ error }) => {
        if (error) console.error("Failed to delete saved view", error);
      });
  },
}));
