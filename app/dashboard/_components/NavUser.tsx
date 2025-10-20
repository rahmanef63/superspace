"use client"

import React from "react"
import { IconDotsVertical } from "@tabler/icons-react"
import { ClerkLoaded, ClerkLoading, SignedIn, SignedOut, SignInButton, useUser } from "@clerk/nextjs"
import { LogOut, Settings, User } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { SafeSignOutButton } from "@/frontend/shared/auth/components/SafeSignOutButton"
import { UserSettings } from "@/frontend/shared/views/static/profile/components/UserSettings"

function SignedInNavUserContent({ isMobile }: { isMobile: boolean }) {
  const { user: clerkUser } = useUser()
  const [showProfileDialog, setShowProfileDialog] = React.useState(false)

  return (
    <>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg grayscale">
                {clerkUser?.imageUrl ? (
                  <AvatarImage src={clerkUser.imageUrl} alt={clerkUser?.fullName ?? "User avatar"} />
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
    </>
  )
}

function SignedOutNavUserContent() {
  return (
    <SidebarMenuItem>
      <SignInButton mode="modal">
        <SidebarMenuButton size="lg" className="justify-between">
          <div className="flex items-center gap-3">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg border">
              <User className="size-4" />
            </div>
            <div className="grid text-left text-sm leading-tight">
              <span className="truncate font-semibold">Sign in</span>
              <span className="truncate text-xs text-muted-foreground">Access your workspace</span>
            </div>
          </div>
        </SidebarMenuButton>
      </SignInButton>
    </SidebarMenuItem>
  )
}

export function NavUser() {
  const { isMobile } = useSidebar()

  return (
    <SidebarMenu>
      <ClerkLoading>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" className="animate-pulse">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-muted" />
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium bg-muted h-3 rounded" />
              <span className="truncate text-xs bg-muted h-2 rounded" />
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </ClerkLoading>
      <ClerkLoaded>
        <SignedIn>
          <SignedInNavUserContent isMobile={isMobile} />
        </SignedIn>
        <SignedOut>
          <SignedOutNavUserContent />
        </SignedOut>
      </ClerkLoaded>
    </SidebarMenu>
  )
}
