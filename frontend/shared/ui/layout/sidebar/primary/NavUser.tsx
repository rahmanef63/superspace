"use client"

import React from "react"
import { IconDotsVertical } from "@tabler/icons-react"
import { ClerkLoaded, ClerkLoading, SignedIn, SignedOut, SignInButton, useUser } from "@clerk/nextjs"
import { LogOut, Settings, User, Sun, Moon, Monitor } from "lucide-react"
import { useTheme } from "next-themes"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuRadioGroup, DropdownMenuRadioItem } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { SafeSignOutButton } from "@/frontend/shared/foundation"

// ============================================================================
// Props Injection Pattern - No Feature Coupling!
// ============================================================================
// Features can inject their own settings components via props
// This makes NavUser truly shared and reusable across features

interface NavUserProps {
  /**
   * Optional profile settings component to show in dialog
   * If not provided, Profile menu item will be hidden
   */
  profileSettingsComponent?: React.ComponentType

  /**
   * Optional callback when Settings menu is clicked
   * If not provided, Settings menu item will be hidden
   */
  onSettingsClick?: () => void
}

interface SignedInNavUserContentProps {
  isMobile: boolean
  profileSettingsComponent?: React.ComponentType
  onSettingsClick?: () => void
}

function SignedInNavUserContent({
  isMobile,
  profileSettingsComponent: ProfileSettings,
  onSettingsClick
}: SignedInNavUserContentProps) {
  const { user: clerkUser } = useUser()
  const { setOpenMobile } = useSidebar()
  const { theme, setTheme } = useTheme()
  const [showProfileDialog, setShowProfileDialog] = React.useState(false)

  // Handler to close mobile sidebar when menu is clicked
  const handleSettingsClick = () => {
    if (isMobile) {
      setOpenMobile(false)
    }

    if (onSettingsClick) {
      onSettingsClick()
    } else {
      // Default: Open settings drawer
      window.dispatchEvent(new Event("open-settings"))
    }
  }

  const ThemeIcon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor

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

            {/* Settings (Always visible now) */}
            <DropdownMenuItem onClick={handleSettingsClick}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>

            {/* Theme Toggle */}
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <ThemeIcon className="mr-2 h-4 w-4" />
                Theme
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
                  <DropdownMenuRadioItem value="light">
                    <Sun className="mr-2 h-4 w-4" />
                    Light
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="dark">
                    <Moon className="mr-2 h-4 w-4" />
                    Dark
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="system">
                    <Monitor className="mr-2 h-4 w-4" />
                    System
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSeparator />
            <SafeSignOutButton>
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </SafeSignOutButton>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>

      {/* Profile Dialog (Custom or Default) */}
      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Profile Settings</DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto">
            {ProfileSettings ? (
              <ProfileSettings />
            ) : (
              <div className="p-4 space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={clerkUser?.imageUrl} />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-medium">{clerkUser?.fullName}</h3>
                    <p className="text-sm text-muted-foreground">{clerkUser?.primaryEmailAddress?.emailAddress}</p>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  Profile editing is managed via your identity provider.
                </div>
              </div>
            )}
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

/**
 * NavUser Component - Truly Shared, No Feature Coupling
 *
 * @example
 * // Without any settings (minimal)
 * <NavUser />
 *
 * @example
 * // With profile settings from user-settings feature
 * import { UserSettings } from "@/frontend/features/user-settings/components/UserSettings"
 * <NavUser profileSettingsComponent={UserSettings} />
 *
 * @example
 * // With both profile and settings
 * <NavUser
 *   profileSettingsComponent={UserSettings}
 *   onSettingsClick={() => router.push('/settings')}
 * />
 */
export function NavUser({
  profileSettingsComponent,
  onSettingsClick
}: NavUserProps = {}) {
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
          <SignedInNavUserContent
            isMobile={isMobile}
            profileSettingsComponent={profileSettingsComponent}
            onSettingsClick={onSettingsClick}
          />
        </SignedIn>
        <SignedOut>
          <SignedOutNavUserContent />
        </SignedOut>
      </ClerkLoaded>
    </SidebarMenu>
  )
}
