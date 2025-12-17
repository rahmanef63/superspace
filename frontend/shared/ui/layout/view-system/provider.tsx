"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useMemo,
  useCallback,
  type ReactNode,
} from "react";
import type {
  ViewType,
  ViewState,
  ViewContext,
  ViewActions,
  ViewProviderProps,
  ViewSort,
  ViewFilter,
  ViewGroup,
} from "./types";
import { viewRegistry } from "./registry";

/**
 * View State Actions
 */
type ViewAction =
  | { type: "SET_VIEW_TYPE"; payload: ViewType }
  | { type: "SET_SORT"; payload: ViewSort | null }
  | { type: "SET_FILTER"; payload: ViewFilter[] }
  | { type: "ADD_FILTER"; payload: ViewFilter }
  | { type: "REMOVE_FILTER"; payload: string }
  | { type: "SET_GROUP"; payload: string | null }
  | { type: "TOGGLE_GROUP"; payload: string }
  | { type: "SET_SEARCH"; payload: string }
  | { type: "SET_SELECTED_IDS"; payload: Set<string> }
  | { type: "TOGGLE_SELECTION"; payload: string }
  | { type: "SELECT_ALL" }
  | { type: "CLEAR_SELECTION" }
  | { type: "SET_FOCUSED_ID"; payload: string | null }
  | { type: "SET_PAGE"; payload: number }
  | { type: "SET_PAGE_SIZE"; payload: number }
  | { type: "SET_TOTAL_ITEMS"; payload: number }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: Error | null }
  | { type: "SET_CUSTOM_STATE"; payload: Record<string, any> }
  | { type: "RESET" };

/**
 * View State Reducer
 */
function viewReducer(state: ViewState, action: ViewAction): ViewState {
  switch (action.type) {
    case "SET_VIEW_TYPE":
      return { ...state, activeView: action.payload };

    case "SET_SORT":
      return { ...state, sort: action.payload };

    case "SET_FILTER":
      return { ...state, filters: action.payload };

    case "ADD_FILTER":
      return { ...state, filters: [...state.filters, action.payload] };

    case "REMOVE_FILTER":
      return {
        ...state,
        filters: state.filters.filter((f) => f.field !== action.payload),
      };

    case "SET_GROUP":
      return { ...state, groupBy: action.payload, expandedGroups: new Set() };

    case "TOGGLE_GROUP": {
      const newExpanded = new Set(state.expandedGroups);
      if (newExpanded.has(action.payload)) {
        newExpanded.delete(action.payload);
      } else {
        newExpanded.add(action.payload);
      }
      return { ...state, expandedGroups: newExpanded };
    }

    case "SET_SEARCH":
      return { ...state, searchQuery: action.payload, currentPage: 1 };

    case "SET_SELECTED_IDS":
      return { ...state, selectedIds: action.payload };

    case "TOGGLE_SELECTION": {
      const newSelected = new Set(state.selectedIds);
      if (newSelected.has(action.payload)) {
        newSelected.delete(action.payload);
      } else {
        newSelected.add(action.payload);
      }
      return { ...state, selectedIds: newSelected };
    }

    case "SELECT_ALL":
      // Note: This would need totalItems or data array to work properly
      return state;

    case "CLEAR_SELECTION":
      return { ...state, selectedIds: new Set(), focusedId: null };

    case "SET_FOCUSED_ID":
      return { ...state, focusedId: action.payload };

    case "SET_PAGE":
      return { ...state, currentPage: action.payload };

    case "SET_PAGE_SIZE":
      return { ...state, pageSize: action.payload, currentPage: 1 };

    case "SET_TOTAL_ITEMS":
      return { ...state, totalItems: action.payload };

    case "SET_LOADING":
      return { ...state, isLoading: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload, isLoading: false };

    case "SET_CUSTOM_STATE":
      return {
        ...state,
        customState: { ...state.customState, ...action.payload },
      };

    case "RESET":
      return createInitialState(state.activeView);

    default:
      return state;
  }
}

