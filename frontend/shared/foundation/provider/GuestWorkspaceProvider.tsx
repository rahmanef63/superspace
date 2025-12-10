"use client"

import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import type { Id, Doc } from "@/convex/_generated/dataModel";
import {
  ALL_WORKSPACE_CONFIGS,
  getMenuForWorkspace,
  getAllWorkspacesFlat,
  getChildWorkspaces,
  MOCK_SYSTEM_FEATURES,
  type MockWorkspace,
  type MockMenuItem,
  type MockSystemFeature,
} from "@/frontend/shared/mock-data";

// Mock workspace type matching the real one
export type MockWorkspaceDoc = {
  _id: string;
  _creationTime: number;
  name: string;
  slug: string;
  ownerId: string;
  type?: string;
  icon?: string;
  color?: string;
  description?: string;
  settings?: any;
  isMainWorkspace?: boolean;
  parentWorkspaceId?: string | null;
  membership?: any;
  role?: any;
  isLinked?: boolean;
};

// Guest user mock
export const GUEST_USER = {
  id: "guest_user_001",
  name: "Guest User",
  email: "guest@superspace.demo",
  imageUrl: "",
  initials: "GU",
};

/**
 * Convert new MockWorkspace to legacy MockWorkspaceDoc format
 */
function convertToWorkspaceDoc(ws: MockWorkspace, isMain = false): MockWorkspaceDoc {
  return {
    _id: ws.id,
    _creationTime: Date.now(),
    name: ws.name,
    slug: ws.slug,
    ownerId: GUEST_USER.id,
    icon: ws.icon,
    color: ws.color,
    description: ws.description,
    isMainWorkspace: isMain,
    parentWorkspaceId: ws.parentId ?? null,
  };
}

// Build flat list of workspaces from configs
function buildMockWorkspaces(): MockWorkspaceDoc[] {
  const result: MockWorkspaceDoc[] = [];
  let isFirst = true;

  for (const config of ALL_WORKSPACE_CONFIGS) {
    result.push(convertToWorkspaceDoc(config.workspace, isFirst));
    isFirst = false;

    // Add children
    if (config.workspace.children) {
      for (const child of config.workspace.children) {
        result.push(convertToWorkspaceDoc(child));
      }
    }
  }

  return result;
}

// Mock workspaces data - built from new structure
export const MOCK_WORKSPACES: MockWorkspaceDoc[] = buildMockWorkspaces();

// Re-export for backward compatibility
export { MOCK_SYSTEM_FEATURES };

// Legacy menu items (fallback)
export const MOCK_MENU_ITEMS = [
  { slug: "overview", name: "Overview", icon: "LayoutDashboard", type: "page", order: 0, isVisible: true },
  { slug: "tasks", name: "Tasks", icon: "CheckSquare", type: "page", order: 1, isVisible: true },
  { slug: "documents", name: "Documents", icon: "FileText", type: "page", order: 2, isVisible: true },
  { slug: "crm", name: "CRM", icon: "Users", type: "page", order: 3, isVisible: true },
  { slug: "analytics", name: "Analytics", icon: "BarChart3", type: "page", order: 4, isVisible: true },
  { slug: "communications", name: "Communications", icon: "MessageSquare", type: "page", order: 5, isVisible: true },
  { slug: "inventory", name: "Inventory", icon: "Package", type: "page", order: 6, isVisible: true },
  { slug: "calendar", name: "Calendar", icon: "Calendar", type: "page", order: 7, isVisible: true },
];

// Convert new MockMenuItem format to legacy format
function convertMenuItems(items: MockMenuItem[]): typeof MOCK_MENU_ITEMS {
  return items.map((item, index) => ({
    slug: item.slug,
    name: item.label,
    icon: item.icon,
    type: "page" as const,
    order: index,
    isVisible: !item.disabled,
    badge: item.badge,
  }));
}

interface GuestWorkspaceContextValue {
  // Current workspace selection
  workspaceId: string | null;
  setWorkspaceId: (id: string | null) => void;

