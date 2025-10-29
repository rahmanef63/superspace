import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader,
  SidebarTrigger,
  useSidebar
} from "@/components/ui/sidebar";
import { ChatListItem } from "./ChatListItem";
import { SearchBar } from "../ui/SearchBar";
import { useWhatsAppStore } from "../../shared/hooks";
import { PLACEHOLDERS } from "../../shared/constants";
import type { Chat } from "@/frontend/shared/foundation/types";

interface ChatListSidebarProps {
  showArchived?: boolean;
}

export function ChatListSidebar({ showArchived = false }: ChatListSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  let sidebarContext;
  let collapsed = false;
  
  try {
    sidebarContext = useSidebar();
    collapsed = sidebarContext.state === "collapsed";
  } catch (error) {
    // Not inside SidebarProvider context, render mobile version
    sidebarContext = null;
  }
  
  const {
    chats,
    selectedChatId,
    setSelectedChat
  } = useWhatsAppStore();

  const filteredChats = chats.filter((chat: Chat) => {
    const matchesSearch = chat.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    if (showArchived) {
      return matchesSearch && chat.isArchived;
    }
    return matchesSearch && !chat.isArchived;
  });

  // For mobile usage outside of SidebarProvider
  if (!sidebarContext) {
    return (
      <div className="w-full h-full border-r border-border bg-card flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-foreground">
              {showArchived ? "Archived" : "Chats"}
            </h1>
            {!showArchived && (
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <Plus className="h-5 w-5" />
              </Button>
            )}
          </div>
          <SearchBar 
            placeholder={showArchived ? "Search archived chats" : PLACEHOLDERS.SEARCH_CHATS} 
            value={searchQuery} 
            onChange={setSearchQuery} 
          />
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {filteredChats.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              {searchQuery ? "No chats found" : showArchived ? "No archived chats" : "No chats yet"}
            </div>
          ) : (
            <div>
              {filteredChats.map(chat => (
                <ChatListItem 
                  key={chat.id} 
                  {...chat} 
                  isActive={chat.id === selectedChatId} 
                  onClick={() => setSelectedChat(chat.id)} 
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <Sidebar 
      collapsible="icon" 
      className="w-80 border-r border-sidebar-border"
    >
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center justify-between p-4">
          {!collapsed && (
            <>
              <h1 className="text-xl font-semibold text-foreground">
                {showArchived ? "Archived" : "Chats"}
              </h1>
              {!showArchived && (
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                  <Plus className="h-5 w-5" />
                </Button>
              )}
            </>
          )}
          <SidebarTrigger className="ml-auto" />
        </div>
        
        {!collapsed && (
          <div className="px-4 pb-4">
            <SearchBar 
              placeholder={showArchived ? "Search archived chats" : PLACEHOLDERS.SEARCH_CHATS} 
              value={searchQuery} 
              onChange={setSearchQuery} 
            />
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <div className="flex-1 overflow-y-auto">
          {filteredChats.length === 0 ? (
            !collapsed && (
              <div className="p-4 text-center text-muted-foreground">
                {searchQuery ? "No chats found" : showArchived ? "No archived chats" : "No chats yet"}
              </div>
            )
          ) : (
            <div>
              {filteredChats.map(chat => (
                <ChatListItem 
                  key={chat.id} 
                  {...chat} 
                  isActive={chat.id === selectedChatId} 
                  onClick={() => setSelectedChat(chat.id)}
                  compact={collapsed}
                />
              ))}
            </div>
          )}
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
