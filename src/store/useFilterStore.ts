"use client";

import { create } from "zustand";
import { createClient } from "@/lib/supabase";
import { EMPTY_FILTERS, type ProjectFilters, type SavedView } from "@/types/filters";

interface SavedViewRow {
  id: string;
  name: string;
  filters: ProjectFilters;
}

let savedViewsRealtimeUnsubscribe: (() => void) | null = null;

interface FilterStore {
  filters: ProjectFilters;
  activeSavedViewId: string | null;
  savedViews: SavedView[];
  loaded: boolean;
  init: () => Promise<void>;
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
  loaded: false,

  init: async () => {
    if (get().loaded) return;
    savedViewsRealtimeUnsubscribe?.();
    set({ loaded: false, savedViews: [] });

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

    const channel = supabase
      .channel("saved-views-shared")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "saved_views" },
        (payload) => {
          set((s) => {
            if (payload.eventType === "DELETE") {
              const deletedId = (payload.old as SavedViewRow).id;
              return {
                savedViews: s.savedViews.filter((v) => v.id !== deletedId),
                activeSavedViewId: s.activeSavedViewId === deletedId ? null : s.activeSavedViewId,
              };
            }
            const row = payload.new as SavedViewRow;
            const incoming: SavedView = { id: row.id, name: row.name, filters: row.filters };
            const exists = s.savedViews.some((v) => v.id === incoming.id);
            return {
              savedViews: exists
                ? s.savedViews.map((v) => (v.id === incoming.id ? incoming : v))
                : [...s.savedViews, incoming],
            };
          });
        }
      )
      .subscribe();

    savedViewsRealtimeUnsubscribe = () => {
      supabase.removeChannel(channel);
    };
  },

  reset: () => {
    savedViewsRealtimeUnsubscribe?.();
    savedViewsRealtimeUnsubscribe = null;
    set({ savedViews: [], loaded: false, filters: EMPTY_FILTERS, activeSavedViewId: null });
  },

  setFilters: (patch) =>
    set((s) => ({ filters: { ...s.filters, ...patch }, activeSavedViewId: null })),

  resetFilters: () => set({ filters: EMPTY_FILTERS, activeSavedViewId: null }),

  saveCurrentAsView: (name) => {
    const filters = get().filters;
    const supabase = createClient();
    supabase
      .from("saved_views")
      .insert({ name, filters })
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
