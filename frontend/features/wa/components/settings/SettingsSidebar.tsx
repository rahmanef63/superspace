import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Settings, 
  User, 
  MessageSquare, 
  Video, 
  Bell, 
  Palette, 
  HardDrive, 
  Keyboard,
  HelpCircle
} from "lucide-react";

const settingsCategories = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'account', label: 'Account', icon: User },
  { id: 'chats', label: 'Chats', icon: MessageSquare },
  { id: 'video-voice', label: 'Video & Voice', icon: Video },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'personalization', label: 'Personalization', icon: Palette },
  { id: 'storage', label: 'Storage and data', icon: HardDrive },
  { id: 'shortcuts', label: 'Keyboard shortcuts', icon: Keyboard },
  { id: 'help', label: 'Help', icon: HelpCircle },
];

interface SettingsSidebarProps {
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
  className?: string;
}

export function SettingsSidebar({ activeCategory, onCategoryChange, className }: SettingsSidebarProps) {
  return (
    <div className={cn("bg-card border-r border-border", className)}>
      <div className="p-4 border-b border-border">
        <h1 className="text-xl font-semibold text-foreground">Settings</h1>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2">
          {settingsCategories.map((category) => {
            const Icon = category.icon;
            return (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start mb-1",
                  activeCategory === category.id && "bg-primary/10 text-primary"
                )}
                onClick={() => onCategoryChange(category.id)}
              >
                <Icon className="h-4 w-4 mr-3" />
                {category.label}
              </Button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
