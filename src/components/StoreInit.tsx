"use client";

import { useEffect } from "react";
import { useProjectStore } from "@/store/useProjectStore";
import { useFilterStore } from "@/store/useFilterStore";

export function StoreInit() {
  useEffect(() => {
    useProjectStore.getState().init();
    useFilterStore.getState().init();
  }, []);

  return null;
}
