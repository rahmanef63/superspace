"use client";

import { useMemo, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useWhatsAppStore } from "../chat/shared/stores";
import { TopBar } from "../chat/components/navigation/TopBar";
import { CallListView } from "./CallListView";
import { CallDetailView } from "./CallDetailView";
import { CALL_SUMMARIES, getCallDetail } from "./mockData";
import { SecondarySidebarLayout } from "@/frontend/shared/layout/menus/components/SecondarySidebarLayout";

export function CallsView() {
  const [selectedCallId, setSelectedCallId] = useState<string>();
  const isMobile = useIsMobile();
  const { setActiveTab } = useWhatsAppStore();

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
          <TopBar
            title={selectedCall.name}
            subtitle={selectedCall.phoneNumber}
            showSearch={false}
            onMenuClick={handleBack}
            contact={{
              id: selectedCall.id,
              name: selectedCall.name,
              avatar: selectedCall.avatar,
              phoneNumber: selectedCall.phoneNumber,
            }}
            settingsSlug="calls"
          />
          <CallDetailView call={selectedCall} />
        </div>
      );
    }

    return (
      <div className="flex h-screen flex-col bg-background">
        <TopBar title="Calls" showSearch onMenuClick={handleBack} showActions={false} settingsSlug="calls" />
        <CallListView
          calls={CALL_SUMMARIES}
          selectedCallId={selectedCallId}
          onCallSelect={setSelectedCallId}
        />
      </div>
    );
  }

  return (
    <SecondarySidebarLayout
      className="h-full bg-background"
      sidebar={
        <CallListView
          calls={CALL_SUMMARIES}
          selectedCallId={selectedCallId}
          onCallSelect={setSelectedCallId}
          variant="layout"
        />
      }
      contentClassName="flex h-full flex-col bg-background"
    >
      <CallDetailView call={selectedCall} />
    </SecondarySidebarLayout>
  );
}
