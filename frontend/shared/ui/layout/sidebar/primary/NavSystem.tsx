"use client"

import Link from "next/link";
import {
  Folder,
  Forward,
  MoreHorizontal,
  type LucideIcon,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export interface SystemMenuItem {
  id: string;
  name: string;
  url: string;
  icon: LucideIcon;
  description?: string;
  metadata?: {
    featureType?: string;
    [key: string]: any;
  };
}

interface NavSystemProps {
  system: SystemMenuItem[];
}

export function NavSystem({ system }: NavSystemProps) {
  const { isMobile, setOpenMobile } = useSidebar();

  if (!system || system.length === 0) {
    return null;
  }

  // Handler to close mobile sidebar when menu is clicked
  const handleMenuClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>System</SidebarGroupLabel>
      <SidebarMenu>
        {system.map((item) => {
          const IconComponent = item.icon;
          return (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton asChild>
                <Link href={item.url} onClick={handleMenuClick}>
                  <IconComponent />
                  <span>{item.name}</span>
                </Link>
              </SidebarMenuButton>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuAction showOnHover>
                    <MoreHorizontal />
                    <span className="sr-only">More</span>
                  </SidebarMenuAction>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-48 rounded-lg"
                  side={isMobile ? "bottom" : "right"}
                  align={isMobile ? "end" : "start"}
                >
                  <DropdownMenuItem>
                    <Folder className="text-muted-foreground" />
                    <span>View {item.name}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Forward className="text-muted-foreground" />
                    <span>Share Link</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem disabled className="text-muted-foreground">
                    <span className="text-xs">System feature</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
