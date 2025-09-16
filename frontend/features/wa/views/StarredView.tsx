import { useIsMobile } from "@/hooks/use-mobile";
import { useWhatsAppStore } from "../shared/stores";
import { TopBar } from "../components/navigation/TopBar";
import { SearchBar } from "../components/ui/SearchBar";

export function StarredView() {
  const isMobile = useIsMobile();
  const { setActiveTab } = useWhatsAppStore();

  const handleBack = () => {
    setActiveTab('chats');
  };

  if (isMobile) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <TopBar
          title="Starred Messages"
          showSearch={true}
          showActions={false}
          onMenuClick={handleBack}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-medium text-foreground mb-2">No starred messages</h2>
            <p className="text-muted-foreground text-sm">Star messages to find them easily later</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background">
      <TopBar
        title="Starred Messages"
        showSearch={true}
        showActions={false}
      />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-medium text-foreground mb-2">No starred messages</h2>
          <p className="text-muted-foreground text-sm">Star messages to find them easily later</p>
        </div>
      </div>
    </div>
  );
}
