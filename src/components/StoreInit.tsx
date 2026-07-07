"use client";

import { useEffect } from "react";
import { useProjectStore } from "@/store/useProjectStore";
import { useFilterStore } from "@/store/useFilterStore";
import { useTodoStore } from "@/store/useTodoStore";

export function StoreInit() {
  useEffect(() => {
    useProjectStore.getState().init();
    useFilterStore.getState().init();
    useTodoStore.getState().init();
  }, []);

  return null;
}
