"use client"

import * as React from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

export function DashboardSkeleton() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <Sidebar>
        <SidebarHeader className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-md bg-sidebar-accent animate-pulse" />
            <div className="flex-1 space-y-1">
              <div className="h-4 w-24 bg-sidebar-accent animate-pulse rounded" />
              <div className="h-3 w-16 bg-sidebar-accent animate-pulse rounded" />
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent className="p-2 space-y-4">
          <div className="space-y-2">
            <div className="px-2 py-1">
              <div className="h-3 w-20 bg-sidebar-accent animate-pulse rounded mb-2" />
            </div>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-8 w-full bg-sidebar-accent/50 animate-pulse rounded-md" />
            ))}
          </div>
          <div className="space-y-2">
            <div className="px-2 py-1">
              <div className="h-3 w-20 bg-sidebar-accent animate-pulse rounded mb-2" />
            </div>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-8 w-full bg-sidebar-accent/50 animate-pulse rounded-md" />
            ))}
          </div>
        </SidebarContent>
        <SidebarFooter className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-sidebar-accent animate-pulse" />
            <div className="flex-1 space-y-1">
              <div className="h-4 w-20 bg-sidebar-accent animate-pulse rounded" />
              <div className="h-3 w-32 bg-sidebar-accent animate-pulse rounded" />
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex flex-col h-screen overflow-hidden bg-background">
        <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4 bg-background">
          <div className="h-4 w-4 bg-muted animate-pulse rounded" />
          <div className="h-4 w-1 bg-muted animate-pulse rounded mx-2" />
          <div className="h-4 w-32 bg-muted animate-pulse rounded" />
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="aspect-video rounded-xl bg-muted/50 animate-pulse" />
            <div className="aspect-video rounded-xl bg-muted/50 animate-pulse" />
            <div className="aspect-video rounded-xl bg-muted/50 animate-pulse" />
          </div>
          <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 animate-pulse md:min-h-min" />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
