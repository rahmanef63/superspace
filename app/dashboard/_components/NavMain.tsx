"use client"

import Link from "next/link"
import type { Id } from "@/convex/_generated/dataModel"
import type { ElementType } from "react"
import { ChevronRight } from "lucide-react"

import { getDefaultPages } from "@/frontend/shared/pages/manifest"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface NavItem {
  id: string
  title: string
  description?: string
  icon?: ElementType
  isActive?: boolean
  children?: {
    id: string
    title: string
    url?: string
  }[]
}

interface NavMainProps {
  workspaceId: Id<"workspaces">
  activeView: string
  onViewChange?: (view: string) => void
  items?: NavItem[]
}

export function NavMain({ workspaceId, activeView, onViewChange, items }: NavMainProps) {
  const fallback = getDefaultPages().map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    icon: p.icon,
  }))
  const navItems: NavItem[] = items && items.length > 0 ? items : fallback

  console.log("[v0] NavMain received items:", items)
  console.log("[v0] NavMain using navItems:", navItems)

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {navItems.map((item) => {
          const hasChildren = item.children && item.children.length > 0

          if (hasChildren) {
            return (
              <Collapsible
                key={item.id}
                asChild
                defaultOpen={item.isActive || activeView === item.id}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.description} isActive={activeView === item.id}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.children?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.id}>
                          <SidebarMenuSubButton asChild>
                            <Link
                              href={subItem.url || `/dashboard/${item.id}/${subItem.id}`}
                              onClick={() => onViewChange?.(subItem.id)}
                            >
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            )
          }

          return (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton asChild tooltip={item.description} isActive={activeView === item.id}>
                <Link href={`/dashboard/${item.id}`} onClick={() => onViewChange?.(item.id)}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
