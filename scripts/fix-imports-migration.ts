#!/usr/bin/env tsx
/**
 * Import Path Migration Script
 *
 * Fixes all broken imports after shared folder restructuring
 *
 * Old → New mappings:
 * - @/frontend/shared/foundation/auth → @/frontend/shared/foundation/auth
 * - @/frontend/shared/foundation/hooks → @/frontend/shared/foundation/hooks
 * - @/frontend/shared/foundation/utils → @/frontend/shared/foundation/utils
 * - @/frontend/shared/foundation/types → @/frontend/shared/foundation/types
 * - @/frontend/shared/foundation/manifest → @/frontend/shared/foundation/manifest
 * - @/frontend/shared/foundation/registry → @/frontend/shared/foundation/registry
 * - @/frontend/shared/builder/canvas → @/frontend/shared/builder/canvas
 * - @/frontend/shared/builder/blocks → @/frontend/shared/builder/blocks
 * - @/frontend/shared/builder/elements → @/frontend/shared/builder/elements
 * - @/frontend/shared/builder/sections → @/frontend/shared/builder/sections
 * - @/frontend/shared/builder/templates → @/frontend/shared/builder/templates
 * - @/frontend/shared/builder/flows → @/frontend/shared/builder/flows
 * - @/frontend/shared/builder/inspector → @/frontend/shared/builder/inspector
 * - @/frontend/shared/builder/library → @/frontend/shared/builder/library
 * - @/frontend/shared/communications/chat → @/frontend/shared/communications/chat
 * - @/frontend/shared/communications/comments → @/frontend/shared/communications/comments
 * - @/frontend/shared/communications/collaboration → @/frontend/shared/communications/collaboration
 * - @/frontend/shared/ui/components → @/frontend/shared/ui/components
 * - @/frontend/shared/ui/icons → @/frontend/shared/ui/icons
 * - @/frontend/shared/ui/layout → @/frontend/shared/ui/layout
 */

import { readFileSync, writeFileSync } from 'fs'
import { glob } from 'glob'

interface ImportMapping {
  old: string
  new: string
  priority: number // Higher priority = replace first (to avoid partial replacements)
}

