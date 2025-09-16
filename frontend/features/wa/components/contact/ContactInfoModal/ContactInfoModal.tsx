import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarHeader 
} from "@/components/ui/sidebar";
import { ContactInfoHeader } from "./ContactInfoHeader";
import { ContactInfoContent } from "./ContactInfoContent";
import { SectionType } from "./types";
import { SIDEBAR_SECTIONS } from "./constants";
import { useIsMobile } from "@/hooks/use-mobile";

interface ContactInfoModalProps {
  contact: {
    id: string;
    name: string;
    username?: string;
    avatar?: string;
    phoneNumber?: string;
    about?: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

export function ContactInfoModal({ contact, isOpen, onClose }: ContactInfoModalProps) {
  const [activeSection, setActiveSection] = useState<SectionType>('overview');
  const isMobile = useIsMobile();

  if (!contact) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`p-0 bg-background border border-border ${
        isMobile 
          ? 'max-w-full w-full h-full m-0 rounded-none' 
          : 'max-w-5xl w-full h-[90vh] rounded-lg'
      }`}>
        <SidebarProvider defaultOpen={!isMobile}>
          <div className="flex h-full w-full">
            <Sidebar 
              variant="sidebar" 
              collapsible={isMobile ? "offcanvas" : "none"}
              className="w-80 border-r border-sidebar-border"
            >
              <SidebarHeader className="p-0">
                <ContactInfoHeader onClose={onClose} />
              </SidebarHeader>
              
              <SidebarContent>
                <SidebarGroup>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {SIDEBAR_SECTIONS.map((section) => {
                        const Icon = section.icon;
                        return (
                          <SidebarMenuItem key={section.id}>
                            <SidebarMenuButton
                              isActive={activeSection === section.id}
                              onClick={() => setActiveSection(section.id)}
                              className="w-full justify-start"
                            >
                              <Icon className="h-4 w-4" />
                              <span>{section.label}</span>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        );
                      })}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </SidebarContent>
            </Sidebar>
            
            <main className="flex-1 bg-background">
              <ContactInfoContent 
                activeSection={activeSection}
                contact={contact}
                isMobile={isMobile}
              />
            </main>
          </div>
        </SidebarProvider>
      </DialogContent>
    </Dialog>
  );
}
