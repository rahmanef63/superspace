"use client";

import { useMemo, useState } from "react";
import { Phone, PhoneIncoming, PhoneOff, Video, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { SearchBar } from "../ui/SearchBar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "../../utils";
import type { CallSummary } from "./mockData";

interface CallListViewProps {
  calls: CallSummary[];
  selectedCallId?: string;
  onCallSelect?: (callId: string) => void;
}

export function CallListView({ calls, selectedCallId, onCallSelect }: CallListViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const isMobile = useIsMobile();

  const filteredCalls = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();
    if (!normalized) return calls;
    return calls.filter((call) => call.name.toLowerCase().includes(normalized));
  }, [calls, searchQuery]);

  const getIcon = (call: CallSummary) => {
    if (call.status === "missed") return <PhoneOff className="h-4 w-4 text-red-500" />;
    if (call.medium === "video") return <Video className="h-4 w-4 text-primary" />;
    if (call.direction === "incoming") return <PhoneIncoming className="h-4 w-4 text-primary" />;
    return <Phone className="h-4 w-4 text-primary" />;
  };

  return (
    <div className="flex h-full w-full flex-col border-r border-border bg-card lg:w-[320px]">
      <div className="border-b border-border p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isMobile && (
              <SidebarTrigger className="text-muted-foreground transition hover:text-foreground" />
            )}
            <h1 className="text-xl font-semibold text-foreground">Calls</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground transition hover:text-foreground"
            type="button"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
        <SearchBar
          placeholder="Search or start a new call"
          value={searchQuery}
          onChange={setSearchQuery}
        />
      </div>

      <div className="border-b border-border p-4">
        <h3 className="mb-2 text-sm font-medium text-muted-foreground">Favorites</h3>
        <div className="text-sm text-muted-foreground">No favorite contacts</div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <ScrollArea className="h-full">
          <div className="space-y-1 p-2">
            {filteredCalls.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                {searchQuery ? "No calls found" : "No call history"}
              </div>
            ) : (
              filteredCalls.map((call) => (
                <button
                  key={call.id}
                  type="button"
                  className={`flex w-full cursor-pointer items-center gap-3 rounded-lg p-3 text-left transition ${
                    call.id === selectedCallId ? "bg-accent" : "hover:bg-muted"
                  }`}
                  onClick={() => onCallSelect?.(call.id)}
                >
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {getInitials(call.name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="truncate font-medium text-foreground">{call.name}</h3>
                      <span className="text-xs text-muted-foreground">{call.lastActivity}</span>
                    </div>

                    <div className="mt-1 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {getIcon(call)}
                        <span className="text-sm text-muted-foreground">
                          {call.direction === "incoming" ? "Incoming" : "Outgoing"}
                          {call.medium === "video" ? " video" : ""} call
                        </span>
                      </div>
                      {call.duration && (
                        <span className="text-xs text-muted-foreground">{call.duration}</span>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

