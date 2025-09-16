export type WorkspaceType = "organization" | "institution" | "group" | "family" | "personal";

export type ViewType = "dashboard" | "chat" | "message" | "menus" | "documents" | "settings" | "members" | "invitations" | "friends" | "user-settings";

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
