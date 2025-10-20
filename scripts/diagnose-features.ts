#!/usr/bin/env node
/**
 * Feature Diagnostic Script
 *
 * Compares working vs broken features to identify issues
 */

import { existsSync, readFileSync } from "fs"
import { join } from "path"
import { FEATURES_REGISTRY } from "../features.config"

const rootDir = process.cwd()

interface DiagnosticResult {
  slug: string
  name: string
  component: string
  featureType: string
  expectedPath: string
  pageExists: boolean
  manifestPath?: string
  manifestExists?: boolean
  status: "working" | "broken" | "unknown"
  issues: string[]
}

// Known working features from user report
const KNOWN_WORKING = new Set([
  "overview",
  "chats",
  "members",
  "friends",
  "profile",
  "documents",
  "menus",
  "invitations",
  "workspace-settings"
])

function getExpectedPagePath(slug: string, component: string): string {
  // Check various possible locations
  const possiblePaths = [
    `frontend/features/${slug}/page.tsx`,
    `frontend/views/static/${slug}/page.tsx`,
    `frontend/views/dynamic/${slug}/page.tsx`,
  ]

  for (const path of possiblePaths) {
    if (existsSync(join(rootDir, path))) {
      return path
    }
  }

  // Return most likely path
  return `frontend/features/${slug}/page.tsx`
}

function getManifestPath(component: string): string {
  const manifestFile = join(rootDir, "frontend/views/manifest.tsx")
  if (!existsSync(manifestFile)) return ""

  const content = readFileSync(manifestFile, "utf-8")
  const regex = new RegExp(`component:\\s*lazy\\(\\(\\)\\s*=>\\s*import\\("([^"]+)"\\)\\)`, 'g')

  let match
  while ((match = regex.exec(content)) !== null) {
    if (match[0].includes(component)) {
      return match[1]
    }
  }

  return ""
}

function diagnoseFeature(feature: typeof FEATURES_REGISTRY[0]): DiagnosticResult {
  const expectedPath = getExpectedPagePath(feature.slug, feature.component)
  const pageExists = existsSync(join(rootDir, expectedPath))
  const manifestPath = getManifestPath(feature.component)
  const manifestExists = manifestPath ? existsSync(join(rootDir, manifestPath)) : false

  const issues: string[] = []

  if (!pageExists) {
    issues.push(`Page file missing at ${expectedPath}`)
  }

  if (!manifestPath) {
    issues.push(`Component ${feature.component} not found in manifest`)
  } else if (!manifestExists) {
    issues.push(`Manifest points to non-existent file: ${manifestPath}`)
  } else if (manifestPath !== expectedPath) {
    issues.push(`Manifest path mismatch: manifest=${manifestPath}, expected=${expectedPath}`)
  }

  let status: "working" | "broken" | "unknown" = "unknown"
  if (KNOWN_WORKING.has(feature.slug)) {
    status = "working"
  } else if (issues.length > 0) {
    status = "broken"
  }

  return {
    slug: feature.slug,
    name: feature.name,
    component: feature.component,
    featureType: feature.featureType,
    expectedPath,
    pageExists,
    manifestPath,
    manifestExists,
    status,
    issues
  }
}

function generateReport(results: DiagnosticResult[]) {
  console.log("\n" + "=".repeat(80))
  console.log("🔍 FEATURE DIAGNOSTIC REPORT")
  console.log("=".repeat(80))

  const working = results.filter(r => r.status === "working")
  const broken = results.filter(r => r.status === "broken")
  const unknown = results.filter(r => r.status === "unknown")

  console.log(`\n✅ Working: ${working.length}`)
  console.log(`❌ Broken: ${broken.length}`)
  console.log(`❓ Unknown: ${unknown.length}`)
  console.log(`📊 Total: ${results.length}`)

  // Analyze working features to find patterns
  console.log("\n" + "=".repeat(80))
  console.log("✅ WORKING FEATURES - PATTERNS")
  console.log("=".repeat(80))

  const workingPaths = new Set<string>()
  working.forEach(w => {
    const pathPattern = w.expectedPath.split('/').slice(0, -1).join('/')
    workingPaths.add(pathPattern)
  })

  console.log("\nWorking page locations:")
  workingPaths.forEach(path => {
    const count = working.filter(w => w.expectedPath.startsWith(path)).length
    console.log(`  ${path}/ (${count} features)`)
  })

  console.log("\nWorking features:")
  working.forEach(w => {
    console.log(`  ✅ ${w.name} (${w.slug})`)
    console.log(`     Path: ${w.expectedPath}`)
    console.log(`     Manifest: ${w.manifestPath || "N/A"}`)
  })

  // Show broken features with details
  console.log("\n" + "=".repeat(80))
  console.log("❌ BROKEN FEATURES - ISSUES")
  console.log("=".repeat(80))

  broken.forEach(b => {
    console.log(`\n  ❌ ${b.name} (${b.slug})`)
    console.log(`     Component: ${b.component}`)
    console.log(`     Expected: ${b.expectedPath} [${b.pageExists ? "EXISTS" : "MISSING"}]`)
    console.log(`     Manifest: ${b.manifestPath || "NOT FOUND"} [${b.manifestExists ? "EXISTS" : "MISSING"}]`)
    console.log(`     Issues:`)
    b.issues.forEach(issue => {
      console.log(`       - ${issue}`)
    })
  })

  // Group issues by type
  console.log("\n" + "=".repeat(80))
  console.log("📋 ISSUES SUMMARY")
  console.log("=".repeat(80))

  const issueTypes = new Map<string, number>()
  broken.forEach(b => {
    b.issues.forEach(issue => {
      const type = issue.split(':')[0]
      issueTypes.set(type, (issueTypes.get(type) || 0) + 1)
    })
  })

  issueTypes.forEach((count, type) => {
    console.log(`  ${count}x ${type}`)
  })

  // Recommendations
  console.log("\n" + "=".repeat(80))
  console.log("💡 RECOMMENDATIONS")
  console.log("=".repeat(80))

  const missingPages = broken.filter(b => !b.pageExists)
  const manifestIssues = broken.filter(b => b.manifestPath && !b.manifestExists)
  const notInManifest = broken.filter(b => !b.manifestPath)

  if (missingPages.length > 0) {
    console.log(`\n1. Create ${missingPages.length} missing page files:`)
    missingPages.forEach(b => {
      console.log(`   mkdir -p $(dirname ${b.expectedPath}) && touch ${b.expectedPath}`)
    })
  }

  if (notInManifest.length > 0) {
    console.log(`\n2. Regenerate manifest to include ${notInManifest.length} missing components:`)
    console.log(`   pnpm run generate:manifest`)
  }

  if (manifestIssues.length > 0) {
    console.log(`\n3. Fix ${manifestIssues.length} incorrect manifest paths:`)
    console.log(`   pnpm run generate:manifest`)
  }

  console.log("\n" + "=".repeat(80))

  return broken.length === 0
}

function main() {
  console.log("🚀 Starting feature diagnostic...\n")

  const results = FEATURES_REGISTRY.map(diagnoseFeature)
  const success = generateReport(results)

  if (!success) {
    console.log("\n❌ Issues found. Follow recommendations above to fix.\n")
    process.exit(1)
  }

  console.log("\n✅ All features validated successfully!\n")
}

main()
