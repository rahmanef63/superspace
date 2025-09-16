import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useWhatsAppStore } from "../../shared/stores";
import { TopBar } from "../navigation/TopBar";
import { CallListView } from "./CallListView";
import { CallDetailView } from "./CallDetailView";

export function CallsView() {
  const [selectedCallId, setSelectedCallId] = useState<string>();
  const isMobile = useIsMobile();
  const { setActiveTab } = useWhatsAppStore();

  const handleBack = () => {
    if (selectedCallId) {
      setSelectedCallId(undefined);
    } else {
      setActiveTab('chats');
    }
  };

  if (isMobile) {
    // On mobile, show either call list or call detail, not both
    if (selectedCallId) {
      return (
        <div className="flex flex-col h-screen bg-background">
          <TopBar
            title="Call Details"
            showSearch={false}
            showActions={false}
            onMenuClick={handleBack}
          />
          <CallDetailView callId={selectedCallId} />
        </div>
      );
    }
    
    return (
      <div className="flex flex-col h-screen bg-background">
        <TopBar
          title="Calls"
          showSearch={true}
          showActions={false}
          onMenuClick={handleBack}
        />
        <CallListView selectedCallId={selectedCallId} onCallSelect={setSelectedCallId} />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full">
      <CallListView selectedCallId={selectedCallId} onCallSelect={setSelectedCallId} />
      <CallDetailView callId={selectedCallId} />
    </div>
  );
}
