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

type SettingsSidebarVariant = "standalone" | "layout";

interface SettingsSidebarProps {
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
  className?: string;
  /**
   * Controls how the sidebar renders its container.
   * - standalone: maintains original bordered panel styling
   * - layout: removes outer borders so it can live inside SecondarySidebarLayout
   */
  variant?: SettingsSidebarVariant;
}

export function SettingsSidebar({
  activeCategory,
  onCategoryChange,
  className,
  variant = "standalone",
}: SettingsSidebarProps) {
  const containerClasses = cn(
    "flex h-full flex-col",
    variant === "standalone" ? "bg-card border-r border-border" : "bg-background/40",
    className,
  );

  return (
    <div className={containerClasses}>
      <div className="border-b border-border p-4">
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
                  "mb-1 w-full justify-start",
                  activeCategory === category.id && "bg-primary/10 text-primary"
                )}
                onClick={() => onCategoryChange(category.id)}
              >
                <Icon className="mr-3 h-4 w-4" />
                {category.label}
              </Button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
