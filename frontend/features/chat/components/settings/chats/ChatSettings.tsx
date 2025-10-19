import { Button } from "@/components/ui/button";
import { Archive, Trash2, MessageSquare, Smartphone } from "lucide-react";

export function ChatSettings() {
  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold text-foreground mb-6">Chats</h1>
      
      <div className="space-y-6">
        {/* Chat History Section */}
        <section>
          <h2 className="text-lg font-medium text-foreground mb-4">Chat history</h2>
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center gap-3 mb-4">
              <Smartphone className="h-5 w-5 text-primary flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                <strong className="text-card-foreground">Synced with your phone</strong>
              </p>
            </div>
            
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start text-left h-auto p-4"
              >
                <Archive className="h-4 w-4 mr-3 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="font-medium">Archive all chats</div>
                  <div className="text-xs text-muted-foreground leading-relaxed">
                    You will still receive new messages from archived chats
                  </div>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start text-left border-destructive/20 text-destructive hover:bg-destructive/10 h-auto p-4"
              >
                <MessageSquare className="h-4 w-4 mr-3 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="font-medium">Clear all messages</div>
                  <div className="text-xs opacity-70 leading-relaxed">
                    Delete all messages from chats and groups
                  </div>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start text-left border-destructive/20 text-destructive hover:bg-destructive/10 h-auto p-4"
              >
                <Trash2 className="h-4 w-4 mr-3 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="font-medium">Delete all chats</div>
                  <div className="text-xs opacity-70 leading-relaxed">
                    Delete all messages and clear the chats from your history
                  </div>
                </div>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
