import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import type { NavigationMenuItemProps } from "../types";

export function NavigationMenuItem({
  item,
  collapsed,
  isActive,
  onNavigate,
}: NavigationMenuItemProps) {
  const itemClasses = isActive 
    ? "bg-wa-active text-white font-medium" 
    : "text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent";

  return (
    <SidebarMenuItem>
      <SidebarMenuButton 
        className={itemClasses}
        onClick={() => onNavigate(item.id)}
      >
        <item.icon className="h-5 w-5" />
        {!collapsed && (
          <div className="flex items-center justify-between flex-1">
            <span>{item.title}</span>
            {item.badge && (
              <span className="ml-auto bg-wa-accent text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center font-medium">
                {item.badge}
              </span>
            )}
          </div>
        )}
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
