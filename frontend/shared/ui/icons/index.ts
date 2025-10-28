import {
  Box,
  Component,
  Database,
  FileText,
  Image as ImageIcon,
  LayoutDashboard,
  LayoutTemplate,
  ListTree,
  Megaphone,
  MessageSquare,
  MousePointerClick,
  Navigation,
  PanelsTopLeft,
  Puzzle,
  Sparkles,
  Table,
  Workflow,
  type LucideIcon,
} from 'lucide-react';

type IconLookup = Record<string, LucideIcon>;

const defaultFeatureIcon: LucideIcon = LayoutDashboard;
const featureIcons: IconLookup = {
  cms: LayoutDashboard,
  automation: Workflow,
  database: Database,
  data: Database,
  menu: Navigation,
  menus: Navigation,
  navigation: Navigation,
  workflow: Workflow,
  chat: MessageSquare,
  messaging: MessageSquare,
  marketing: Megaphone,
};

const defaultCategoryIcon: LucideIcon = Component;
const categoryIcons: IconLookup = {
  layout: PanelsTopLeft,
  content: FileText,
  media: ImageIcon,
  navigation: Navigation,
  action: MousePointerClick,
  actions: MousePointerClick,
  ui: Component,
  templates: LayoutTemplate,
  template: LayoutTemplate,
  automation: Workflow,
  database: Database,
  data: Database,
  form: FileText,
  forms: FileText,
  table: Table,
  tables: Table,
  list: ListTree,
  menu: Navigation,
  menus: Navigation,
  integration: Puzzle,
  integrations: Puzzle,
  analytics: Sparkles,
  insights: Sparkles,
  marketing: Megaphone,
};

const featureOverrides = new Map<string, LucideIcon>();
const categoryOverrides = new Map<string, LucideIcon>();

function normalizeKey(value?: string): string | undefined {
  return value?.trim().toLowerCase();
}

export function registerFeatureIcon(feature: string, icon: LucideIcon) {
  const key = normalizeKey(feature);
  if (!key) return;
  featureOverrides.set(key, icon);
}

export function registerCategoryIcon(category: string, icon: LucideIcon) {
  const key = normalizeKey(category);
  if (!key) return;
  categoryOverrides.set(key, icon);
}

export function getFeatureIcon(feature?: string): LucideIcon {
  const key = normalizeKey(feature);
  if (!key) return defaultFeatureIcon;
  if (featureOverrides.has(key)) {
    return featureOverrides.get(key)!;
  }
  if (featureIcons[key]) {
    return featureIcons[key];
  }
  for (const [mapKey, icon] of Object.entries(featureIcons)) {
    if (key.includes(mapKey)) {
      return icon;
    }
  }
  return defaultFeatureIcon;
}

export function getCategoryIcon(category?: string): LucideIcon {
  const key = normalizeKey(category);
  if (!key) return defaultCategoryIcon;
  if (categoryOverrides.has(key)) {
    return categoryOverrides.get(key)!;
  }
  const normalizedKey = key.replace(/[^a-z0-9]/g, '');
  if (categoryIcons[key]) {
    return categoryIcons[key];
  }
  if (normalizedKey && categoryIcons[normalizedKey]) {
    return categoryIcons[normalizedKey];
  }
  for (const [mapKey, icon] of Object.entries(categoryIcons)) {
    if (key.includes(mapKey)) {
      return icon;
    }
  }
  return defaultCategoryIcon;
}
