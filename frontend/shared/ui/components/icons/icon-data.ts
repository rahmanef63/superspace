import * as LucideIcons from "lucide-react";

export interface IconData {
  name: string;
  component: any;
  category: string;
  keywords?: string[];
}

export interface ColorOption {
  value: string;
  label: string;
  group?: string;
}

// Icon categories for better organization
export const ICON_CATEGORIES = [
  "all",
  "common",
  "files",
  "arrows",
  "communication",
  "media",
  "design",
  "development",
  "business",
  "social",
  "emoji",
] as const;

export type IconCategory = typeof ICON_CATEGORIES[number];

// Comprehensive icon list organized by category
export const ICONS_BY_CATEGORY: Record<IconCategory, string[]> = {
  all: [], // Will be populated with all icons
  common: [
    "Home",
    "Star",
    "Heart",
    "Settings",
    "Search",
    "Bell",
    "Calendar",
    "Clock",
    "MapPin",
    "Globe",
    "Bookmark",
    "Tag",
    "Flag",
    "Award",
    "Target",
    "Zap",
    "Lightbulb",
    "Sun",
    "Moon",
    "Cloud",
  ],
  files: [
    "File",
    "FileText",
    "FileCode",
    "FileImage",
    "FileVideo",
    "FileAudio",
    "FilePlus",
    "FileMinus",
    "FileEdit",
    "FileCheck",
    "FileX",
    "Folder",
    "FolderOpen",
    "FolderPlus",
    "FolderMinus",
    "Archive",
    "Inbox",
    "Package",
    "Database",
    "HardDrive",
  ],
  arrows: [
    "ArrowUp",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "ArrowUpRight",
    "ArrowUpLeft",
    "ArrowDownRight",
    "ArrowDownLeft",
    "ChevronUp",
    "ChevronDown",
    "ChevronLeft",
    "ChevronRight",
    "ChevronsUp",
    "ChevronsDown",
    "ChevronsLeft",
    "ChevronsRight",
    "MoveUp",
    "MoveDown",
    "MoveLeft",
    "MoveRight",
  ],
  communication: [
    "MessageSquare",
    "MessageCircle",
    "Mail",
    "Send",
    "Phone",
    "Video",
    "Mic",
    "MicOff",
    "Volume2",
    "VolumeX",
    "Users",
    "User",
    "UserPlus",
    "UserMinus",
    "UserCheck",
    "AtSign",
    "Hash",
    "Share2",
    "Link",
    "Paperclip",
  ],
  media: [
    "Image",
    "Camera",
    "Film",
    "Music",
    "Play",
    "Pause",
    "Square",
    "SkipBack",
    "SkipForward",
    "FastForward",
    "Rewind",
    "Volume",
    "Speaker",
    "Headphones",
    "Radio",
    "Tv",
    "Monitor",
    "Smartphone",
    "Tablet",
    "Watch",
  ],
  design: [
    "Palette",
    "Brush",
    "Pen",
    "PenTool",
    "Edit",
    "Edit2",
    "Edit3",
    "Pencil",
    "Feather",
    "Type",
    "Bold",
    "Italic",
    "Underline",
    "AlignLeft",
    "AlignCenter",
    "AlignRight",
    "Layers",
    "Layout",
    "Grid",
    "Crop",
  ],
  development: [
    "Code",
    "Code2",
    "Terminal",
    "Command",
    "Cpu",
    "Server",
    "GitBranch",
    "GitCommit",
    "GitMerge",
    "GitPullRequest",
    "Github",
    "Gitlab",
    "Bug",
    "Wrench",
    "Tool",
    "Settings2",
    "Sliders",
    "ToggleLeft",
    "ToggleRight",
    "Power",
  ],
  business: [
    "Briefcase",
    "Building",
    "Building2",
    "Store",
    "ShoppingCart",
    "ShoppingBag",
    "CreditCard",
    "DollarSign",
    "TrendingUp",
    "TrendingDown",
    "BarChart",
    "BarChart2",
    "PieChart",
    "Activity",
    "Percent",
    "Receipt",
    "Wallet",
    "Banknote",
    "Calculator",
    "Scale",
  ],
  social: [
    "ThumbsUp",
    "ThumbsDown",
    "Smile",
    "Frown",
    "Meh",
    "Angry",
    "Laugh",
    "PartyPopper",
    "Gift",
    "Trophy",
    "Medal",
    "Crown",
    "Sparkles",
    "Flame",
    "Coffee",
    "Pizza",
    "Beer",
    "Wine",
    "Cake",
    "IceCream",
  ],
  emoji: [
    "SmilePlus",
    "Smile",
    "Laugh",
    "Angry",
    "Frown",
    "Meh",
    "Heart",
    "HeartHandshake",
    "ThumbsUp",
    "ThumbsDown",
    "PartyPopper",
    "Rocket",
    "Zap",
    "Star",
    "Sparkles",
    "Sun",
    "Moon",
    "Cloud",
    "CloudRain",
    "Flame",
  ],
};

