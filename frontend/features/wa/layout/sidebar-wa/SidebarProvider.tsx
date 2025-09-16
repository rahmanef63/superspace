import { ReactNode } from "react";
import { SidebarProvider as BaseSidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { WhatsAppSidebar } from "./WhatsAppSidebar";

interface WhatsAppSidebarProviderProps {
  children: ReactNode;
}

export function WhatsAppSidebarProvider({
  children
}: WhatsAppSidebarProviderProps) {
  return (
    <BaseSidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <WhatsAppSidebar />
        
        <SidebarInset className="flex-1">
          {children}
        </SidebarInset>
      </div>
    </BaseSidebarProvider>
  );
}