  // All workspaces (flat list)
  workspaces: MockWorkspaceDoc[];

  // Current workspace details
  currentWorkspace: MockWorkspaceDoc | null;

  // Main workspace
  mainWorkspace: MockWorkspaceDoc | null;
  isMainWorkspace: boolean;

  // Parent workspace
  parentWorkspace: MockWorkspaceDoc | null;

  // Children of current workspace
  childWorkspaces: MockWorkspaceDoc[];

  // Siblings
  siblingWorkspaces: MockWorkspaceDoc[];

  // Breadcrumb path
  workspacePath: MockWorkspaceDoc[];

  // Menu items for current workspace
  currentMenuItems: typeof MOCK_MENU_ITEMS;

  // Guest mode indicator
  isGuestMode: true;
  guestUser: typeof GUEST_USER;

  // Loading state (always false for guest)
  isLoading: boolean;
}

const GuestWorkspaceContext = createContext<GuestWorkspaceContextValue | null>(null);

export function GuestWorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [workspaceId, setWorkspaceIdState] = useState<string | null>(MOCK_WORKSPACES[0]._id);

  const setWorkspaceId = useCallback((id: string | null) => {
    setWorkspaceIdState(id);
  }, []);

  const contextValue = useMemo<GuestWorkspaceContextValue>(() => {
    const currentWorkspace = workspaceId
      ? MOCK_WORKSPACES.find((ws) => ws._id === workspaceId) ?? null
      : null;

    const mainWorkspace = MOCK_WORKSPACES.find((ws) => ws.isMainWorkspace) ?? null;
    const isMainWorkspace = Boolean(currentWorkspace?.isMainWorkspace);

    // Parent workspace
    const parentWorkspace = currentWorkspace?.parentWorkspaceId
      ? MOCK_WORKSPACES.find((ws) => ws._id === currentWorkspace.parentWorkspaceId) ?? null
      : null;

    // Child workspaces
    const childWorkspaces = MOCK_WORKSPACES.filter(
      (ws) => ws.parentWorkspaceId === workspaceId
    );

    // Sibling workspaces (same parent)
    const siblingWorkspaces = currentWorkspace?.parentWorkspaceId
      ? MOCK_WORKSPACES.filter(
        (ws) => ws.parentWorkspaceId === currentWorkspace.parentWorkspaceId && ws._id !== workspaceId
      )
      : MOCK_WORKSPACES.filter((ws) => !ws.parentWorkspaceId && ws._id !== workspaceId);

    // Build workspace path
    const workspacePath: MockWorkspaceDoc[] = [];
    let current = currentWorkspace;
    while (current) {
      workspacePath.unshift(current);
      current = current.parentWorkspaceId
        ? MOCK_WORKSPACES.find((ws) => ws._id === current!.parentWorkspaceId) ?? null
        : null;
    }

    // Get menu items for current workspace
    const menuItems = workspaceId ? getMenuForWorkspace(workspaceId) : [];
    const currentMenuItems = menuItems.length > 0
      ? convertMenuItems(menuItems)
      : MOCK_MENU_ITEMS;

    return {
      workspaceId,
      setWorkspaceId,
      workspaces: MOCK_WORKSPACES,
      currentWorkspace,
      mainWorkspace,
      isMainWorkspace,
      parentWorkspace,
      childWorkspaces,
      siblingWorkspaces,
      workspacePath,
      currentMenuItems,
      isGuestMode: true,
      guestUser: GUEST_USER,
      isLoading: false,
    };
  }, [workspaceId, setWorkspaceId]);

  return (
    <GuestWorkspaceContext.Provider value={contextValue}>
      {children}
    </GuestWorkspaceContext.Provider>
  );
}

export function useGuestWorkspaceContext() {
  const context = useContext(GuestWorkspaceContext);
  if (!context) {
    throw new Error("useGuestWorkspaceContext must be used within GuestWorkspaceProvider");
  }
  return context;
}

/**
 * Check if we're in guest mode
 */
export function useIsGuestMode() {
  const context = useContext(GuestWorkspaceContext);
  return context !== null;
}
