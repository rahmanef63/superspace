export * from "./constants"
export * from "./settings"
export * from "./theme"

// Legacy exports from constants directory
export * from "../constants"

export const WA_THEMES = {
  light: {
    bg: "hsl(var(--background))",
    surface: "hsl(var(--card))",
    border: "hsl(var(--border))",
    text: "hsl(var(--foreground))",
    muted: "hsl(var(--muted-foreground))",
    accent: "hsl(var(--primary))",
  },
  dark: {
    bg: "hsl(var(--background))",
    surface: "hsl(var(--card))",
    border: "hsl(var(--border))",
    text: "hsl(var(--foreground))",
    muted: "hsl(var(--muted-foreground))",
    accent: "hsl(var(--primary))",
  },
} as const
