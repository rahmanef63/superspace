/**
 * Layout Switcher
 * 
 * Allows dynamic switching between different layout modes.
 * Perfect for features that can show data in different structural patterns.
 * 
 * Example: File explorer that switches between tree view and flat list view
 */

"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LayoutGrid, Sidebar as SidebarIcon } from "lucide-react";

export type LayoutMode = "sidebar" | "view" | "both";

export interface LayoutSwitcherProps {
  children: React.ReactNode;
  mode?: LayoutMode;
  onModeChange?: (mode: LayoutMode) => void;
  storageKey?: string;
  showToggle?: boolean;
  togglePosition?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  className?: string;
}

/**
 * LayoutSwitcher - Switch between layout modes
 * 
 * @example
 * ```tsx
 * <LayoutSwitcher
 *   mode={layoutMode}
 *   onModeChange={setLayoutMode}
 *   showToggle
 * >
 *   {layoutMode === "sidebar" ? (
 *     <SecondarySidebarLayout sidebar={<Tree />}>
 *       <Editor />
 *     </SecondarySidebarLayout>
 *   ) : (
 *     <ViewProvider data={items}>
 *       <ViewRenderer />
 *     </ViewProvider>
 *   )}
 * </LayoutSwitcher>
 * ```
 */
export function LayoutSwitcher({
  children,
  mode: controlledMode,
  onModeChange,
  storageKey,
  showToggle = false,
  togglePosition = "top-right",
  className,
}: LayoutSwitcherProps) {
  // Internal state management
  const [internalMode, setInternalMode] = useState<LayoutMode>(() => {
    if (typeof window === "undefined" || !storageKey) return "view";
    
    const stored = localStorage.getItem(storageKey);
    return (stored as LayoutMode) || "view";
  });

  const mode = controlledMode ?? internalMode;
  
  const handleModeChange = (newMode: LayoutMode) => {
    if (onModeChange) {
      onModeChange(newMode);
    } else {
      setInternalMode(newMode);
      if (storageKey) {
        localStorage.setItem(storageKey, newMode);
      }
    }
  };

  // Sync with localStorage
  useEffect(() => {
    if (storageKey && !controlledMode) {
      localStorage.setItem(storageKey, mode);
    }
  }, [mode, storageKey, controlledMode]);

  const toggleButton = showToggle && (
    <div
      className={cn(
        "absolute z-10",
        togglePosition === "top-left" && "top-4 left-4",
        togglePosition === "top-right" && "top-4 right-4",
        togglePosition === "bottom-left" && "bottom-4 left-4",
        togglePosition === "bottom-right" && "bottom-4 right-4"
      )}
    >
      <div className="flex gap-1 rounded-lg border border-border bg-background p-1 shadow-sm">
        <Button
          size="sm"
          variant={mode === "sidebar" ? "default" : "ghost"}
          onClick={() => handleModeChange("sidebar")}
          title="Sidebar Mode"
        >
          <SidebarIcon className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant={mode === "view" ? "default" : "ghost"}
          onClick={() => handleModeChange("view")}
          title="View Mode"
        >
          <LayoutGrid className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className={cn("relative h-full w-full", className)}>
      {toggleButton}
      {children}
    </div>
  );
}

/**
 * useLayoutMode Hook
 * 
 * Manage layout mode state with localStorage persistence
 * 
 * @example
 * ```tsx
 * const [mode, setMode] = useLayoutMode("feature.layout", "view")
 * ```
 */
export function useLayoutMode(
  storageKey: string,
  defaultMode: LayoutMode = "view"
): [LayoutMode, (mode: LayoutMode) => void] {
  const [mode, setMode] = useState<LayoutMode>(() => {
    if (typeof window === "undefined") return defaultMode;
    
    const stored = localStorage.getItem(storageKey);
    return (stored as LayoutMode) || defaultMode;
  });

  const handleSetMode = (newMode: LayoutMode) => {
    setMode(newMode);
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, newMode);
    }
  };

  return [mode, handleSetMode];
}
