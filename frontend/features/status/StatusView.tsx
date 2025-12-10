import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useRouter } from "next/navigation";
import { StatusListView } from "./StatusListView";
import { StatusDetailView } from "./StatusDetailView";
import { SecondarySidebarLayout } from "@/frontend/shared/ui";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Camera } from "lucide-react";

// Simple header for status page
function StatusHeader({ 
  title, 
  onBack,
  showBackButton = true,
}: { 
  title: string; 
  onBack?: () => void;
  showBackButton?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b bg-background">
      {showBackButton && onBack && (
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
      )}
      <div className="flex items-center gap-2">
        <Camera className="h-5 w-5 text-muted-foreground" />
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>
    </div>
  );
}

export function StatusView() {
  const [selectedStatusId, setSelectedStatusId] = useState<string>();
  const isMobile = useIsMobile();
  const router = useRouter();

  const handleBack = () => {
    if (selectedStatusId) {
      setSelectedStatusId(undefined);
    } else {
      // Navigate back to communications or dashboard
      router.back();
    }
  };

  if (isMobile) {
    // On mobile, show either status list or status detail, not both
    if (selectedStatusId) {
      return (
        <div className="flex flex-col h-screen bg-background">
          <StatusHeader title="Status" onBack={handleBack} />
          <StatusDetailView statusId={selectedStatusId} />
        </div>
      );
    }

    return (
      <div className="flex flex-col h-screen bg-background">
        <StatusHeader title="Status" onBack={handleBack} />
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
