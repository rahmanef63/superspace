"use client"

import Link from "next/link"
import type { Id } from "@/convex/_generated/dataModel"
import type { ElementType } from "react"
import { ChevronRight } from "lucide-react"

import { getDefaultPages } from "@/frontend/shared/foundation/manifest"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { FeatureTag, getFeatureTagFromMetadata, type FeatureTagType } from "@/frontend/shared/ui/components/FeatureTag"

interface NavItem {
  id: string
  title: string
  description?: string
  icon?: ElementType
  isActive?: boolean
  url?: string
  children?: NavItem[]
  metadata?: Record<string, any>
  tag?: FeatureTagType
}

interface NavMainProps {
  workspaceId: Id<"workspaces">
  activeView: string
  onViewChange?: (view: string) => void
  items?: NavItem[]
}

export function NavMain({ workspaceId, activeView, onViewChange, items }: NavMainProps) {
  const { isMobile, setOpenMobile } = useSidebar()
  const fallback = getDefaultPages().map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    icon: p.icon,
  }))
  const navItems: NavItem[] = items && items.length > 0 ? items : fallback

  console.log("[v0] NavMain received items:", items)
  console.log("[v0] NavMain using navItems:", navItems)

  // Handler to close mobile sidebar when menu is clicked
  const handleMenuClick = (viewId: string) => {
    if (isMobile) {
      setOpenMobile(false)
    }
    onViewChange?.(viewId)
  }

  // Recursive function to render nested menu items
  const renderNavItem = (item: NavItem, depth: number = 0): JSX.Element => {
    const hasChildren = item.children && item.children.length > 0
    const isActive = activeView === item.id
    const featureTag = item.tag || getFeatureTagFromMetadata(item.metadata)

    if (hasChildren) {
      return (
        <Collapsible
          key={item.id}
          asChild
          defaultOpen={item.isActive || isActive}
          className="group/collapsible"
        >
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton tooltip={item.description} isActive={isActive}>
                {item.icon && <item.icon />}
                <span className="flex-1">{item.title}</span>
                {featureTag && <FeatureTag type={featureTag} compact showIcon={false} />}
                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                {item.children?.map((subItem) => {
                  const subFeatureTag = (subItem as NavItem).tag || getFeatureTagFromMetadata((subItem as NavItem).metadata)
                  return (
                  <SidebarMenuSubItem key={subItem.id}>
                    {subItem.children && subItem.children.length > 0 ? (
                      // Nested child with more children - render as collapsible
                      <Collapsible
                        defaultOpen={subItem.isActive || activeView === subItem.id}
                        className="group/nested-collapsible"
                      >
                        <CollapsibleTrigger asChild>
                          <SidebarMenuSubButton>
                            {subItem.icon && <subItem.icon className="w-4 h-4" />}
                            <span className="flex-1">{subItem.title}</span>
                            {subFeatureTag && <FeatureTag type={subFeatureTag} compact showIcon={false} />}
                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/nested-collapsible:rotate-90" />
                          </SidebarMenuSubButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="pl-4">
                            {subItem.children?.map((nestedItem) => {
                              const nestedFeatureTag = (nestedItem as NavItem).tag || getFeatureTagFromMetadata((nestedItem as NavItem).metadata)
                              return (
                              <SidebarMenuSubButton key={nestedItem.id} asChild>
                                <Link
                                  href={nestedItem.url || `/dashboard/${item.id}/${subItem.id}/${nestedItem.id}`}
                                  onClick={() => handleMenuClick(nestedItem.id)}
                                  className={activeView === nestedItem.id ? "bg-accent" : ""}
                                >
                                  {nestedItem.icon && <nestedItem.icon className="w-4 h-4" />}
                                  <span className="flex-1">{nestedItem.title}</span>
                                  {nestedFeatureTag && <FeatureTag type={nestedFeatureTag} compact showIcon={false} />}
                                </Link>
                              </SidebarMenuSubButton>
                            )})}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    ) : (
                      // Leaf node - render as link
                      <SidebarMenuSubButton asChild>
                        <Link
                          href={subItem.url || `/dashboard/${item.id}/${subItem.id}`}
                          onClick={() => handleMenuClick(subItem.id)}
                          className={activeView === subItem.id ? "bg-accent" : ""}
                        >
                          {subItem.icon && <subItem.icon className="w-4 h-4" />}
                          <span className="flex-1">{subItem.title}</span>
                          {subFeatureTag && <FeatureTag type={subFeatureTag} compact showIcon={false} />}
                        </Link>
                      </SidebarMenuSubButton>
                    )}
                  </SidebarMenuSubItem>
                )})}
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      )
    }

    return (
      <SidebarMenuItem key={item.id}>
        <SidebarMenuButton asChild tooltip={item.description} isActive={isActive}>
          <Link
            href={item.url || `/dashboard/${item.id}`}
            onClick={() => handleMenuClick(item.id)}
          >
            {item.icon && <item.icon />}
            <span className="flex-1">{item.title}</span>
            {featureTag && <FeatureTag type={featureTag} compact showIcon={false} />}
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {navItems.map((item) => renderNavItem(item))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
