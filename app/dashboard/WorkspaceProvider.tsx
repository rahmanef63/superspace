"use client"

import React, { createContext, useContext, useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

type WorkspaceDoc = { _id: Id<"workspaces">; name: string; type?: string };

const WorkspaceContext = createContext<{
  workspaceId: Id<"workspaces"> | null;
  setWorkspaceId: (id: Id<"workspaces"> | null) => void;
  workspaces: WorkspaceDoc[] | undefined;
}>({ workspaceId: null, setWorkspaceId: () => {}, workspaces: undefined });

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const userWorkspaces = useQuery(api.workspace.workspaces.getUserWorkspaces) as WorkspaceDoc[] | undefined;
  const [workspaceId, setWorkspaceId] = useState<Id<"workspaces"> | null>(null);

  // Debug when the fetched workspaces change
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug('WorkspaceProvider:userWorkspaces', {
        loaded: userWorkspaces !== undefined,
        count: Array.isArray(userWorkspaces) ? userWorkspaces.length : 'undef',
        names: Array.isArray(userWorkspaces) ? userWorkspaces.slice(0, 5).map(w => w.name) : [],
      })
    }
  }, [userWorkspaces])

  // Default to first workspace when available
  useEffect(() => {
    if (!workspaceId && Array.isArray(userWorkspaces) && userWorkspaces.length > 0) {
      setWorkspaceId(userWorkspaces[0]._id as Id<"workspaces">);
      if (process.env.NODE_ENV !== 'production') {
        console.debug('WorkspaceProvider:setWorkspaceId', String(userWorkspaces[0]._id))
      }
    }
  }, [userWorkspaces, workspaceId]);

  return (
    <WorkspaceContext.Provider value={{ workspaceId, setWorkspaceId, workspaces: userWorkspaces }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspaceContext() {
  return useContext(WorkspaceContext);
}
