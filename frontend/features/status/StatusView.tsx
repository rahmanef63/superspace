import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useWhatsAppStore } from "@/frontend/features/chat/shared/stores";
import { TopBar } from "@/frontend/features/chat/sections/center/TopBar";
import { StatusListView } from "./StatusListView";
import { StatusDetailView } from "./StatusDetailView";
import { SecondarySidebarLayout } from "@/frontend/shared/ui";

export function StatusView() {
  const [selectedStatusId, setSelectedStatusId] = useState<string>();
  const isMobile = useIsMobile();
  const { setActiveTab } = useWhatsAppStore();

  const handleBack = () => {
    if (selectedStatusId) {
      setSelectedStatusId(undefined);
    } else {
      setActiveTab('chats');
    }
  };

  if (isMobile) {
    // On mobile, show either status list or status detail, not both
    if (selectedStatusId) {
      return (
        <div className="flex flex-col h-screen bg-background">
          <TopBar
            title="Status"
            showSearch={false}
            showActions={false}
            onMenuClick={handleBack}
          />
          <StatusDetailView statusId={selectedStatusId} />
        </div>
      );
    }
    
    return (
      <div className="flex flex-col h-screen bg-background">
        <TopBar
          title="Status"
          showSearch={true}
          showActions={false}
          onMenuClick={handleBack}
        />
        <StatusListView selectedStatusId={selectedStatusId} onStatusSelect={setSelectedStatusId} />
      </div>
    );
  }

  return (
    <SecondarySidebarLayout
      className="h-full bg-background"
      sidebar={
        <StatusListView
          selectedStatusId={selectedStatusId}
          onStatusSelect={setSelectedStatusId}
          variant="layout"
        />
      }
      contentClassName="flex h-full flex-col bg-background"
    >
      <StatusDetailView statusId={selectedStatusId} />
    </SecondarySidebarLayout>
  );
}
