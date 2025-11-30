"use client";

import { useMemo, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useWhatsAppStore } from "../chat/shared/stores";
import { CallListView } from "./CallListView";
import { CallDetailView } from "./CallDetailView";
import type { CallSummary, CallDetail } from "./types";
import { SecondarySidebarLayout } from "@/frontend/shared/ui";
import { CallsSkeleton } from "@/frontend/shared/ui/components/loading";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useWorkspaceContext } from "@/frontend/shared/foundation/provider/WorkspaceProvider";
import type { Id } from "@/convex/_generated/dataModel";

// Hook to fetch call history from Convex
const useCallHistory = () => {
  const { workspaceId } = useWorkspaceContext();

  const rawCalls = useQuery(
    api.features.calls.queries.getMyCallHistory,
    workspaceId ? { workspaceId: workspaceId as Id<"workspaces"> } : "skip"
  );

  const calls: CallSummary[] = (rawCalls ?? []).map((call) => ({
    id: call._id,
    name: call.initiator?.name ?? "Unknown",
    avatar: call.initiator?.avatarUrl ?? undefined,
    lastActivity: new Date(call.startedAt).toLocaleString(),
    direction: "outgoing" as const, // TODO: determine based on current user
    medium: call.type === "audio" ? "voice" as const : "video" as const,
    status: (call.status === "ended" ? "completed" : call.status) as "completed" | "missed",
    duration: call.duration ? `${Math.floor(call.duration / 60)}:${String(call.duration % 60).padStart(2, "0")}` : undefined,
  }));

  return { calls, isLoading: workspaceId !== null && rawCalls === undefined };
};

export function CallsView() {
  const [selectedCallId, setSelectedCallId] = useState<string>();
  const isMobile = useIsMobile();
  const { setActiveTab } = useWhatsAppStore();

  const { calls, isLoading } = useCallHistory();
  const [error] = useState<string>();

  // Fetch call detail from Convex when a call is selected
  const rawCallDetail = useQuery(
    api.features.calls.queries.getCall,
    selectedCallId ? { callId: selectedCallId as Id<"calls"> } : "skip"
  );

  // Transform Convex call data to CallDetail format for the detail view
  const selectedCall = useMemo((): CallDetail | undefined => {
    if (!rawCallDetail) return undefined;
    return {
      id: rawCallDetail._id,
      name: rawCallDetail.initiator?.name ?? "Unknown",
      phoneNumber: rawCallDetail.initiator?.email ?? "",
      avatar: rawCallDetail.initiator?.avatarUrl,
      lastActivity: new Date(rawCallDetail.startedAt).toLocaleString(),
      direction: "outgoing" as const, // TODO: determine based on current user
      medium: rawCallDetail.type as "voice" | "video",
      status: rawCallDetail.status as "completed" | "missed",
      duration: rawCallDetail.duration
        ? `${Math.floor(rawCallDetail.duration / 60)}:${String(rawCallDetail.duration % 60).padStart(2, "0")}`
        : undefined,
      history: [], // TODO: Fetch call history from Convex when available
    };
  }, [rawCallDetail]);

  const handleBack = () => {
    if (selectedCallId) {
      setSelectedCallId(undefined);
    } else {
      setActiveTab("chats");
    }
  };

  // Show skeleton while initial data is loading
  if (isLoading && calls.length === 0) {
    return <CallsSkeleton />;
  }

  if (isMobile) {
    if (selectedCall) {
      return (
        <div className="flex h-screen flex-col bg-background">
          <CallDetailView 
            call={selectedCall} 
            onBack={handleBack}
            showMobileHeader={true}
          />
        </div>
      );
    }

    return (
      <div className="flex h-screen flex-col bg-background">
        <CallListView
          calls={calls}
          selectedCallId={selectedCallId}
          onCallSelect={setSelectedCallId}
          loading={isLoading}
          error={error}
        />
      </div>
    );
  }

  return (
    <SecondarySidebarLayout
      className="h-full bg-background"
      sidebar={
        <CallListView
          calls={calls}
          selectedCallId={selectedCallId}
          onCallSelect={setSelectedCallId}
          variant="layout"
          loading={isLoading}
          error={error}
        />
      }
      contentClassName="flex h-full flex-col bg-background"
    >
      <CallDetailView call={selectedCall} />
    </SecondarySidebarLayout>
  );
}
