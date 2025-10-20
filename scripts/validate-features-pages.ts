#!/usr/bin/env node
/**
 * Feature Pages Validation Script
 *
 * Validates that all features defined in features.config.ts have corresponding page files.
 * This helps catch missing pages early during development.
 *
 * Usage: pnpm run validate:pages
 */

import { existsSync } from "fs"
import { join } from "path"
import { FEATURES_REGISTRY } from "../features.config"

const rootDir = process.cwd()

interface ValidationResult {
  slug: string
  name: string
  component: string
  expectedPath: string
  exists: boolean
  featureType: string
  isReady?: boolean
}

function getExpectedPagePath(component: string): string {
  // Map component names to their expected file paths
  const componentMap: Record<string, string> = {
    // Features
    "OverviewPage": "frontend/features/overview/page.tsx",
    "ChatsPage": "frontend/features/chat/page.tsx",
    "CallsPage": "frontend/features/calls/page.tsx",
    "StatusPage": "frontend/features/status/page.tsx",
    "AIPage": "frontend/features/ai/page.tsx",
    "StarredPage": "frontend/features/starred/page.tsx",
    "ArchivedPage": "frontend/features/archived/page.tsx",
    "ProfilePage": "frontend/views/static/profile/page.tsx",
    "MembersPage": "frontend/views/static/member/page.tsx",
    "FriendsPage": "frontend/views/static/friends/page.tsx",
    "PagesPage": "frontend/views/static/pages/page.tsx",
    "DatabasesPage": "frontend/views/static/databases/page.tsx",
    "CanvasPage": "frontend/features/canvas/page.tsx",
    "DocumentsPage": "frontend/features/documents/page.tsx",
    "MenusPage": "frontend/views/static/menus/page.tsx",
    "InvitationsPage": "frontend/views/static/invitations/page.tsx",
    "WorkspacesPage": "frontend/views/static/workspaces/page.tsx",

    // Optional features
    "CalendarPage": "frontend/features/calendar/page.tsx",
    "ReportsPage": "frontend/features/reports/page.tsx",
    "TasksPage": "frontend/features/tasks/page.tsx",
    "WikiPage": "frontend/features/wiki/page.tsx",
    "SupportPage": "frontend/features/support/page.tsx",
    "ProjectsPage": "frontend/features/projects/page.tsx",
    "CRMPage": "frontend/features/crm/page.tsx",
    "NotificationsPage": "frontend/features/notifications/page.tsx",
    "WorkflowsPage": "frontend/features/workflows/page.tsx",
  }

  return componentMap[component] || `frontend/features/${component.replace('Page', '').toLowerCase()}/page.tsx`
}

function validateFeaturePages(): ValidationResult[] {
  const results: ValidationResult[] = []

  for (const feature of FEATURES_REGISTRY) {
    const expectedPath = getExpectedPagePath(feature.component)
    const fullPath = join(rootDir, expectedPath)
    const exists = existsSync(fullPath)

    results.push({
      slug: feature.slug,
      name: feature.name,
      component: feature.component,
      expectedPath,
      exists,
      featureType: feature.featureType,
      isReady: feature.isReady,
    })
  }

  return results
}

function generateReport(results: ValidationResult[]) {
  console.log("\n📊 Feature Pages Validation Report")
  console.log("=" .repeat(80))

  const missing = results.filter(r => !r.exists)
  const existing = results.filter(r => r.exists)
  const missingOptional = missing.filter(r => r.featureType === "optional")
  const missingDefault = missing.filter(r => r.featureType === "default" || r.featureType === "system")

  console.log(`\n✅ Existing Pages: ${existing.length}/${results.length}`)
  console.log(`❌ Missing Pages: ${missing.length}/${results.length}`)

  if (missingDefault.length > 0) {
    console.log("\n⚠️  CRITICAL: Missing Default/System Feature Pages:")
    console.log("-".repeat(80))
    missingDefault.forEach(r => {
      console.log(`  ❌ ${r.name} (${r.slug})`)
      console.log(`     Component: ${r.component}`)
      console.log(`     Expected: ${r.expectedPath}`)
      console.log()
    })
  }

  if (missingOptional.length > 0) {
    console.log("\n⚠️  Missing Optional Feature Pages:")
    console.log("-".repeat(80))
    missingOptional.forEach(r => {
      const status = r.isReady ? "❌ READY but missing" : "⚠️  In development"
      console.log(`  ${status}: ${r.name} (${r.slug})`)
      console.log(`     Component: ${r.component}`)
      console.log(`     Expected: ${r.expectedPath}`)
      console.log()
    })
  }

  if (missing.length === 0) {
    console.log("\n🎉 All feature pages exist!")
  }

  // Group by feature type
  console.log("\n📁 Pages by Feature Type:")
  console.log("-".repeat(80))
  const byType = results.reduce((acc, r) => {
    if (!acc[r.featureType]) acc[r.featureType] = { total: 0, existing: 0 }
    acc[r.featureType].total++
    if (r.exists) acc[r.featureType].existing++
    return acc
  }, {} as Record<string, { total: number; existing: number }>)

  Object.entries(byType).forEach(([type, stats]) => {
    const emoji = stats.existing === stats.total ? "✅" : "⚠️ "
    console.log(`  ${emoji} ${type}: ${stats.existing}/${stats.total}`)
  })

  return missing.length === 0
}

function main() {
  console.log("🔍 Validating feature pages...\n")

  const results = validateFeaturePages()
  const allValid = generateReport(results)

  console.log("\n" + "=".repeat(80))

  if (!allValid) {
    console.log("\n❌ Validation failed: Some feature pages are missing")
    console.log("\nTo fix:")
    console.log("  1. Create missing page files at the expected paths")
    console.log("  2. Or update features.config.ts to mark features as not ready")
    console.log("  3. Run 'pnpm run generate:manifest' to update manifest")
    console.log("  4. Run this validation again\n")
    process.exit(1)
  }

  console.log("\n✅ All feature pages validated successfully!\n")
}

main()
