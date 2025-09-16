import { MessageCircle, Menu, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarHeader } from "@/components/ui/sidebar";
import type { WhatsAppSidebarHeaderProps } from "../types";

export function WhatsAppSidebarHeader({
  collapsed,
  isMobile,
  showBackButton,
  onBackClick,
  onToggleSidebar,
}: WhatsAppSidebarHeaderProps) {
  return (
    <SidebarHeader className="border-b border-sidebar-border bg-sidebar">
      <div className="flex items-center justify-between p-3">
        {/* Logo/Title Area */}
        <div className="flex items-center gap-3 flex-1">
          {isMobile && showBackButton ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBackClick}
              className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          ) : null}
          
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-wa-accent flex items-center justify-center">
                <MessageCircle className="h-4 w-4 text-white" />
              </div>
              <h1 className="font-semibold text-sidebar-foreground text-lg">
                WhatsApp
              </h1>
            </div>
          )}
        </div>

        {/* Burger Menu Trigger */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
      </div>
    </SidebarHeader>
  );
}
