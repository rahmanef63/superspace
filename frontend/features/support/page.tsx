/**
 * Support Page
 */

"use client";

import type { Id } from "@/convex/_generated/dataModel";
import { SupportDashboard } from "./components/SupportDashboard";

interface SupportPageProps {
  workspaceId?: Id<"workspaces"> | null;
}

export default function SupportPage({ workspaceId }: SupportPageProps) {
  return <SupportDashboard workspaceId={workspaceId ?? null} />;
}
