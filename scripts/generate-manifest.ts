#!/usr/bin/env tsx
/**
 * Auto-generate frontend/views/manifest.tsx
 *
 * This script reads features.config.ts and generates the component registry
 * to ensure DRY principle - only edit features.config.ts, not manifest.tsx
 *
 * Usage:
 *   pnpm run generate:manifest
 */

import { FEATURES_REGISTRY, type FeatureMetadata } from "../features.config"
import fs from "fs"
import path from "path"

interface ComponentImportConfig {
  path: string
  namedExport?: string
}

const COMPONENT_IMPORT_OVERRIDES: Record<string, ComponentImportConfig> = {
  Page: { path: "@/frontend/features/chat/page" }, // wa feature uses "Page" component
  ChatPage: { path: "@/frontend/features/chat/page" },
  ChatsPage: { path: "@/frontend/features/chat/page" },
  StatusPage: { path: "@/frontend/features/status/page" },
  AIPage: { path: "@/frontend/features/ai/page" },
  StarredPage: { path: "@/frontend/features/starred/page" },
  ArchivedPage: { path: "@/frontend/features/archived/page" },
  CallsPage: { path: "@/frontend/features/calls/page" },
  DocumentsPage: { path: "@/frontend/features/documents/page" },
  OverviewPage: { path: "@/frontend/views/dynamic/overview/page" },
  MembersPage: { path: "@/frontend/views/static/member/page" },
  FriendsPage: { path: "@/frontend/views/static/friends/page" },
  PagesPage: { path: "@/frontend/views/static/pages/page" },
  DatabasesPage: { path: "@/frontend/features/database/page" },
  MenusPage: { path: "@/frontend/features/menu-store/page" },
  InvitationsPage: { path: "@/frontend/views/static/invitations/page" },
  ProfilePage: { path: "@/frontend/views/static/profile/page" },
  WorkspacesPage: { path: "@/frontend/views/static/workspaces/page" },
  CalendarPage: { path: "@/frontend/features/calendar/views/CalendarPage" },
  TasksPage: { path: "@/frontend/features/tasks/views/TasksPage" },
  WikiPage: { path: "@/frontend/features/wiki/views/WikiPage" },
  CanvasPage: { path: "@/frontend/features/canvas/page" },
  ReportsPage: { path: "@/frontend/features/reports/page" },
}

function fileExists(...segments: string[]): boolean {
  return fs.existsSync(path.join(process.cwd(), ...segments))
}

function resolveComponentImport(feature: FeatureMetadata): ComponentImportConfig {
  const override = COMPONENT_IMPORT_OVERRIDES[feature.component]
  if (override) {
    return override
  }

  // Check for specific WA (WhatsApp) feature components from chat shared pages
  if (feature.slug.startsWith("wa-") || feature.component.startsWith("WA")) {
    return { path: "@/frontend/features/chat/shared/pages", namedExport: feature.component }
  }

  if (fileExists("frontend", "views", "static", feature.slug, "page.tsx")) {
    return { path: `@/frontend/views/static/${feature.slug}/page` }
  }

  if (fileExists("frontend", "views", "dynamic", feature.slug, "page.tsx")) {
    return { path: `@/frontend/views/dynamic/${feature.slug}/page` }
  }

  if (fileExists("frontend", "features", feature.slug, "page.tsx")) {
    return { path: `@/frontend/features/${feature.slug}/page` }
  }

  if (fileExists("frontend", "features", feature.slug, "views", `${feature.component}.tsx`)) {
    return { path: `@/frontend/features/${feature.slug}/views/${feature.component}` }
  }

  if (fileExists("frontend", "features", feature.slug, "index.ts")) {
    return { path: `@/frontend/features/${feature.slug}`, namedExport: feature.component }
  }

  console.warn(
    `Warning: unable to resolve component path for "${feature.component}" (slug: "${feature.slug}"). Falling back to "@/frontend/features/${feature.slug}/page".`
  )
  return { path: `@/frontend/features/${feature.slug}/page` }
}

// Flatten nested features (for features with children)
function flattenFeatures(features: FeatureMetadata[]): FeatureMetadata[] {
  const result: FeatureMetadata[] = []

  for (const feature of features) {
    result.push(feature)
    if (feature.children && feature.children.length > 0) {
      result.push(...flattenFeatures(feature.children))
    }
  }

  return result
}

// Get icon import
function getIconName(iconString: string): string {
  return iconString || "FileText"
}

// Generate imports for all features
function generateImports(features: FeatureMetadata[]): string {
  const allFeatures = flattenFeatures(features)
  const imports: string[] = []
  const icons = new Set<string>()

  // Collect all unique icons
  allFeatures.forEach(f => {
    const icon = getIconName(f.icon)
    icons.add(icon)
  })

  // Add lucide-react icons import
  imports.push(`import {
  ${Array.from(icons).sort().join(',\n  ')}
} from "lucide-react"`)

  return imports.join('\n')
}

