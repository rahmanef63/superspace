"use client"

import { useThemeConfig } from "./active-theme"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState, useEffect } from "react"

/**
 * Interface for the data structure the component uses internally.
 */
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

/**
 * Interfaces to correctly type the fetched registry.json data.
 */
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

const DEFAULT_THEMES = [
  {
    name: "Modern Minimal",
    value: "modern-minimal",
  },
  {
    name: "Default",
    value: "default",
  },
  {
    name: "Blue",
    value: "blue",
  },
  {
    name: "Green",
    value: "green",
  },
  {
    name: "Amber",
    value: "amber",
  },
]

const SCALED_THEMES = [
  {
    name: "Modern Minimal Scaled",
    value: "modern-minimal-scaled",
  },
  {
    name: "Default Scaled",
    value: "default-scaled",
  },
  {
    name: "Blue Scaled",
    value: "blue-scaled",
  },
]

const MONO_THEMES = [
  {
    name: "Mono",
    value: "mono-scaled",
  },
]

export function ThemeSelector() {
  const { activeTheme, setActiveTheme } = useThemeConfig()
  const [registryThemes, setRegistryThemes] = useState<RegistryTheme[]>([])
  const [loading, setLoading] = useState(true)

  // Load themes from registry.json on component mount
  useEffect(() => {
    const loadThemes = async () => {
      try {
        const response = await fetch("/r/registry.json")
        if (response.ok) {
          const registryData: RegistryData = await response.json()
          // Transform the fetched items into the structure our component expects
          const themes = registryData.items.map(
            (item): RegistryTheme => ({
              name: item.name,
              label: item.title,
              activeColor: {
                light: item.cssVars.light.primary,
                dark: item.cssVars.dark.primary,
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

  // Effect to apply or remove theme variables when activeTheme changes
  // or when the light/dark mode is toggled.
  useEffect(() => {
    const root = document.documentElement

    const applyModernMinimalTheme = () => {
      // Modern minimal theme variables from registry
      const modernMinimalVars = {
        light: {
          background: "oklch(1.00 0 0)",
          foreground: "oklch(0.32 0 0)",
          card: "oklch(1.00 0 0)",
          "card-foreground": "oklch(0.32 0 0)",
          popover: "oklch(1.00 0 0)",
          "popover-foreground": "oklch(0.32 0 0)",
          primary: "oklch(0.62 0.19 259.81)",
          "primary-foreground": "oklch(1.00 0 0)",
          secondary: "oklch(0.97 0.00 264.54)",
          "secondary-foreground": "oklch(0.45 0.03 256.80)",
          muted: "oklch(0.98 0.00 247.84)",
          "muted-foreground": "oklch(0.55 0.02 264.36)",
          accent: "oklch(0.95 0.03 236.82)",
          "accent-foreground": "oklch(0.38 0.14 265.52)",
          destructive: "oklch(0.64 0.21 25.33)",
          "destructive-foreground": "oklch(1.00 0 0)",
          border: "oklch(0.93 0.01 264.53)",
          input: "oklch(0.93 0.01 264.53)",
          ring: "oklch(0.62 0.19 259.81)",
          "chart-1": "oklch(0.62 0.19 259.81)",
          "chart-2": "oklch(0.55 0.22 262.88)",
          "chart-3": "oklch(0.49 0.22 264.38)",
          "chart-4": "oklch(0.42 0.18 265.64)",
          "chart-5": "oklch(0.38 0.14 265.52)",
          sidebar: "oklch(0.98 0.00 247.84)",
          "sidebar-foreground": "oklch(0.32 0 0)",
          "sidebar-primary": "oklch(0.62 0.19 259.81)",
          "sidebar-primary-foreground": "oklch(1.00 0 0)",
          "sidebar-accent": "oklch(0.95 0.03 236.82)",
          "sidebar-accent-foreground": "oklch(0.38 0.14 265.52)",
          "sidebar-border": "oklch(0.93 0.01 264.53)",
          "sidebar-ring": "oklch(0.62 0.19 259.81)",
        },
        dark: {
          background: "oklch(0.20 0 0)",
          foreground: "oklch(0.92 0 0)",
          card: "oklch(0.27 0 0)",
          "card-foreground": "oklch(0.92 0 0)",
          popover: "oklch(0.27 0 0)",
          "popover-foreground": "oklch(0.92 0 0)",
          primary: "oklch(0.62 0.19 259.81)",
          "primary-foreground": "oklch(1.00 0 0)",
          secondary: "oklch(0.27 0 0)",
          "secondary-foreground": "oklch(0.92 0 0)",
          muted: "oklch(0.27 0 0)",
          "muted-foreground": "oklch(0.72 0 0)",
          accent: "oklch(0.38 0.14 265.52)",
          "accent-foreground": "oklch(0.88 0.06 254.13)",
          destructive: "oklch(0.64 0.21 25.33)",
          "destructive-foreground": "oklch(1.00 0 0)",
          border: "oklch(0.37 0 0)",
          input: "oklch(0.37 0 0)",
          ring: "oklch(0.62 0.19 259.81)",
          "chart-1": "oklch(0.71 0.14 254.62)",
          "chart-2": "oklch(0.62 0.19 259.81)",
          "chart-3": "oklch(0.55 0.22 262.88)",
          "chart-4": "oklch(0.49 0.22 264.38)",
          "chart-5": "oklch(0.42 0.18 265.64)",
          sidebar: "oklch(0.20 0 0)",
          "sidebar-foreground": "oklch(0.92 0 0)",
          "sidebar-primary": "oklch(0.62 0.19 259.81)",
          "sidebar-primary-foreground": "oklch(1.00 0 0)",
          "sidebar-accent": "oklch(0.38 0.14 265.52)",
          "sidebar-accent-foreground": "oklch(0.88 0.06 254.13)",
          "sidebar-border": "oklch(0.37 0 0)",
          "sidebar-ring": "oklch(0.62 0.19 259.81)",
        },
      }

      const isDark = root.classList.contains("dark")
      const vars = isDark ? modernMinimalVars.dark : modernMinimalVars.light

      for (const [key, value] of Object.entries(vars)) {
        root.style.setProperty(`--${key}`, value)
      }
    }

    const applyThemeVariables = (theme: RegistryTheme) => {
      const isDark = root.classList.contains("dark")
      const vars = isDark ? theme.cssVars.dark : theme.cssVars.light

      for (const [key, value] of Object.entries(vars)) {
        root.style.setProperty(`--${key}`, value)
      }
    }

    const removeThemeVariables = () => {
      if (registryThemes.length === 0) return

      // Create a set of all possible variable keys from all themes
      const allVarKeys = new Set<string>()
      registryThemes.forEach((theme) => {
        Object.keys(theme.cssVars.light).forEach((key) => allVarKeys.add(key))
        Object.keys(theme.cssVars.dark).forEach((key) => allVarKeys.add(key))
      })

      allVarKeys.forEach((key) => {
        root.style.removeProperty(`--${key}`)
      })
    }

    // Apply modern minimal theme by default
    if (activeTheme === "modern-minimal" || activeTheme === "default") {
      applyModernMinimalTheme()
    } else {
      const currentRegistryTheme = registryThemes.find(
        (theme) => theme.name === activeTheme
      )

      if (currentRegistryTheme) {
        applyThemeVariables(currentRegistryTheme)
      } else {
        // If the selected theme is not a registry theme, remove the custom properties
        // to let the default CSS classes take over.
        removeThemeVariables()
      }
    }

    // Observe changes to the `class` attribute of the html element (for dark mode toggling)
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "class"
        ) {
          if (activeTheme === "modern-minimal" || activeTheme === "default") {
            applyModernMinimalTheme()
          } else {
            const theme = registryThemes.find((t) => t.name === activeTheme)
            if (theme) {
              applyThemeVariables(theme)
            }
          }
        }
      }
    })

    observer.observe(root, { attributes: true })

    return () => observer.disconnect()
  }, [activeTheme, registryThemes])

  const handleThemeChange = (value: string) => {
    setActiveTheme(value)
  }

  if (loading) {
    return (
      <div className="w-auto min-w-[120px] h-8 animate-pulse rounded bg-muted" />
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Label htmlFor="theme-selector" className="sr-only">
        Theme
      </Label>
      <Select value={activeTheme} onValueChange={handleThemeChange}>
        <SelectTrigger
          id="theme-selector"
          size="sm"
          className="justify-start w-auto min-w-[120px]"
        >
          <span className="hidden text-muted-foreground lg:block">Theme:</span>
          <SelectValue placeholder="Select theme" />
        </SelectTrigger>
        <SelectContent align="end">
          {registryThemes.length > 0 && (
            <>
              <SelectGroup>
                <SelectLabel>Registry Themes</SelectLabel>
                {registryThemes.map((theme) => (
                  <SelectItem key={theme.name} value={theme.name}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 border rounded-full"
                        style={{
                          backgroundColor: theme.activeColor.light,
                        }}
                      />
                      {theme.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectGroup>
              <SelectSeparator />
            </>
          )}

          <SelectGroup>
            <SelectLabel>Default</SelectLabel>
            {DEFAULT_THEMES.map((theme) => (
              <SelectItem key={theme.name} value={theme.value}>
                {theme.name}
              </SelectItem>
            ))}
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>Scaled</SelectLabel>
            {SCALED_THEMES.map((theme) => (
              <SelectItem key={theme.name} value={theme.value}>
                {theme.name}
              </SelectItem>
            ))}
          </SelectGroup>
          <SelectGroup>
            <SelectLabel>Monospaced</SelectLabel>
            {MONO_THEMES.map((theme) => (
              <SelectItem key={theme.name} value={theme.value}>
                {theme.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}


