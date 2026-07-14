"use client";

import { useEffect } from "react";
import { useProjectStore } from "@/store/useProjectStore";
import { useFilterStore } from "@/store/useFilterStore";
import { useTodoStore } from "@/store/useTodoStore";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { useSession } from "@/lib/useSession";

export function StoreInit() {
  const { user, loading } = useSession();
  const workspaceId = useWorkspaceStore((s) => s.currentWorkspaceId);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      useWorkspaceStore.getState().reset();
      useProjectStore.getState().reset();
      useTodoStore.getState().reset();
      useFilterStore.getState().reset();
      return;
    }
    useWorkspaceStore.getState().init(user.id);
  }, [loading, user]);

  useEffect(() => {
    if (!workspaceId) return;
    useProjectStore.getState().init(workspaceId);
    useTodoStore.getState().init(workspaceId);
    useFilterStore.getState().init(workspaceId);
  }, [workspaceId]);

  return null;
}