const importMappings: ImportMapping[] = [
  // Builder domain (canvas, inspector, library first - most specific)
  { old: '@/frontend/shared/builder/inspector', new: '@/frontend/shared/builder/inspector', priority: 10 },
  { old: '@/frontend/shared/builder/library', new: '@/frontend/shared/builder/library', priority: 10 },
  { old: '@/frontend/shared/builder/canvas', new: '@/frontend/shared/builder/canvas', priority: 5 },
  { old: '@/frontend/shared/builder/blocks', new: '@/frontend/shared/builder/blocks', priority: 5 },
  { old: '@/frontend/shared/builder/elements', new: '@/frontend/shared/builder/elements', priority: 5 },
  { old: '@/frontend/shared/builder/sections', new: '@/frontend/shared/builder/sections', priority: 5 },
  { old: '@/frontend/shared/builder/templates', new: '@/frontend/shared/builder/templates', priority: 5 },
  { old: '@/frontend/shared/builder/flows', new: '@/frontend/shared/builder/flows', priority: 5 },

  // Foundation domain
  { old: '@/frontend/shared/foundation/auth', new: '@/frontend/shared/foundation/auth', priority: 5 },
  { old: '@/frontend/shared/foundation/hooks', new: '@/frontend/shared/foundation/hooks', priority: 5 },
  { old: '@/frontend/shared/foundation/utils', new: '@/frontend/shared/foundation/utils', priority: 5 },
  { old: '@/frontend/shared/foundation/types', new: '@/frontend/shared/foundation/types', priority: 5 },
  { old: '@/frontend/shared/foundation/manifest', new: '@/frontend/shared/foundation/manifest', priority: 5 },
  { old: '@/frontend/shared/foundation/registry', new: '@/frontend/shared/foundation/registry', priority: 5 },

  // Communications domain
  { old: '@/frontend/shared/communications/collaboration', new: '@/frontend/shared/communications/collaboration', priority: 10 },
  { old: '@/frontend/shared/communications/comments', new: '@/frontend/shared/communications/comments', priority: 10 },
  { old: '@/frontend/shared/communications/chat', new: '@/frontend/shared/communications/chat', priority: 5 },

  // UI domain (must be last - most generic)
  { old: '@/frontend/shared/ui/layout', new: '@/frontend/shared/ui/layout', priority: 5 },
  { old: '@/frontend/shared/ui/icons', new: '@/frontend/shared/ui/icons', priority: 5 },
  { old: '@/frontend/shared/ui/components', new: '@/frontend/shared/ui/components', priority: 1 }, // Lowest priority (catch-all)

  // Relative path patterns (for features)
  { old: '@/frontend/shared/foundation/utils', new: '@/frontend/shared/foundation/utils', priority: 5 },
  { old: '@/frontend/shared/foundation/utils', new: '@/frontend/shared/foundation/utils', priority: 5 },
  { old: '@/frontend/shared/foundation/types', new: '@/frontend/shared/foundation/types', priority: 5 },
  { old: '@/frontend/shared/foundation/types', new: '@/frontend/shared/foundation/types', priority: 5 },
  { old: '@/frontend/shared/foundation/hooks', new: '@/frontend/shared/foundation/hooks', priority: 5 },
  { old: '@/frontend/shared/builder/canvas', new: '@/frontend/shared/builder/canvas', priority: 5 },
  { old: '@/frontend/shared/builder/inspector', new: '@/frontend/shared/builder/inspector', priority: 10 },
  { old: '@/frontend/shared/builder/library', new: '@/frontend/shared/builder/library', priority: 10 },
  { old: '@/frontend/shared/ui/components/ui', new: '@/frontend/shared/ui/components/ui', priority: 10 },
  { old: '@/frontend/shared/ui/components', new: '@/frontend/shared/ui/components', priority: 5 },
  { old: '@/frontend/shared/communications/chat', new: '@/frontend/shared/communications/chat', priority: 5 },
  { old: '@/frontend/shared/communications/chat', new: '@/frontend/shared/communications/chat', priority: 5 },
  { old: '@/frontend/shared/foundation/registry', new: '@/frontend/shared/foundation/registry', priority: 5 },
  { old: '@/frontend/shared/foundation/registry', new: '@/frontend/shared/foundation/registry', priority: 5 },
]

async function fixImports() {
  console.log('🔧 Fixing import paths after restructuring...\n')

  // Sort by priority (highest first)
  const sortedMappings = [...importMappings].sort((a, b) => b.priority - a.priority)

  // Find all TypeScript/TSX files
  const files = await glob('**/*.{ts,tsx}', {
    ignore: ['node_modules/**', '.next/**', 'dist/**', 'build/**']
  })

  console.log(`📁 Found ${files.length} files to check\n`)

  let totalReplacements = 0
  let filesModified = 0

  for (const file of files) {
    try {
      let content = readFileSync(file, 'utf-8')
      let modified = false
      let fileReplacements = 0

      // Apply all mappings in priority order
      for (const mapping of sortedMappings) {
        const regex = new RegExp(mapping.old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')
        const matches = content.match(regex)

        if (matches) {
          content = content.replace(regex, mapping.new)
          modified = true
          fileReplacements += matches.length
        }
      }

      if (modified) {
        writeFileSync(file, content, 'utf-8')
        filesModified++
        totalReplacements += fileReplacements
        console.log(`✅ ${file} (${fileReplacements} replacements)`)
      }
    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error)
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log(`\n✨ Migration Complete!\n`)
  console.log(`📊 Statistics:`)
  console.log(`   - Files scanned: ${files.length}`)
  console.log(`   - Files modified: ${filesModified}`)
  console.log(`   - Total replacements: ${totalReplacements}`)
  console.log('')
}

fixImports().catch(error => {
  console.error('❌ Migration failed:', error)
  process.exit(1)
})
