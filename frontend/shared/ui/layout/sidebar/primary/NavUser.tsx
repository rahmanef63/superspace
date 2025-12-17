"use client"

import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { IconDotsVertical } from "@tabler/icons-react"
import { ClerkLoaded, ClerkLoading, SignedIn, SignedOut, SignInButton, useUser } from "@clerk/nextjs"
import { LogOut, Settings, User, Sun, Moon, Monitor, Palette, Eye, Check } from "lucide-react"
import { useTheme } from "next-themes"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SafeSignOutButton } from "@/frontend/shared/foundation"
import { useThemeConfig, ThemeToggle } from "@/frontend/shared/theme"

// ============================================================================
// Theme Registry Types
// ============================================================================

interface RegistryTheme {
  name: string
  label: string
  activeColor: {
    light: string
    dark: string
  }
  cssVars: {
    light: Record<string, string>
    dark: Record<string, string>
  }
}

interface RegistryItem {
  name: string
  title: string
  cssVars: {
    light: Record<string, string>
    dark: Record<string, string>
  }
}

interface RegistryData {
  items: RegistryItem[]
}

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
  const { activeTheme, setActiveTheme } = useThemeConfig()
  const [showProfileDialog, setShowProfileDialog] = React.useState(false)
  const [showThemeDialog, setShowThemeDialog] = React.useState(false)
  const [registryThemes, setRegistryThemes] = React.useState<RegistryTheme[]>([])
  const [previewTheme, setPreviewTheme] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(true)

  // Load themes from registry.json
  React.useEffect(() => {
    const loadThemes = async () => {
      try {
        const response = await fetch("/r/registry.json")
        if (response.ok) {
          const registryData: RegistryData = await response.json()
          const themes = registryData.items.map(
            (item): RegistryTheme => ({
              name: item.name,
              label: item.title,
              activeColor: {
                light: item.cssVars.light.primary || "#000",
                dark: item.cssVars.dark.primary || "#fff",
              },
              cssVars: item.cssVars,
            })
          )
          setRegistryThemes(themes)
        }
      } catch (error) {
        console.error("Failed to load themes from registry:", error)
      } finally {
        setLoading(false)
      }
    }
    loadThemes()
  }, [])

  // Apply theme variables to document
  const applyThemeVariables = React.useCallback((themeName: string, isDarkMode?: boolean) => {
    const root = document.documentElement
    const isDark = isDarkMode !== undefined ? isDarkMode : root.classList.contains("dark")
    const themeData = registryThemes.find(t => t.name === themeName)

    if (themeData) {
      const vars = isDark ? themeData.cssVars.dark : themeData.cssVars.light
      for (const [key, value] of Object.entries(vars)) {
        root.style.setProperty(`--${key}`, value)
      }
    }
  }, [registryThemes])

  // Re-apply theme variables when light/dark mode changes
  React.useEffect(() => {
    if (registryThemes.length > 0) {
      const currentTheme = previewTheme || activeTheme
      const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)
      applyThemeVariables(currentTheme, isDark)
    }
  }, [theme, registryThemes, previewTheme, activeTheme, applyThemeVariables])

  // Apply preview theme temporarily
  const handlePreview = (themeName: string) => {
    setPreviewTheme(themeName)
    applyThemeVariables(themeName)
  }

  // Use the theme (save it)
  const handleUseTheme = (themeName: string) => {
    setActiveTheme(themeName)
    setPreviewTheme(null)
    setShowThemeDialog(false)
  }

  // Cancel preview and revert to active theme
  const handleCancelPreview = () => {
    setPreviewTheme(null)
    applyThemeVariables(activeTheme)
  }

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

            {/* Color Mode Toggle (Animated Tabs) */}
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
              Color Mode
            </DropdownMenuLabel>
            <div className="px-2 py-1.5">
              <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/50 relative">
                {/* Animated Background Indicator */}
                <motion.div
                  className="absolute h-[calc(100%-8px)] rounded-md bg-background shadow-sm"
                  initial={false}
                  animate={{
                    x: theme === "light" ? 4 : theme === "dark" ? "calc(100% + 8px)" : "calc(200% + 12px)",
                    width: "calc(33.33% - 8px)",
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                  }}
                />

                {/* Light Button */}
                <button
                  onClick={() => setTheme("light")}
                  className={`relative flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-medium transition-colors z-10 ${theme === "light" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  <motion.div
                    initial={false}
                    animate={{
                      scale: theme === "light" ? 1 : 0.85,
                      rotate: theme === "light" ? 0 : -15,
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <Sun className="h-3.5 w-3.5" />
                  </motion.div>
                  Light
                </button>

                {/* Dark Button */}
                <button
                  onClick={() => setTheme("dark")}
                  className={`relative flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-medium transition-colors z-10 ${theme === "dark" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  <motion.div
                    initial={false}
                    animate={{
                      scale: theme === "dark" ? 1 : 0.85,
                      rotate: theme === "dark" ? 0 : 15,
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <Moon className="h-3.5 w-3.5" />
                  </motion.div>
                  Dark
                </button>

                {/* System Button */}
                <button
                  onClick={() => setTheme("system")}
                  className={`relative flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-medium transition-colors z-10 ${theme === "system" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  <motion.div
                    initial={false}
                    animate={{
                      scale: theme === "system" ? 1 : 0.85,
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <Monitor className="h-3.5 w-3.5" />
                  </motion.div>
                  Auto
                </button>
              </div>
            </div>

            {/* Theme Preset Selector - Opens Dialog */}
            <DropdownMenuItem onClick={() => setShowThemeDialog(true)}>
              <Palette className="mr-2 h-4 w-4" />
              Theme Preset
              <span className="ml-auto text-xs text-muted-foreground truncate max-w-20">
                {activeTheme}
              </span>
            </DropdownMenuItem>

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

      {/* Theme Preset Dialog */}
      <Dialog open={showThemeDialog} onOpenChange={(open) => {
        if (!open) handleCancelPreview()
        setShowThemeDialog(open)
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Choose Theme</DialogTitle>
            <DialogDescription>
              Select a theme preset and color mode.
            </DialogDescription>
          </DialogHeader>

          {/* Color Mode Toggle */}
          <div className="pb-4 border-b">
            <p className="text-sm font-medium mb-2">Color Mode</p>
            <ThemeToggle />
          </div>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-2 pr-4">
              {loading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />
                  ))}
                </div>
              ) : (
                registryThemes.map((t) => {
                  const isActive = activeTheme === t.name
                  const isPreviewing = previewTheme === t.name
                  const isDark = theme === "dark"

                  return (
                    <div
                      key={t.name}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${isActive ? "border-primary bg-primary/5" :
                        isPreviewing ? "border-primary/50 bg-accent" :
                          "border-border hover:bg-accent"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-6 h-6 rounded-full border-2 border-border"
                          style={{
                            backgroundColor: isDark ? t.activeColor.dark : t.activeColor.light,
                          }}
                        />
                        <div>
                          <p className="text-sm font-medium">{t.label}</p>
                          {isActive && (
                            <p className="text-xs text-muted-foreground">Current theme</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!isActive && !isPreviewing && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePreview(t.name)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Preview
                          </Button>
                        )}
                        {isPreviewing && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleUseTheme(t.name)}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Use
                          </Button>
                        )}
                        {isActive && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  )
}

function SignedOutNavUserContent() {
  const { theme, setTheme } = useTheme()
  const ThemeIcon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor

  return (
    <>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg" className="justify-between">
              <div className="flex items-center gap-3">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg border">
                  <ThemeIcon className="size-4" />
                </div>
                <div className="grid text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Appearance</span>
                  <span className="truncate text-xs text-muted-foreground capitalize">{theme} mode</span>
                </div>
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-48">
            <DropdownMenuLabel className="text-xs text-muted-foreground">Color Mode</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => setTheme("light")}>
              <Sun className="mr-2 h-4 w-4" />
              Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              <Moon className="mr-2 h-4 w-4" />
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              <Monitor className="mr-2 h-4 w-4" />
              System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
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
    </>
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