function indentMultiline(value: string, indent: number): string {
  const pad = " ".repeat(indent)
  return value
    .split("\n")
    .map((line, index) => (index === 0 ? line : pad + line))
    .join("\n")
}

function renderLazyLoader(config: ComponentImportConfig): string {
  if (!config.namedExport) {
    return `lazy(() => import("${config.path}"))`
  }

  const lines = [
    "lazy(async () => {",
    `  const module = await import("${config.path}")`,
    `  const Component = module.${config.namedExport}`,
    "  if (!Component) {",
    `    throw new Error("Failed to load component ${config.namedExport} from ${config.path}")`,
    "  }",
    "  return { default: Component }",
    "})",
  ]

  return lines.join("\n")
}

// Generate component registry entries
function generateRegistryEntries(features: FeatureMetadata[]): string {
  const allFeatures = flattenFeatures(features)

  return allFeatures.map(feature => {
    const importConfig = resolveComponentImport(feature)
    const componentLoader = indentMultiline(renderLazyLoader(importConfig), 6)
    const iconName = getIconName(feature.icon)

    return `  {
    id: "${feature.slug}",
    componentId: "${feature.component}",
    title: "${feature.name}",
    description: "${feature.description}",
    icon: ${iconName},
    component: ${componentLoader},
  }`
  }).join(',\n')
}

// Generate the manifest file
function generateManifest(): string {
  const features = FEATURES_REGISTRY

  return `/**
 * AUTO-GENERATED FILE - DO NOT EDIT MANUALLY
 *
 * Generated by: scripts/generate-manifest.ts
 * Source: features.config.ts
 *
 * To update this file:
 *   1. Edit features.config.ts
 *   2. Run: pnpm run generate:manifest
 */

"use client"

import type { Id } from "@convex/_generated/dataModel"
import type { ElementType, ReactElement } from "react"
import { lazy } from "react"

${generateImports(features)}

export type AppPageComponent = (props: { workspaceId?: Id<"workspaces"> | null }) => ReactElement | null

export interface PageManifestItem {
  id: string
  componentId: string
  title: string
  description?: string
  icon?: ElementType
  color?: string
  component: React.LazyExoticComponent<React.ComponentType<any>>
}

export const DEFAULT_PAGE_MANIFEST: PageManifestItem[] = [
${generateRegistryEntries(features)}
]

export const PAGE_MANIFEST_MAP: Record<string, PageManifestItem> = Object.fromEntries(
  DEFAULT_PAGE_MANIFEST.map((p) => [p.id, p]),
)

export const COMPONENT_REGISTRY_MAP: Record<string, PageManifestItem> = Object.fromEntries(
  DEFAULT_PAGE_MANIFEST.map((p) => [p.componentId, p]),
)

export function getDefaultPages(): PageManifestItem[] {
  return DEFAULT_PAGE_MANIFEST
}

export function getPageById(id: string): PageManifestItem | undefined {
  return DEFAULT_PAGE_MANIFEST.find((p) => p.id === id)
}

export function getComponentById(componentId: string): PageManifestItem | undefined {
  return COMPONENT_REGISTRY_MAP[componentId]
}

interface AppContentProps {
  workspaceId?: Id<"workspaces"> | null
  activeView: string
}

export function AppContent({ workspaceId, activeView }: AppContentProps) {
  const fallbackPage =
    DEFAULT_PAGE_MANIFEST.find((p) => p.id === activeView) ?? DEFAULT_PAGE_MANIFEST.find((p) => p.id === "overview")

  if (!fallbackPage) {
    return <div className="flex-1 p-8">Page not found: {activeView}</div>
  }

  const Comp = fallbackPage.component
  return (
    <div className="flex-1 overflow-hidden">
      <Comp workspaceId={workspaceId ?? null} />
    </div>
  )
}
`
}

// Main execution
function main() {
  console.log("🚀 Generating manifest.tsx from features.config.ts...")

  try {
    const manifestContent = generateManifest()
    const outputPath = path.join(process.cwd(), "frontend/views/manifest.tsx")

    // Backup old manifest
    if (fs.existsSync(outputPath)) {
      const backupPath = path.join(process.cwd(), "frontend/views/manifest.tsx.backup")
      fs.copyFileSync(outputPath, backupPath)
      console.log("📦 Backed up old manifest to manifest.tsx.backup")
    }

    // Write new manifest
    fs.writeFileSync(outputPath, manifestContent, "utf-8")
    console.log("✅ Successfully generated manifest.tsx")
    console.log(`📝 Location: ${outputPath}`)

    // Count features
    const allFeatures = flattenFeatures(FEATURES_REGISTRY)
    console.log(`📊 Generated ${allFeatures.length} component entries`)

  } catch (error) {
    console.error("❌ Error generating manifest:", error)
    process.exit(1)
  }
}

main()
