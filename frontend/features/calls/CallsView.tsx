"use client";

import { useMemo, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useWhatsAppStore } from "../chat/shared/stores";
import { TopBar } from "../chat/components/navigation/TopBar";
import { CallListView } from "./CallListView";
import { CallDetailView } from "./CallDetailView";
import { getCallDetail, type CallSummary, type CallDetail } from "./mockData";
import { SecondarySidebarLayout } from "@/frontend/shared/ui";
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
    participantName: call.initiator?.name ?? "Unknown",
    participantAvatar: call.initiator?.image ?? "",
    type: call.type as "audio" | "video",
    direction: "outgoing" as const, // TODO: determine based on current user
    status: call.status as any,
    timestamp: new Date(call.startedAt).toLocaleString(),
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

  const selectedCall = useMemo(() => getCallDetail(selectedCallId), [selectedCallId]);

  const handleBack = () => {
    if (selectedCallId) {
      setSelectedCallId(undefined);
    } else {
      setActiveTab("chats");
    }
  };

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
