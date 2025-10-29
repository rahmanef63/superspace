#!/usr/bin/env tsx
/**
 * Import Validation Script
 *
 * Purpose: Detect and prevent deep imports from shared domains
 * Enforces facade pattern usage
 *
 * Rules:
 * - ✅ Allowed: import { X } from '@/frontend/shared/builder'
 * - ❌ Blocked: import { X } from '@/frontend/shared/builder/canvas/core/...'
 *
 * Usage: pnpm tsx scripts/validate-imports.ts
 *        pnpm tsx scripts/validate-imports.ts --fix (auto-suggest fixes)
 */

import { readFileSync, readdirSync, statSync } from 'fs'
import { join, relative } from 'path'
import { glob } from 'glob'

interface Violation {
  file: string
  line: number
  import: string
  domain: string
  suggestion?: string
}

interface ValidationResult {
  passed: boolean
  violations: Violation[]
  filesScanned: number
  timestamp: string
}

class ImportValidator {
  private violations: Violation[] = []
  private filesScanned = 0

  // Regex patterns for detecting deep imports
  private deepImportPatterns = [
    // Matches: @/frontend/shared/builder/anything/...
    /@\/frontend\/shared\/(builder|settings|communications|ui|foundation)\/[^'"]+/g,
  ]

  // Allowed facade imports
  private facadePattern = /@\/frontend\/shared\/(builder|settings|communications|ui|foundation)$/

  async validate(fixMode: boolean = false): Promise<ValidationResult> {
    console.log('🔍 Validating import patterns...\n')
    console.log('='.repeat(60))
    console.log('')

    // Scan all TypeScript files in features
    const featureFiles = await glob('frontend/features/**/*.{ts,tsx}', {
      ignore: ['**/node_modules/**', '**/*.test.ts', '**/*.test.tsx']
    })

    // Also scan shared files (cross-domain imports)
    const sharedFiles = await glob('frontend/shared/**/*.{ts,tsx}', {
      ignore: ['**/node_modules/**', '**/*.test.ts', '**/*.test.tsx', '**/index.ts']
    })

    const allFiles = [...featureFiles, ...sharedFiles]

    console.log(`📁 Scanning ${allFiles.length} files...\n`)

    for (const file of allFiles) {
      this.scanFile(file)
    }

    this.printResults(fixMode)

    return {
      passed: this.violations.length === 0,
      violations: this.violations,
      filesScanned: this.filesScanned,
      timestamp: new Date().toISOString()
    }
  }

  private scanFile(filePath: string): void {
    this.filesScanned++

    try {
      const content = readFileSync(filePath, 'utf-8')
      const lines = content.split('\n')

      lines.forEach((line, index) => {
        // Check for deep imports
        for (const pattern of this.deepImportPatterns) {
          const matches = line.match(pattern)

          if (matches) {
            matches.forEach(importPath => {
              // Ignore if it's a facade import
              if (!this.facadePattern.test(importPath)) {
                // Extract domain
                const domainMatch = importPath.match(
                  /@\/frontend\/shared\/(\w+)/
                )
                const domain = domainMatch ? domainMatch[1] : 'unknown'

                // Create suggestion
                const suggestion = `@/frontend/shared/${domain}`

                this.violations.push({
                  file: filePath,
                  line: index + 1,
                  import: importPath,
                  domain,
                  suggestion
                })
              }
            })
          }
        }
      })
    } catch (error) {
      console.error(`⚠️  Error scanning ${filePath}:`, error)
    }
  }

  private printResults(fixMode: boolean): void {
    console.log('\n' + '='.repeat(60))
    console.log('\n📊 Import Validation Results\n')

    console.log(`📁 Files scanned: ${this.filesScanned}`)
    console.log(`❌ Violations found: ${this.violations.length}\n`)

    if (this.violations.length === 0) {
      console.log('✅ All imports use facade pattern!')
      console.log('🎉 No deep imports detected\n')
      return
    }

    // Group violations by domain
    const byDomain = this.groupByDomain(this.violations)

    console.log('⚠️  Deep Import Violations:\n')

    for (const [domain, violations] of Object.entries(byDomain)) {
      console.log(`\n📦 Domain: ${domain} (${violations.length} violations)`)
      console.log('-'.repeat(60))

      violations.forEach(v => {
        const relPath = relative(process.cwd(), v.file)
        console.log(`\n   File: ${relPath}:${v.line}`)
        console.log(`   ❌ Deep import: ${v.import}`)

        if (fixMode && v.suggestion) {
          console.log(`   ✅ Use instead:  ${v.suggestion}`)
        }
      })
    }

    console.log('\n' + '='.repeat(60))
    console.log('\n📚 Facade Import Pattern:\n')
    console.log('   ✅ Correct:   import { X } from "@/frontend/shared/builder"')
    console.log('   ❌ Incorrect: import { X } from "@/frontend/shared/builder/canvas/core/..."')
    console.log('')
    console.log('💡 Always import from domain facades, not internal paths!')
    console.log('')

    if (!fixMode) {
      console.log('ℹ️  Run with --fix flag to see suggested fixes\n')
    }
  }

  private groupByDomain(violations: Violation[]): Record<string, Violation[]> {
    const grouped: Record<string, Violation[]> = {}

    violations.forEach(v => {
      if (!grouped[v.domain]) {
        grouped[v.domain] = []
      }
      grouped[v.domain].push(v)
    })

    return grouped
  }
}

// Main execution
async function main() {
  const fixMode = process.argv.includes('--fix')

  const validator = new ImportValidator()
  const result = await validator.validate(fixMode)

  if (!result.passed) {
    console.error('❌ Import validation failed')
    console.error(`Found ${result.violations.length} deep import violations\n`)
    process.exit(1)
  }

  console.log('✅ Import validation passed\n')
}

main().catch(error => {
  console.error('❌ Import validation script failed:', error)
  process.exit(1)
})
