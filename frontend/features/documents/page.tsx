"use client";

import type { Id } from "@convex/_generated/dataModel";
import DocumentsFeaturePage from "./page/page";

export interface DocumentsPageProps {
  workspaceId?: Id<"workspaces"> | null;
}

export default function DocumentsPage({ workspaceId }: DocumentsPageProps) {
  return <DocumentsFeaturePage workspaceId={workspaceId ?? null} />;
}