/**
 * Create initial view state
 */
function createInitialState(viewType: ViewType): ViewState {
  return {
    activeView: viewType,
    selectedIds: new Set(),
    focusedId: null,
    sort: null,
    filters: [],
    searchQuery: "",
    groupBy: null,
    expandedGroups: new Set(),
    currentPage: 1,
    pageSize: 20,
    totalItems: 0,
    isLoading: false,
    error: null,
    customState: {},
  };
}

/**
 * View Context
 */
const ViewStateContext = createContext<ViewContext | null>(null);

/**
 * Local Storage Key
 */
const STORAGE_KEY_PREFIX = "view-system:";

/**
 * View Provider Component
 * 
 * Manages view state with React Context and localStorage persistence.
 * 
 * @example
 * ```tsx
 * <ViewProvider
 *   data={items}
 *   config={viewConfig}
 *   initialView={ViewType.TABLE}
 *   storageKey="my-feature"
 *   onStateChange={(state) => console.log('State changed:', state)}
 * >
 *   <ViewRenderer />
 * </ViewProvider>
 * ```
 */
export function ViewProvider<T = any>({
  children,
  data,
  config,
  initialView = "table" as ViewType,
  storageKey,
  onStateChange,
}: ViewProviderProps<T>) {
  // Load initial state from localStorage if available
  const getInitialState = useCallback((): ViewState => {
    if (storageKey && typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(
          `${STORAGE_KEY_PREFIX}${storageKey}`
        );
        if (stored) {
          const parsed = JSON.parse(stored);
          // Validate that viewType exists in registry
          if (viewRegistry.has(parsed.activeView)) {
            // Convert plain arrays/objects back to Sets
            return {
              ...parsed,
              selectedIds: new Set(parsed.selectedIds || []),
              expandedGroups: new Set(parsed.expandedGroups || []),
            };
          }
        }
      } catch (error) {
        console.warn("Failed to load view state from localStorage:", error);
      }
    }
    return createInitialState(initialView);
  }, [initialView, storageKey]);

  const [state, dispatch] = useReducer(viewReducer, null, getInitialState);

  // Persist state to localStorage
  useEffect(() => {
    if (storageKey && typeof window !== "undefined") {
      try {
        // Convert Sets to arrays for JSON serialization
        const serializable = {
          ...state,
          selectedIds: Array.from(state.selectedIds),
          expandedGroups: Array.from(state.expandedGroups),
        };
        localStorage.setItem(
          `${STORAGE_KEY_PREFIX}${storageKey}`,
          JSON.stringify(serializable)
        );
      } catch (error) {
        console.warn("Failed to save view state to localStorage:", error);
      }
    }
  }, [state, storageKey]);

  // Notify on state change
  useEffect(() => {
    onStateChange?.(state);
  }, [state, onStateChange]);

  // Notify on state change
  useEffect(() => {
    onStateChange?.(state);
  }, [state, onStateChange]);

  // Actions
  const actions: ViewActions = useMemo(
    () => ({
      // View switching
      setView: (viewType: ViewType) => {
        if (!viewRegistry.has(viewType)) {
          console.warn(`View type "${viewType}" is not registered`);
          return;
        }
        dispatch({ type: "SET_VIEW_TYPE", payload: viewType });
      },

      // Selection
      selectItem: (id: string) => {
        const newSelected = new Set(state.selectedIds);
        newSelected.add(id);
        dispatch({ type: "SET_SELECTED_IDS", payload: newSelected });
      },

      selectItems: (ids: string[]) => {
        const newSelected = new Set([...state.selectedIds, ...ids]);
        dispatch({ type: "SET_SELECTED_IDS", payload: newSelected });
      },

      deselectItem: (id: string) => {
        const newSelected = new Set(state.selectedIds);
        newSelected.delete(id);
        dispatch({ type: "SET_SELECTED_IDS", payload: newSelected });
      },

      clearSelection: () => dispatch({ type: "CLEAR_SELECTION" }),

      selectAll: () => dispatch({ type: "SELECT_ALL" }),

      // Sorting
      setSort: (sort) => dispatch({ type: "SET_SORT", payload: sort }),

      toggleSortDirection: () => {
        if (state.sort) {
          const newDirection = state.sort.direction === "asc" ? "desc" : "asc";
          dispatch({
            type: "SET_SORT",
            payload: { ...state.sort, direction: newDirection },
          });
        }
      },

      // Filtering
      addFilter: (filter) => dispatch({ type: "ADD_FILTER", payload: filter }),

      removeFilter: (id) =>
        dispatch({ type: "REMOVE_FILTER", payload: id }),

      clearFilters: () => dispatch({ type: "SET_FILTER", payload: [] }),

      setSearchQuery: (query) => dispatch({ type: "SET_SEARCH", payload: query }),

      // Grouping
      setGroupBy: (field) => dispatch({ type: "SET_GROUP", payload: field }),

      toggleGroup: (groupId) => dispatch({ type: "TOGGLE_GROUP", payload: groupId }),

      expandAllGroups: () => {
        // Would need total group list to implement properly
      },

      collapseAllGroups: () => {
        dispatch({ type: "SET_GROUP", payload: state.groupBy });
      },

      // Pagination
      setPage: (page) => dispatch({ type: "SET_PAGE", payload: page }),

      setPageSize: (pageSize) =>
        dispatch({ type: "SET_PAGE_SIZE", payload: pageSize }),

      nextPage: () => {
        const maxPage = Math.ceil(state.totalItems / state.pageSize);
        if (state.currentPage < maxPage) {
          dispatch({ type: "SET_PAGE", payload: state.currentPage + 1 });
        }
      },

      previousPage: () => {
        if (state.currentPage > 1) {
          dispatch({ type: "SET_PAGE", payload: state.currentPage - 1 });
        }
      },

      // Custom state
      setCustomState: (key, value) => {
        dispatch({
          type: "SET_CUSTOM_STATE",
          payload: { [key]: value },
        });
      },

      getCustomState: (key) => state.customState?.[key],
    }),
    [state]
  );

  // Context value
  const contextValue: ViewContext<T> = useMemo(
    () => ({
      data,
      config,
      state,
      actions,
    }),
    [data, config, state, actions]
  );

  return (
    <ViewStateContext.Provider value={contextValue}>
      {children}
    </ViewStateContext.Provider>
  );
}

/**
 * Hook to access view context
 * 
 * @throws Error if used outside ViewProvider
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { data, config, state, actions } = useViewContext();
 *   
 *   return (
 *     <button onClick={() => actions.setView(ViewType.GRID)}>
 *       Switch to Grid
 *     </button>
 *   );
 * }
 * ```
 */
export function useViewContext<T = any>(): ViewContext<T> {
  const context = useContext(ViewStateContext);
  if (!context) {
    throw new Error("useViewContext must be used within a ViewProvider");
  }
  return context as ViewContext<T>;
}

/**
 * Hook to access view state only
 * 
 * @example
 * ```tsx
 * function ViewInfo() {
 *   const state = useViewState();
 *   return <div>Current view: {state.viewType}</div>;
 * }
 * ```
 */
export function useViewState(): ViewState {
  const { state } = useViewContext();
  return state;
}

/**
 * Hook to access view actions only
 * 
 * @example
 * ```tsx
 * function ViewControls() {
 *   const actions = useViewActions();
 *   return (
 *     <button onClick={() => actions.setViewType(ViewType.KANBAN)}>
 *       Kanban
 *     </button>
 *   );
 * }
 * ```
 */
export function useViewActions(): ViewActions {
  const { actions } = useViewContext();
  return actions;
}