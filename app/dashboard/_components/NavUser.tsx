"use client"

import React from 'react'
import { IconDotsVertical } from "@tabler/icons-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

import { useClerk, useUser } from "@clerk/nextjs"
import { SafeSignOutButton } from "@/frontend/shared/auth/components/SafeSignOutButton"
import { dark } from '@clerk/themes'
import { useTheme } from "next-themes"
import { LogOut, Settings, User } from "lucide-react"
import { UserSettings } from "@/frontend/shared/pages/static/profile/components/UserSettings"

export function NavUser() {
  const { isMobile } = useSidebar()
  const { signOut } = useClerk()
  const { theme } = useTheme()
  const { user: clerkUser } = useUser();
  const [showProfileDialog, setShowProfileDialog] = React.useState(false)

  const appearance = {
    baseTheme: theme === "dark" ? dark : undefined,
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg grayscale">
                {clerkUser?.imageUrl ? (
                  <AvatarImage
                    src={clerkUser.imageUrl}
                    alt={clerkUser?.fullName ?? "User avatar"}
                  />
                ) : (
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                )}
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{clerkUser?.fullName}</span>
                <span className="text-muted-foreground truncate text-xs">
                  {clerkUser?.primaryEmailAddress?.emailAddress}
                </span>
              </div>
              <IconDotsVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="min-w-56 rounded-lg" align="end" side={isMobile ? "bottom" : "top"}>
            <DropdownMenuItem onClick={() => setShowProfileDialog(true)}>
             <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Settings
             </DropdownMenuItem>
            <SafeSignOutButton>
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </SafeSignOutButton>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>

      {/* Custom Profile Dialog (no Clerk branding) */}
      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Profile Settings</DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto">
            <UserSettings />
          </div>
        </DialogContent>
      </Dialog>
    </SidebarMenu>
  )
}