// Populate 'all' category with all icons
ICONS_BY_CATEGORY.all = Object.values(ICONS_BY_CATEGORY)
  .flat()
  .filter((icon, index, self) => self.indexOf(icon) === index && icon !== "all");

// Color presets with categories
export const COLOR_PRESETS: ColorOption[] = [
  // Default
  { value: "default", label: "Default", group: "Theme" },
  { value: "primary", label: "Primary", group: "Theme" },
  { value: "secondary", label: "Secondary", group: "Theme" },
  { value: "accent", label: "Accent", group: "Theme" },

  // Reds
  { value: "#ef4444", label: "Red", group: "Basic" },
  { value: "#dc2626", label: "Dark Red", group: "Basic" },
  { value: "#f87171", label: "Light Red", group: "Basic" },

  // Oranges
  { value: "#f97316", label: "Orange", group: "Basic" },
  { value: "#ea580c", label: "Dark Orange", group: "Basic" },
  { value: "#fb923c", label: "Light Orange", group: "Basic" },

  // Yellows
  { value: "#f59e0b", label: "Amber", group: "Basic" },
  { value: "#eab308", label: "Yellow", group: "Basic" },
  { value: "#fde047", label: "Light Yellow", group: "Basic" },

  // Greens
  { value: "#84cc16", label: "Lime", group: "Basic" },
  { value: "#22c55e", label: "Green", group: "Basic" },
  { value: "#10b981", label: "Emerald", group: "Basic" },
  { value: "#14b8a6", label: "Teal", group: "Basic" },

  // Blues
  { value: "#06b6d4", label: "Cyan", group: "Basic" },
  { value: "#0ea5e9", label: "Sky", group: "Basic" },
  { value: "#3b82f6", label: "Blue", group: "Basic" },
  { value: "#2563eb", label: "Dark Blue", group: "Basic" },

  // Purples
  { value: "#6366f1", label: "Indigo", group: "Basic" },
  { value: "#8b5cf6", label: "Violet", group: "Basic" },
  { value: "#a855f7", label: "Purple", group: "Basic" },
  { value: "#d946ef", label: "Fuchsia", group: "Basic" },

  // Pinks
  { value: "#ec4899", label: "Pink", group: "Basic" },
  { value: "#f43f5e", label: "Rose", group: "Basic" },

  // Grays
  { value: "#6b7280", label: "Gray", group: "Neutral" },
  { value: "#9ca3af", label: "Light Gray", group: "Neutral" },
  { value: "#4b5563", label: "Dark Gray", group: "Neutral" },
  { value: "#1f2937", label: "Charcoal", group: "Neutral" },
];

// Background color presets (lighter versions for backgrounds)
export const BACKGROUND_PRESETS: ColorOption[] = [
  { value: "transparent", label: "None", group: "Special" },
  { value: "#fef2f2", label: "Red", group: "Light" },
  { value: "#fff7ed", label: "Orange", group: "Light" },
  { value: "#fffbeb", label: "Yellow", group: "Light" },
  { value: "#f0fdf4", label: "Green", group: "Light" },
  { value: "#ecfeff", label: "Cyan", group: "Light" },
  { value: "#eff6ff", label: "Blue", group: "Light" },
  { value: "#eef2ff", label: "Indigo", group: "Light" },
  { value: "#faf5ff", label: "Purple", group: "Light" },
  { value: "#fdf4ff", label: "Fuchsia", group: "Light" },
  { value: "#fdf2f8", label: "Pink", group: "Light" },
  { value: "#f9fafb", label: "Gray", group: "Light" },
];

// Helper function to get icon component by name
export function getIconComponent(iconName: string): any {
  return (LucideIcons as any)[iconName] || LucideIcons.HelpCircle;
}

// Legacy support: get icon from name (migrated from frontend/shared/pages/icons.ts)
// This maintains backward compatibility with existing code
export function iconFromName(name?: string): any {
  if (!name) return undefined;
  return getIconComponent(name);
}

// Helper function to search icons
export function searchIcons(query: string, category: IconCategory = "all"): string[] {
  const searchTerm = query.toLowerCase().trim();

  if (!searchTerm) {
    return ICONS_BY_CATEGORY[category];
  }

  const iconsToSearch = category === "all"
    ? ICONS_BY_CATEGORY.all
    : ICONS_BY_CATEGORY[category];

  return iconsToSearch.filter((iconName) =>
    iconName.toLowerCase().includes(searchTerm)
  );
}

// Helper to get color value (supports theme tokens and hex)
export function getColorValue(color: string, theme?: "light" | "dark"): string {
  const themeColors: Record<string, string> = {
    default: "currentColor",
    primary: "hsl(var(--primary))",
    secondary: "hsl(var(--secondary))",
    accent: "hsl(var(--accent))",
  };

  return themeColors[color] || color;
}

// Export common icon names for quick access
export const COMMON_ICONS = ICONS_BY_CATEGORY.common;
