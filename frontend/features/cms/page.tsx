"use client";

import type { Id } from "@convex/_generated/dataModel";
import CMSFeature from "./index";

export interface CMSPageProps {
  workspaceId?: Id<"workspaces"> | null;
}

export default function CMSPage({ workspaceId }: CMSPageProps) {
  void workspaceId;

  return <CMSFeature />;
}
