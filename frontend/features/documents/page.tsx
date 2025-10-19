"use client";

import type { Id } from "@convex/_generated/dataModel";
import DocumentsFeaturePage from "./view/page";

export interface DocumentsPageProps {
  workspaceId?: Id<"workspaces"> | null;
}

export default function DocumentsPage({ workspaceId }: DocumentsPageProps) {
  return <DocumentsFeaturePage workspaceId={workspaceId ?? null} />;
}
