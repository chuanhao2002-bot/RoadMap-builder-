"use client";

import { create } from "zustand";
import { createClient } from "@/lib/supabase";
import { useToastStore } from "@/store/useToastStore";

export interface Workspace {
  id: string;
  name: string;
}

const CURRENT_WORKSPACE_KEY = "roadmap-studio:currentWorkspaceId";

interface WorkspaceStore {
  workspaces: Workspace[];
  currentWorkspaceId: string | null;
  loaded: boolean;
  init: (userId: string) => Promise<void>;
  reset: () => void;
  switchWorkspace: (id: string) => void;
  renameWorkspace: (id: string, name: string) => Promise<boolean>;
  createInvite: (email: string) => Promise<string | null>;
  acceptInvite: (token: string, userId: string) => Promise<boolean>;
}

export const useWorkspaceStore = create<WorkspaceStore>()((set, get) => ({
  workspaces: [],
  currentWorkspaceId: null,
  loaded: false,

  init: async (userId) => {
    if (get().loaded) return;
    const supabase = createClient();

    const { data, error } = await supabase
      .from("workspace_members")
      .select("workspace_id, workspaces(id, name)")
      .eq("user_id", userId);

    if (error) {
      console.error("Failed to load workspaces", error);
      useToastStore.getState().push("Could not load your workspaces — check your connection and reload.");
      set({ loaded: true });
      return;
    }

    type Row = { workspace_id: string; workspaces: { id: string; name: string } | { id: string; name: string }[] | null };
    const workspaces: Workspace[] = ((data ?? []) as Row[])
      .map((row) => {
        const w = Array.isArray(row.workspaces) ? row.workspaces[0] : row.workspaces;
        return w ? { id: w.id, name: w.name } : null;
      })
      .filter((w): w is Workspace => w !== null);

    const stored = typeof window !== "undefined" ? window.localStorage.getItem(CURRENT_WORKSPACE_KEY) : null;
    const currentWorkspaceId =
      (stored && workspaces.some((w) => w.id === stored) ? stored : workspaces[0]?.id) ?? null;

    set({ workspaces, currentWorkspaceId, loaded: true });
  },

  reset: () => {
    set({ workspaces: [], currentWorkspaceId: null, loaded: false });
  },

  switchWorkspace: (id) => {
    if (typeof window !== "undefined") window.localStorage.setItem(CURRENT_WORKSPACE_KEY, id);
    set({ currentWorkspaceId: id });
  },

  renameWorkspace: async (id, name) => {
    const trimmed = name.trim();
    if (!trimmed) return false;
    const previous = get().workspaces;
    set((s) => ({ workspaces: s.workspaces.map((w) => (w.id === id ? { ...w, name: trimmed } : w)) }));

    const supabase = createClient();
    const { error } = await supabase.from("workspaces").update({ name: trimmed }).eq("id", id);
    if (error) {
      console.error("Failed to rename workspace", error);
      useToastStore.getState().push("Failed to rename workspace — only the owner can rename it.");
      set({ workspaces: previous });
      return false;
    }
    return true;
  },

  createInvite: async (email) => {
    const workspaceId = get().currentWorkspaceId;
    if (!workspaceId) return null;
    const supabase = createClient();
    const { data, error } = await supabase
      .from("workspace_invites")
      .insert({ workspace_id: workspaceId, email: email.trim() || null })
      .select("token")
      .single();
    if (error || !data) {
      console.error("Failed to create invite", error);
      useToastStore.getState().push("Failed to create invite link.");
      return null;
    }
    return data.token as string;
  },

  acceptInvite: async (token, userId) => {
    const supabase = createClient();
    const { data: invite, error: findError } = await supabase
      .from("workspace_invites")
      .select("id, workspace_id, accepted_at")
      .eq("token", token)
      .single();

    if (findError || !invite) {
      useToastStore.getState().push("This invite link is invalid.");
      return false;
    }

    const { error: joinError } = await supabase
      .from("workspace_members")
      .insert({ workspace_id: invite.workspace_id, user_id: userId, role: "member" });

    // 23505 = unique_violation, i.e. this user is already a member — that's fine.
    if (joinError && joinError.code !== "23505" && !joinError.message.toLowerCase().includes("duplicate")) {
      console.error("Failed to join workspace", joinError);
      useToastStore.getState().push("Failed to join workspace.");
      return false;
    }

    await supabase.from("workspace_invites").update({ accepted_at: new Date().toISOString() }).eq("id", invite.id);

    if (typeof window !== "undefined") window.localStorage.setItem(CURRENT_WORKSPACE_KEY, invite.workspace_id);
    set({ loaded: false, currentWorkspaceId: invite.workspace_id });
    await get().init(userId);
    return true;
  },
}));
