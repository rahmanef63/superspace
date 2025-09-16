import { useState } from "react";
import { Bot, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { SearchBar } from "../ui/SearchBar";

const mockAIChats = [
  { 
    id: '1', 
    title: 'Recipe for Pasta Carbonara', 
    lastMessage: 'Here\'s a classic carbonara recipe...', 
    timestamp: '2:30 PM',
    topic: 'Cooking'
  },
  { 
    id: '2', 
    title: 'JavaScript Array Methods', 
    lastMessage: 'The most commonly used array methods are...', 
    timestamp: '1:45 PM',
    topic: 'Programming'
  },
  { 
    id: '3', 
    title: 'Travel Tips for Japan', 
    lastMessage: 'When visiting Japan, consider these tips...', 
    timestamp: 'Yesterday',
    topic: 'Travel'
  },
  { 
    id: '4', 
    title: 'Workout Routine for Beginners', 
    lastMessage: 'Start with these basic exercises...', 
    timestamp: 'Yesterday',
    topic: 'Fitness'
  },
];

interface AIListViewProps {
  selectedChatId?: string;
  onChatSelect?: (chatId: string) => void;
}

export function AIListView({ selectedChatId, onChatSelect }: AIListViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const isMobile = useIsMobile();

  const filteredChats = mockAIChats.filter(chat =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.topic.toLowerCase().includes(searchQuery.toLowerCase())
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
            <h1 className="text-xl font-semibold text-foreground">Meta AI</h1>
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
            {filteredChats.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                {searchQuery ? "No AI conversations found" : "No AI conversations yet"}
              </div>
            ) : (
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
