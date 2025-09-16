"use client";

import { useEffect, useState } from "react";
import type { ViewMode } from "./types";

export function useViewMode(storageKey: string, initial: ViewMode = "table") {
  const [mode, setMode] = useState<ViewMode>(initial);

  useEffect(() => {
    try {
      const saved = typeof window !== "undefined" ? window.localStorage.getItem(storageKey) : null;
      if (saved === "table" || saved === "card" || saved === "details") setMode(saved);
    } catch (_err) {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  useEffect(() => {
    try {
      if (typeof window !== "undefined") window.localStorage.setItem(storageKey, mode);
    } catch (_err) {}
  }, [mode, storageKey]);

  return [mode, setMode] as const;
}
