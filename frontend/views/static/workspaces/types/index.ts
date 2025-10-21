export type WorkspaceType = "organization" | "institution" | "group" | "family" | "personal";

export type ViewType =
  | "overview"
  | "dashboard"
  | "chats"
  | "message"
  | "menus"
  | "documents"
  | "settings"
  | "workspace-settings"
  | "members"
  | "invitations"
  | "friends"
  | "user-settings"
  | "reports"
  | "support"
  | "projects"
  | "crm"
  | "notifications"
  | "workflows"
  | "status"
  | "calls"
  | "ai"
  | "starred"
  | "archived"
  | "calendar"
  | "tasks"
  | "wiki"
  | "profile";

export interface WorkspaceNavigationItem {
  key: ViewType;
  label: string;
  icon: any;
  description: string;
  path?: string;
}

export interface OnboardingData {
  name: string;
  type: WorkspaceType;
  description: string;
}

import { Id } from "@convex/_generated/dataModel";

export interface WorkspaceLayoutState {
  currentView: ViewType;
  currentMenuItemId?: Id<"menuItems">;
  selectedDocumentId?: Id<"documents">;
}

// Metadata for onboarding steps (title, description)
export interface OnboardingStepMeta {
  title: string;
  description: string;
}
