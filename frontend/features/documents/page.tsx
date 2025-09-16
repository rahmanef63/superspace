"use client"

import type { Id } from "@convex/_generated/dataModel";
import { DocumentsManager } from "./components/DocumentsManager";

export interface DocumentsPageProps {
  workspaceId?: Id<"workspaces"> | null;
}

export default function DocumentsPage({ workspaceId }: DocumentsPageProps) {
  return <DocumentsManager workspaceId={workspaceId as Id<"workspaces">} />;
}
