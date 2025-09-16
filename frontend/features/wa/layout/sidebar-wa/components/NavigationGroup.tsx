import { Lock } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavigationMenuItem } from "./NavigationMenuItem";
import type { NavigationGroupProps } from "../types";
import { getSpecialItemClasses } from "../utils";

export function NavigationGroup({
  title,
  items,
  collapsed,
  activeTab,
  onNavigate,
  specialItems,
}: NavigationGroupProps) {
  return (
    <SidebarGroup className={!title ? "flex-1" : ""}>
      {!collapsed && title && (
        <SidebarGroupLabel className="text-sidebar-foreground/70">
          {title}
        </SidebarGroupLabel>
      )}
      <SidebarGroupContent>
        <SidebarMenu>
          {/* Render special items first if they exist */}
          {specialItems?.map((specialItem) => (
            <SidebarMenuItem key={specialItem.id}>
              <SidebarMenuButton className={getSpecialItemClasses()}>
                <specialItem.icon className="h-5 w-5" />
                {!collapsed && <span>{specialItem.title}</span>}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          
          {/* Render regular navigation items */}
          {items.map((item) => (
            <NavigationMenuItem
              key={item.id}
              item={item}
              collapsed={collapsed}
              isActive={activeTab === item.id}
              onNavigate={onNavigate}
            />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
