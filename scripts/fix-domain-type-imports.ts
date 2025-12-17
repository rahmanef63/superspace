#!/usr/bin/env tsx
/**
 * Fix Cross-Domain Type Imports
 *
 * Fixes relative type imports that now cross domain boundaries
 * after restructuring shared folder into domains.
 */

import { readFileSync, writeFileSync } from 'fs'
import { glob } from 'glob'

interface TypeImportFix {
  pattern: RegExp
  replacement: string
  domains: string[]
}

// Patterns to fix relative type imports crossing domain boundaries
const typeImportFixes: TypeImportFix[] = [
  // Builder domain: ../types or ../../types → @/frontend/shared/foundation
  {
    pattern: /from\s+["']\.\.\/types["']/g,
    replacement: 'from "@/frontend/shared/foundation"',
    domains: ['builder/elements', 'builder/flows', 'builder/sections', 'builder/templates']
  },
  {
    pattern: /from\s+["']\.\.\/\.\.\/types["']/g,
    replacement: 'from "@/frontend/shared/foundation"',
    domains: ['builder/elements', 'builder/sections', 'builder/blocks']
  },

  // UI domain: ../../types → @/frontend/shared/foundation
  {
    pattern: /from\s+["']\.\.\/\.\.\/\.\.\/types["']/g,
    replacement: 'from "@/frontend/shared/foundation"',
    domains: ['ui/components']
  },

  // Settings domain: ../types → @/frontend/shared/settings (within settings)
  // This is OK, no fix needed for intra-domain imports

  // Foundation domain: ../types → relative within foundation is OK
  // But fix utils subdirs: ../../types → ../types (within foundation)
  {
    pattern: /from\s+["']\.\.\/\.\.\/types["']/g,
    replacement: 'from "../types"',
    domains: ['foundation/utils']
  },
  {
    pattern: /from\s+["']\.\.\/\.\.\/\.\.\/types["']/g,
    replacement: 'from "../../types"',
    domains: ['foundation/utils']
  },

  // Registry imports: ../registry → @/frontend/shared/foundation
  {
    pattern: /from\s+["']\.\.\/registry["']/g,
    replacement: 'from "@/frontend/shared/foundation"',
    domains: ['builder', 'ui']
  },
  {
    pattern: /from\s+["']\.\.\/\.\.\/registry["']/g,
    replacement: 'from "@/frontend/shared/foundation"',
    domains: ['builder', 'ui']
  },
]

async function fixDomainTypeImports() {


  let totalReplacements = 0
  let filesModified = 0

  for (const fix of typeImportFixes) {
    for (const domain of fix.domains) {
      const pattern = `frontend/shared/${domain}/**/*.{ts,tsx}`
      const files = await glob(pattern, {
        ignore: ['**/*.test.ts', '**/*.test.tsx']
      })



      for (const file of files) {
        try {
          let content = readFileSync(file, 'utf-8')
          const matches = content.match(fix.pattern)

          if (matches) {
            content = content.replace(fix.pattern, fix.replacement)
            writeFileSync(file, content, 'utf-8')
            filesModified++
            totalReplacements += matches.length

          }
        } catch (error) {
          console.error(`  ❌ Error processing ${file}:`, error)
        }
      }
    }
  }


}

fixDomainTypeImports().catch(error => {
  console.error('❌ Fix failed:', error)
  process.exit(1)
})
