"use client"

import * as React from "react"
import {
  Command as CommandIcon,
  Search,
  Settings,
  User,
  FileText,
  FolderKanban,
  Calendar,
  Bell,
  Moon,
  Sun,
  LogOut,
  Plus,
  Home,
  Hash,
  Mail,
  MessageSquare,
  Keyboard,
} from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { cn } from "@/lib/utils"
import { getAllCommands } from "@/frontend/shared/foundation/registries/command-registry"

export interface CommandAction {
  id: string
  label: string
  icon?: React.ComponentType<{ className?: string }>
  shortcut?: string
  group?: string
  keywords?: string[]
  onSelect: () => void
}

export interface CommandMenuProps {
  actions?: CommandAction[]
  placeholder?: string
  onOpenChange?: (open: boolean) => void
  className?: string
}

const defaultGroups = {
  navigation: "Navigation",
  actions: "Quick Actions",
  settings: "Settings",
  theme: "Theme",
}

/**
 * Command Menu Component (Cmd+K / Ctrl+K)
 */
export function CommandMenu({
  actions = [],
  placeholder = "Type a command or search...",
  onOpenChange,
  className,
}: CommandMenuProps) {
  const [open, setOpen] = React.useState(false)
  const { theme, setTheme } = useTheme()

  // Default actions
  const defaultActions: CommandAction[] = [
    // Navigation
    {
      id: "home",
      label: "Go to Home",
      icon: Home,
      shortcut: "G H",
      group: "navigation",
      keywords: ["home", "dashboard", "overview"],
      onSelect: () => { },
    },
    {
      id: "projects",
      label: "Go to Projects",
      icon: FolderKanban,
      shortcut: "G P",
      group: "navigation",
      keywords: ["projects", "tasks"],
      onSelect: () => { },
    },
    {
      id: "calendar",
      label: "Go to Calendar",
      icon: Calendar,
      shortcut: "G C",
      group: "navigation",
      keywords: ["calendar", "events", "schedule"],
      onSelect: () => { },
    },
    {
      id: "settings",
      label: "Go to Settings",
      icon: Settings,
      shortcut: "G S",
      group: "navigation",
      keywords: ["settings", "preferences", "config"],
      onSelect: () => { },
    },

    // Quick Actions
    {
      id: "new-document",
      label: "Create New Document",
      icon: FileText,
      shortcut: "N D",
      group: "actions",
      keywords: ["new", "create", "document", "file"],
      onSelect: () => { },
    },
    {
      id: "new-project",
      label: "Create New Project",
      icon: FolderKanban,
      shortcut: "N P",
      group: "actions",
      keywords: ["new", "create", "project"],
      onSelect: () => { },
    },
    {
      id: "search",
      label: "Search Everything",
      icon: Search,
      shortcut: "/",
      group: "actions",
      keywords: ["search", "find", "query"],
      onSelect: () => { },
    },
    {
      id: "notifications",
      label: "View Notifications",
      icon: Bell,
      shortcut: "G N",
      group: "actions",
      keywords: ["notifications", "alerts", "inbox"],
      onSelect: () => { },
    },

    // Theme
    {
      id: "theme-light",
      label: "Light Mode",
      icon: Sun,
      group: "theme",
      keywords: ["light", "theme", "mode"],
      onSelect: () => setTheme("light"),
    },
    {
      id: "theme-dark",
      label: "Dark Mode",
      icon: Moon,
      group: "theme",
      keywords: ["dark", "theme", "mode"],
      onSelect: () => setTheme("dark"),
    },

    // Settings
    {
      id: "profile",
      label: "Edit Profile",
      icon: User,
      group: "settings",
      keywords: ["profile", "account", "user"],
      onSelect: () => { },
    },
    {
      id: "logout",
      label: "Sign Out",
      icon: LogOut,
      group: "settings",
      keywords: ["logout", "signout", "exit"],
      onSelect: () => { },
    },
  ]

  const registryCommands = getAllCommands().map(cmd => ({
    id: cmd.id,
    label: cmd.label,
    icon: cmd.icon,
    shortcut: cmd.shortcut,
    group: cmd.group ?? "other",
    keywords: cmd.keywords,
    onSelect: cmd.action
  }))

  const allActions = [...defaultActions, ...registryCommands, ...actions]

  // Group actions
  const groupedActions = allActions.reduce((acc, action) => {
    const group = action.group || "other"
    if (!acc[group]) acc[group] = []
    acc[group].push(action)
    return acc
  }, {} as Record<string, CommandAction[]>)

  // Keyboard shortcut
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    // Listen for custom open event
    const handleOpenEvent = () => setOpen(true)
    window.addEventListener("open-command-menu", handleOpenEvent)

    document.addEventListener("keydown", down)
    return () => {
      document.removeEventListener("keydown", down)
      window.removeEventListener("open-command-menu", handleOpenEvent)
    }
  }, [])

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    onOpenChange?.(newOpen)
  }

  const handleSelect = (action: CommandAction) => {
    action.onSelect()
    setOpen(false)
  }

  return (
    <>
      <CommandDialog open={open} onOpenChange={handleOpenChange}>
        <CommandInput placeholder={placeholder} />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          {Object.entries(groupedActions).map(([group, groupActions]) => (
            <React.Fragment key={group}>
              <CommandGroup heading={defaultGroups[group as keyof typeof defaultGroups] || group}>
                {groupActions.map((action) => {
                  const Icon = action.icon ?? CommandIcon
                  return (
                    <CommandItem
                      key={action.id}
                      value={`${action.label} ${action.keywords?.join(" ") || ""}`}
                      onSelect={() => handleSelect(action)}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      <span>{action.label}</span>
                      {action.shortcut && (
                        <CommandShortcut>{action.shortcut}</CommandShortcut>
                      )}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
              <CommandSeparator />
            </React.Fragment>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  )
}

/**
 * Command Menu Trigger Button
 */
export function CommandMenuTrigger({
  className,
  onClick,
}: {
  className?: string
  onClick?: () => void
}) {
  return (
    <Button
      variant="outline"
      className={cn(
        "relative h-9 w-full justify-start rounded-md bg-muted/50 text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-64",
        className
      )}
      onClick={onClick}
    >
      <Search className="mr-2 h-4 w-4" />
      <span className="hidden lg:inline-flex">Search or command...</span>
      <span className="inline-flex lg:hidden">Search...</span>
      <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium opacity-100 sm:flex">
        <span className="text-xs">⌘</span>K
      </kbd>
    </Button>
  )
}

/**
 * Keyboard Shortcuts Dialog
 */
export function KeyboardShortcutsDialog({
  trigger,
  className,
}: {
  trigger?: React.ReactNode
  className?: string
}) {
  const [open, setOpen] = React.useState(false)

  const shortcuts = [
    {
      category: "Navigation", items: [
        { keys: ["G", "H"], description: "Go to Home" },
        { keys: ["G", "P"], description: "Go to Projects" },
        { keys: ["G", "C"], description: "Go to Calendar" },
        { keys: ["G", "S"], description: "Go to Settings" },
      ]
    },
    {
      category: "Actions", items: [
        { keys: ["⌘", "K"], description: "Open Command Menu" },
        { keys: ["/"], description: "Focus Search" },
        { keys: ["N", "D"], description: "New Document" },
        { keys: ["N", "P"], description: "New Project" },
      ]
    },
    {
      category: "General", items: [
        { keys: ["⌘", "S"], description: "Save" },
        { keys: ["⌘", "Z"], description: "Undo" },
        { keys: ["⌘", "⇧", "Z"], description: "Redo" },
        { keys: ["?"], description: "Show Shortcuts" },
      ]
    },
  ]

  // Listen for ? key
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "?" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Keyboard className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Keyboard Shortcuts</h2>
        </div>
        <div className="space-y-6">
          {shortcuts.map((section) => (
            <div key={section.category}>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                {section.category}
              </h3>
              <div className="space-y-2">
                {section.items.map((shortcut) => (
                  <div
                    key={shortcut.description}
                    className="flex items-center justify-between py-1"
                  >
                    <span className="text-sm">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, i) => (
                        <React.Fragment key={i}>
                          <kbd className="px-2 py-1 text-xs font-semibold bg-muted rounded">
                            {key}
                          </kbd>
                          {i < shortcut.keys.length - 1 && (
                            <span className="text-muted-foreground">+</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </CommandDialog>
  )
}
