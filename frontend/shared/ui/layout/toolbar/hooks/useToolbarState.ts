/**
 * Toolbar State Hook
 *
 * Manages toolbar state with localStorage persistence.
 *
 * @author SuperSpace Team
 * @version 1.0.0
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import type { ViewMode } from "../lib/types";

/**
 * Hook for managing toolbar state with persistence
 */
export function useToolbarState<T = any>(storageKey: string, initialState: T) {
  const [state, setState] = useState<T>(() => {
    if (typeof window === "undefined") return initialState;

    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : initialState;
    } catch {
      return initialState;
    }
  });

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch (error) {
      console.error("Failed to save toolbar state:", error);
    }
  }, [storageKey, state]);

  return [state, setState] as const;
}

/**
 * Hook for managing view mode state
 */
export function useViewMode(
  storageKey: string = "toolbar-view-mode",
  initialMode: ViewMode = "grid"
) {
  return useToolbarState<ViewMode>(storageKey, initialMode);
}

/**
 * Hook for managing search state with debounce
 */
export function useSearchState(
  storageKey?: string,
  initialValue: string = "",
  debounceMs: number = 300
) {
  const [value, setValue] = useState(initialValue);
  const [debouncedValue, setDebouncedValue] = useState(initialValue);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedValue(value);
    }, debounceMs);

    return () => clearTimeout(timeout);
  }, [value, debounceMs]);

  // Persist if storage key provided
  useEffect(() => {
    if (storageKey && debouncedValue) {
      try {
        localStorage.setItem(storageKey, debouncedValue);
      } catch {}
    }
  }, [storageKey, debouncedValue]);

  return {
    value,
    debouncedValue,
    setValue,
    clear: () => setValue(""),
  };
}

/**
 * Hook for managing sort state
 */
export function useSortState(
  storageKey: string = "toolbar-sort",
  initialSort?: string,
  initialDirection: "asc" | "desc" = "asc"
) {
  const [state, setState] = useToolbarState(storageKey, {
    sort: initialSort,
    direction: initialDirection,
  });

  const setSort = useCallback((sort: string, direction?: "asc" | "desc") => {
    setState((prev) => ({
      sort,
      direction: direction ?? prev.direction,
    }));
  }, [setState]);

  const toggleDirection = useCallback(() => {
    setState((prev) => ({
      ...prev,
      direction: prev.direction === "asc" ? "desc" : "asc",
    }));
  }, [setState]);

  return {
    currentSort: state.sort,
    currentDirection: state.direction,
    setSort,
    toggleDirection,
  };
}

/**
 * Hook for managing filter state
 */
export function useFilterState(
  storageKey: string = "toolbar-filters",
  initialFilters: Set<string> = new Set()
) {
  const [filters, setFilters] = useState<Set<string>>(initialFilters);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify([...filters]));
    } catch {}
  }, [storageKey, filters]);

  const toggleFilter = useCallback((value: string) => {
    setFilters((prev) => {
      const next = new Set(prev);
      if (next.has(value)) {
        next.delete(value);
      } else {
        next.add(value);
      }
      return next;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(new Set());
  }, []);

  const hasFilter = useCallback((value: string) => {
    return filters.has(value);
  }, [filters]);

  return {
    filters,
    toggleFilter,
    clearFilters,
    hasFilter,
    activeCount: filters.size,
  };
}

/**
 * Combined hook for full toolbar state management
 */
export function useToolbar(options?: {
  storagePrefix?: string;
  initialView?: ViewMode;
  initialSort?: string;
  initialFilters?: Set<string>;
}) {
  const prefix = options?.storagePrefix ?? "toolbar";

  const viewMode = useViewMode(`${prefix}-view`, options?.initialView);
  const search = useSearchState();
  const sort = useSortState(`${prefix}-sort`, options?.initialSort);
  const filter = useFilterState(`${prefix}-filters`, options?.initialFilters);

  return {
    // View mode
    viewMode: viewMode[0],
    setViewMode: viewMode[1],

    // Search
    searchValue: search.value,
    setSearchValue: search.setValue,
    debouncedSearch: search.debouncedValue,
    clearSearch: search.clear,

    // Sort
    currentSort: sort.currentSort,
    sortDirection: sort.currentDirection,
    setSort: sort.setSort,
    toggleSortDirection: sort.toggleDirection,

    // Filter
    filters: filter.filters,
    toggleFilter: filter.toggleFilter,
    clearFilters: filter.clearFilters,
    hasFilter: filter.hasFilter,
    activeFilterCount: filter.activeCount,
  };
}
