"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

type WorkspaceDoc = { _id: Id<"workspaces">; name: string; type?: string };

const WorkspaceContext = createContext<{
  workspaceId: Id<"workspaces"> | null;
  setWorkspaceId: (id: Id<"workspaces"> | null) => void;
  workspaces: WorkspaceDoc[] | undefined;
}>({ workspaceId: null, setWorkspaceId: () => {}, workspaces: undefined });

const LAST_WORKSPACE_STORAGE_KEY = "superspace:lastWorkspaceId";

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const userWorkspaces = useQuery(api.workspace.workspaces.getUserWorkspaces) as WorkspaceDoc[] | undefined;
  const [workspaceId, setWorkspaceIdState] = useState<Id<"workspaces"> | null>(null);

  const setWorkspaceId = useCallback((id: Id<"workspaces"> | null) => {
    setWorkspaceIdState(id);
    if (typeof window !== "undefined") {
      if (id) {
        window.localStorage.setItem(LAST_WORKSPACE_STORAGE_KEY, String(id));
      } else {
        window.localStorage.removeItem(LAST_WORKSPACE_STORAGE_KEY);
      }
    }
  }, []);

  // Debug when the fetched workspaces change
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.debug("WorkspaceProvider:userWorkspaces", {
        loaded: userWorkspaces !== undefined,
        count: Array.isArray(userWorkspaces) ? userWorkspaces.length : "undef",
        names: Array.isArray(userWorkspaces) ? userWorkspaces.slice(0, 5).map((w) => w.name) : [],
      });
    }
  }, [userWorkspaces]);

  // Clear selection when user loses all workspaces (e.g. deleted the last one)
  useEffect(() => {
    if (Array.isArray(userWorkspaces) && userWorkspaces.length === 0 && workspaceId !== null) {
      setWorkspaceId(null);
    }
  }, [userWorkspaces, workspaceId, setWorkspaceId]);

  // Restore the last selected workspace from localStorage
  useEffect(() => {
    if (workspaceId !== null) return;
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(LAST_WORKSPACE_STORAGE_KEY);
    if (stored) {
      setWorkspaceId(stored as Id<"workspaces">);
    }
  }, [workspaceId, setWorkspaceId]);

  // Ensure we always have a valid workspace selected
  useEffect(() => {
    if (!Array.isArray(userWorkspaces) || userWorkspaces.length === 0) {
      return;
    }

    const currentExists = workspaceId
      ? userWorkspaces.some((ws) => String(ws._id) === String(workspaceId))
      : false;

    if (currentExists) {
      return;
    }

    const nextId = userWorkspaces[0]._id as Id<"workspaces">;
    setWorkspaceId(nextId);

    if (process.env.NODE_ENV !== "production") {
      console.debug("WorkspaceProvider:setWorkspaceId", String(nextId));
    }
  }, [userWorkspaces, workspaceId, setWorkspaceId]);

  return (
    <WorkspaceContext.Provider value={{ workspaceId, setWorkspaceId, workspaces: userWorkspaces }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspaceContext() {
  return useContext(WorkspaceContext);
}
