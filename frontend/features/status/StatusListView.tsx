import { useState } from "react";
import { Camera, Plus, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { SearchBar } from "@/frontend/features/chat/components/ui/SearchBar";
import { getInitials } from "../chat/utils";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useWorkspaceContext } from "@/frontend/shared/foundation/provider/WorkspaceProvider";
import type { Id } from "@/convex/_generated/dataModel";

// Type for status updates
interface StatusUpdate {
  id: string;
  name: string;
  avatar: string;
  time: string;
  hasUpdate: boolean;
  mediaType: 'photo' | 'video';
}

// Hook to fetch status updates from Convex
const useStatusUpdates = () => {
  const { workspaceId } = useWorkspaceContext();

  const rawStatuses = useQuery(
    api.features.status.queries.getStatusesByUser,
    workspaceId ? { workspaceId: workspaceId as Id<"workspaces"> } : "skip"
  );

  const statuses: StatusUpdate[] = (rawStatuses ?? []).map((item) => ({
    id: item.userId,
    name: item.user?.name ?? "User",
    avatar: item.user?.image ?? "",
    time: item.latestStatus ? new Date(item.latestStatus.createdAt).toLocaleTimeString() : "",
    hasUpdate: item.hasUnviewed,
    mediaType: item.latestStatus?.type === "video" ? "video" : "photo",
  }));

  return { statuses, isLoading: workspaceId !== null && rawStatuses === undefined };
};

type StatusListViewVariant = "standalone" | "layout";

interface StatusListViewProps {
  selectedStatusId?: string;
  onStatusSelect?: (statusId: string) => void;
  variant?: StatusListViewVariant;
}

export function StatusListView({
  selectedStatusId,
  onStatusSelect,
  variant = "standalone",
}: StatusListViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const isMobile = useIsMobile();
  const { statuses, isLoading } = useStatusUpdates();

  const filteredStatuses = statuses.filter(status =>
    status.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const containerClasses = cn(
    "flex h-full flex-col",
    variant === "standalone"
      ? "w-full border-r border-border bg-card lg:w-[320px]"
      : "bg-background/60",
  );

  return (
    <div className={containerClasses}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {isMobile && (
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            )}
            <h1 className="text-xl font-semibold text-foreground">Status</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <SearchBar 
          placeholder="Search status updates" 
          value={searchQuery} 
          onChange={setSearchQuery} 
        />
      </div>

      {/* My Status */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer">
          <Avatar className="h-14 w-14">
            <AvatarFallback className="bg-muted text-foreground">Me</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-medium text-foreground">My status</h3>
            <p className="text-sm text-muted-foreground">Tap to add status update</p>
          </div>
          <Camera className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>

      {/* Status List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h2 className="text-sm font-medium text-muted-foreground mb-4">Recent updates</h2>
          <ScrollArea className="max-h-[400px]">
            <div className="space-y-1">
              {/* Empty state when no statuses */}
              {statuses.length === 0 && !searchQuery ? (
                <div className="p-6 text-center">
                  <div className="h-16 w-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-medium text-foreground mb-2">No status updates yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Share photos and videos that disappear in 24 hours.
                  </p>
                  <Button size="sm" className="gap-2">
                    <Camera className="h-4 w-4" />
                    Add Status
                  </Button>
                </div>
              ) : filteredStatuses.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  No status updates found
                </div>
              ) : (
                filteredStatuses.map((status) => (
                  <div 
                    key={status.id} 
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${
                      status.id === selectedStatusId ? 'bg-accent' : 'hover:bg-muted'
                    }`}
                    onClick={() => onStatusSelect?.(status.id)}
                  >
                    <Avatar className={`h-12 w-12 ${status.hasUpdate ? 'ring-2 ring-primary' : ''}`}>
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(status.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground">{status.name}</h3>
                      <p className="text-sm text-muted-foreground">{status.time}</p>
                    </div>
                    {status.mediaType === 'video' && (
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
