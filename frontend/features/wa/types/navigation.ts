export interface NavigationItem {
  id: string
  title: string
  icon: any
  badge?: number
  isActive?: boolean
  children?: NavigationItem[]
}

export interface NavigationSection {
  title: string
  items: NavigationItem[]
}

export type NavigationView =
  | "chats"
  | "calls"
  | "status"
  | "ai"
  | "starred"
  | "archived"
  | "settings"
  | "profile"
  | "locked"
