import { useState } from "react";
import { Phone, PhoneIncoming, PhoneOff, Video, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { SearchBar } from "../ui/SearchBar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "../../utils";

const mockCalls = [
  { id: '1', name: 'Zahra❤️', type: 'outgoing', time: '2 minutes ago', status: 'completed', duration: '5:23', callType: 'voice' },
  { id: '2', name: 'JUSMAR', type: 'incoming', time: '1 hour ago', status: 'missed', duration: '', callType: 'video' },
  { id: '3', name: 'Mom', type: 'outgoing', time: '3 hours ago', status: 'completed', duration: '12:45', callType: 'voice' },
  { id: '4', name: 'Work Team', type: 'incoming', time: 'Yesterday', status: 'completed', duration: '45:12', callType: 'video' },
];

interface CallListViewProps {
  selectedCallId?: string;
  onCallSelect?: (callId: string) => void;
}

export function CallListView({ selectedCallId, onCallSelect }: CallListViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const isMobile = useIsMobile();

  const filteredCalls = mockCalls.filter(call =>
    call.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getIcon = (call: any) => {
    if (call.status === 'missed') return <PhoneOff className="h-4 w-4 text-red-500" />;
    if (call.callType === 'video') return <Video className="h-4 w-4 text-primary" />;
    if (call.type === 'incoming') return <PhoneIncoming className="h-4 w-4 text-primary" />;
    return <Phone className="h-4 w-4 text-primary" />;
  };

  return (
    <div className="w-full h-full lg:w-[320px] border-r border-border bg-card flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {isMobile && (
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            )}
            <h1 className="text-xl font-semibold text-foreground">Calls</h1>
          </div>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <Plus className="h-5 w-5" />
          </Button>
        </div>
        <SearchBar 
          placeholder="Search or start a new call" 
          value={searchQuery} 
          onChange={setSearchQuery} 
        />
      </div>

      {/* Favorites Section */}
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-medium text-muted-foreground mb-2">Favorites</h3>
        <div className="text-sm text-muted-foreground">No favorite contacts</div>
      </div>

      {/* Call List */}
      <div className="flex-1 overflow-y-auto">
        <ScrollArea className="h-full">
          <div className="space-y-1 p-2">
            {filteredCalls.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                {searchQuery ? "No calls found" : "No call history"}
              </div>
            ) : (
              filteredCalls.map((call) => (
                <div 
                  key={call.id} 
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${
                    call.id === selectedCallId ? 'bg-accent' : 'hover:bg-muted'
                  }`}
                  onClick={() => onCallSelect?.(call.id)}
                >
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {getInitials(call.name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-foreground truncate">{call.name}</h3>
                      <span className="text-xs text-muted-foreground">{call.time}</span>
                    </div>
                    
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-1">
                        {getIcon(call)}
                        <span className="text-sm text-muted-foreground">
                          {call.type === 'incoming' ? 'Incoming' : 'Outgoing'} 
                          {call.callType === 'video' ? ' video' : ''} call
                        </span>
                      </div>
                      {call.duration && (
                        <span className="text-xs text-muted-foreground">{call.duration}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
