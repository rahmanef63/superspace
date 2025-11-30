import { useState } from "react";
import { Bot, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { SearchBar } from "@/frontend/features/chat/components/ui/SearchBar";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useWorkspaceContext } from "@/frontend/shared/foundation/provider/WorkspaceProvider";
import { useUser } from "@clerk/nextjs";

// Sample preview data - shown to help users understand the feature
// Will be replaced with real AI conversations once user starts using the feature
const SAMPLE_PREVIEW_CHATS = [
  { 
    id: 'sample-1', 
    title: 'Ask about anything...', 
    lastMessage: 'Get help with writing, coding, learning...', 
    timestamp: '',
    topic: 'Example',
    isSample: true,
  },
];

// Hook to fetch AI chat sessions from Convex
const useAIConversations = () => {
  const { workspaceId } = useWorkspaceContext();
  const { user } = useUser();
  
  const sessions = useQuery(
    api.features.ai.queries.listChatSessions,
    workspaceId && user?.id ? { workspaceId, userId: user.id } : "skip"
  );

  const conversations = (sessions ?? []).map(session => ({
    id: session._id,
    title: session.title,
    lastMessage: session.messages[session.messages.length - 1]?.content ?? "No messages yet",
    timestamp: new Date(session.updatedAt).toLocaleDateString(),
    topic: session.status === "active" ? "Active" : "Archived",
  }));

  return { conversations, isLoading: sessions === undefined };
};

type AIListViewVariant = "standalone" | "layout";

interface AIListViewProps {
  selectedChatId?: string;
  onChatSelect?: (chatId: string) => void;
  variant?: AIListViewVariant;
}

export function AIListView({
  selectedChatId,
  onChatSelect,
  variant = "standalone",
}: AIListViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const isMobile = useIsMobile();
  const { conversations, isLoading } = useAIConversations();

  // Show sample preview if no real conversations exist
  const hasRealData = conversations.length > 0;
  const displayChats = hasRealData ? conversations : SAMPLE_PREVIEW_CHATS;

  const filteredChats = displayChats.filter(chat =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.topic.toLowerCase().includes(searchQuery.toLowerCase())
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
            <h1 className="text-xl font-semibold text-foreground">AI</h1>
          </div>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <Plus className="h-5 w-5" />
          </Button>
        </div>
        <SearchBar 
          placeholder="Search AI conversations" 
          value={searchQuery} 
          onChange={setSearchQuery} 
        />
      </div>

      {/* AI Chat History */}
      <div className="flex-1 overflow-y-auto">
        <ScrollArea className="h-full">
          <div className="space-y-1 p-2">
            {/* Empty State */}
            {!hasRealData && !searchQuery && (
              <div className="p-6 text-center">
                <div className="h-16 w-16 mx-auto mb-4 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-medium text-foreground mb-2">Start a conversation with AI</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Get help with writing, coding, learning, and more.
                </p>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Chat
                </Button>
              </div>
            )}
            
            {searchQuery && filteredChats.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No AI conversations found
              </div>
            ) : hasRealData && (
              filteredChats.map((chat) => (
                <div 
                  key={chat.id} 
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${
                    chat.id === selectedChatId ? 'bg-accent' : 'hover:bg-muted'
                  }`}
                  onClick={() => onChatSelect?.(chat.id)}
                >
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-6 w-6 text-white" />
                  </div>
                  
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-foreground truncate">{chat.title}</h3>
                      <span className="text-xs text-muted-foreground flex-shrink-0">{chat.timestamp}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground truncate pr-2">
                        {chat.lastMessage}
                      </p>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full flex-shrink-0">
                        {chat.topic}
                      </span>
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
