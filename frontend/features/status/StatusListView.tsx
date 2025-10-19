import { useState } from "react";
import { Camera, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { SearchBar } from "@/frontend/features/chat/components/ui/SearchBar";
import { getInitials } from "../chat/utils";


const mockStatuses = [
  { id: '1', name: 'User1❤️', avatar: '', time: '2 hours ago', hasUpdate: true, mediaType: 'photo' },
  { id: '2', name: 'Group1', avatar: '', time: '4 hours ago', hasUpdate: true, mediaType: 'video' },
  { id: '3', name: 'Mom', avatar: '', time: '6 hours ago', hasUpdate: false, mediaType: 'photo' },
];

interface StatusListViewProps {
  selectedStatusId?: string;
  onStatusSelect?: (statusId: string) => void;
}

export function StatusListView({ selectedStatusId, onStatusSelect }: StatusListViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const isMobile = useIsMobile();

  const filteredStatuses = mockStatuses.filter(status =>
    status.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full h-full lg:w-[320px] border-r border-border bg-card flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {isMobile && (
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            )}
            <h1 className="text-xl font-semibold text-foreground">Status</h1>
          </div>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <Plus className="h-5 w-5" />
          </Button>
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
              {filteredStatuses.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  {searchQuery ? "No status updates found" : "No status updates yet"}
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
