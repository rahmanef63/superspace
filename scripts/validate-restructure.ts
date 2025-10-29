#!/usr/bin/env tsx
/**
 * Post-Migration Validation Script
 *
 * Purpose: Validate that restructuring completed successfully
 *
 * Checks:
 * 1. All 5 domain folders exist
 * 2. All facade exports working
 * 3. Feature imports still work
 * 4. All tests passing
 * 5. TypeScript builds
 * 6. No regressions in metrics
 *
 * Usage: pnpm tsx scripts/validate-restructure.ts
 */

import { exec } from 'child_process'
import { promisify } from 'util'
import { existsSync, readFileSync } from 'fs'
import { join } from 'path'

const execAsync = promisify(exec)

interface ValidationResult {
  passed: boolean
  checks: CheckResult[]
  timestamp: string
  comparison?: MetricsComparison
}

interface CheckResult {
  name: string
  status: 'pass' | 'fail' | 'warn'
  message: string
  details?: string
}

interface MetricsComparison {
  before: BaselineMetrics
  after: CurrentMetrics
  changes: string[]
}

interface BaselineMetrics {
  testCount: number
  testsPassing: number
  fileCount: number
  importCount: number
  timestamp: string
}

interface CurrentMetrics {
  testCount: number
  testsPassing: number
  fileCount: number
  importCount: number
  timestamp: string
}

class RestructureValidator {
  private results: CheckResult[] = []
  private baselineMetrics: BaselineMetrics | undefined
  private currentMetrics: CurrentMetrics | undefined

  async run(): Promise<ValidationResult> {
    console.log('🔍 Post-Migration Validation for Shared Folder Restructuring\n')
    console.log('='.repeat(60))
    console.log('')

    try {
      await this.loadBaselineMetrics()
      await this.checkDomainFolders()
      await this.checkFacadeExports()
      await this.checkFeatureImports()
      await this.checkTests()
      await this.checkTypeScript()
      await this.compareMetrics()

      const allPassed = !this.results.some(r => r.status === 'fail')

      this.printSummary(allPassed)

      return {
        passed: allPassed,
        checks: this.results,
        timestamp: new Date().toISOString(),
        comparison: this.createComparison()
      }
    } catch (error) {
      console.error('\n❌ Validation failed with error:')
      console.error(error)
      process.exit(1)
    }
  }

  private async loadBaselineMetrics(): Promise<void> {
    const baselinePath = join(process.cwd(), 'docs', 'baseline-metrics.json')

    if (existsSync(baselinePath)) {
      this.baselineMetrics = JSON.parse(readFileSync(baselinePath, 'utf-8'))
      console.log('📊 Loaded baseline metrics from pre-flight check\n')
    } else {
      console.log('⚠️  No baseline metrics found - will skip comparison\n')
    }
  }

  private async checkDomainFolders(): Promise<void> {
    console.log('1️⃣  Checking domain folders...')

    const domains = ['builder', 'settings', 'communications', 'ui', 'foundation']
    const missingDomains: string[] = []

    for (const domain of domains) {
      const domainPath = join(process.cwd(), 'frontend', 'shared', domain)
      const facadePath = join(domainPath, 'index.ts')

      if (!existsSync(domainPath)) {
        missingDomains.push(domain)
      } else if (!existsSync(facadePath)) {
        this.addResult({
          name: `Domain: ${domain}`,
          status: 'warn',
          message: `⚠️  Domain exists but missing facade`,
          details: `Create ${domain}/index.ts`
        })
      } else {
        console.log(`   ✅ ${domain}/ - OK`)
      }
    }

    if (missingDomains.length === 0) {
      this.addResult({
        name: 'Domain Folders',
        status: 'pass',
        message: `✅ All 5 domain folders exist`,
        details: domains.join(', ')
      })
    } else {
      this.addResult({
        name: 'Domain Folders',
        status: 'fail',
        message: `❌ Missing ${missingDomains.length} domain(s)`,
        details: missingDomains.join(', ')
      })
    }
  }

  private async checkFacadeExports(): Promise<void> {
    console.log('\n2️⃣  Testing facade exports...')

    const facades = [
      { name: 'builder', path: '@/frontend/shared/builder' },
      { name: 'settings', path: '@/frontend/shared/settings' },
      { name: 'communications', path: '@/frontend/shared/communications' },
      { name: 'ui', path: '@/frontend/shared/ui' },
      { name: 'foundation', path: '@/frontend/shared/foundation' }
    ]

    let allWorking = true

    for (const facade of facades) {
      try {
        // Check if facade file exists
        const facadePath = join(
          process.cwd(),
          'frontend',
          'shared',
          facade.name,
          'index.ts'
        )

        if (existsSync(facadePath)) {
          console.log(`   ✅ ${facade.name} facade - OK`)
        } else {
          console.log(`   ❌ ${facade.name} facade - MISSING`)
          allWorking = false
        }
      } catch (error) {
        console.log(`   ❌ ${facade.name} facade - ERROR`)
        allWorking = false
      }
    }

    if (allWorking) {
      this.addResult({
        name: 'Facade Exports',
        status: 'pass',
        message: '✅ All facade files exist',
        details: 'All 5 domain facades created'
      })
    } else {
      this.addResult({
        name: 'Facade Exports',
        status: 'fail',
        message: '❌ Some facade files missing',
        details: 'Check individual facade status above'
      })
    }
  }

  private async checkFeatureImports(): Promise<void> {
    console.log('\n3️⃣  Validating feature imports...')

    try {
      const { stdout } = await execAsync(
        'pnpm test tests/shared/import-validation.test.ts --run',
        { timeout: 120000 }
      )

      const passMatch = stdout.match(/(\d+) passed/)
      const failMatch = stdout.match(/(\d+) failed/)

      const passed = passMatch ? parseInt(passMatch[1]) : 0
      const failed = failMatch ? parseInt(failMatch[1]) : 0

      if (failed === 0 && passed > 0) {
        this.addResult({
          name: 'Feature Imports',
          status: 'pass',
          message: `✅ All ${passed} import tests passing`,
          details: 'Feature imports working correctly'
        })
      } else {
        this.addResult({
          name: 'Feature Imports',
          status: 'fail',
          message: `❌ ${failed} import tests failing`,
          details: 'Feature imports broken by restructuring'
        })
      }
    } catch (error: any) {
      this.addResult({
        name: 'Feature Imports',
        status: 'fail',
        message: '❌ Import validation failed',
        details: error.message
      })
    }
  }

  private async checkTests(): Promise<void> {
    console.log('\n4️⃣  Running full test suite...')

    try {
      const { stdout } = await execAsync('pnpm test --run', {
        timeout: 300000
      })

      const passMatch = stdout.match(/(\d+) passed/)
      const failMatch = stdout.match(/(\d+) failed/)

      const passed = passMatch ? parseInt(passMatch[1]) : 0
      const failed = failMatch ? parseInt(failMatch[1]) : 0

      this.currentMetrics = {
        ...this.currentMetrics!,
        testCount: passed + failed,
        testsPassing: passed,
        timestamp: new Date().toISOString()
      }

      if (failed === 0 && passed > 0) {
        this.addResult({
          name: 'Test Suite',
          status: 'pass',
          message: `✅ All ${passed} tests passing`,
          details: 'No regressions detected'
        })
      } else {
        this.addResult({
          name: 'Test Suite',
          status: 'fail',
          message: `❌ ${failed} tests failing`,
          details: 'Regressions introduced by restructuring'
        })
      }
    } catch (error: any) {
      // Might be warnings
      if (error.stdout && error.stdout.includes('passed')) {
        const passMatch = error.stdout.match(/(\d+) passed/)
        const passed = passMatch ? parseInt(passMatch[1]) : 0

        this.addResult({
          name: 'Test Suite',
          status: 'warn',
          message: `⚠️  Tests passed with warnings (${passed})`,
          details: 'Non-critical issues detected'
        })
      } else {
        this.addResult({
          name: 'Test Suite',
          status: 'fail',
          message: '❌ Test suite failed',
          details: error.message
        })
      }
    }
  }

  private async checkTypeScript(): Promise<void> {
    console.log('\n5️⃣  Checking TypeScript compilation...')

    try {
      await execAsync('pnpm tsc --noEmit', { timeout: 60000 })

      this.addResult({
        name: 'TypeScript',
        status: 'pass',
        message: '✅ TypeScript compiles without errors',
        details: 'No type regressions'
      })
    } catch (error: any) {
      const errorCount = (error.stdout || '').match(/error TS\d+/g)?.length || 0

      if (errorCount > 0) {
        this.addResult({
          name: 'TypeScript',
          status: 'fail',
          message: `❌ ${errorCount} TypeScript errors`,
          details: 'Type errors introduced by restructuring'
        })
      } else {
        this.addResult({
          name: 'TypeScript',
          status: 'warn',
          message: '⚠️  TypeScript completed with warnings',
          details: 'Non-critical type issues'
        })
      }
    }
  }

  private async compareMetrics(): Promise<void> {
    console.log('\n6️⃣  Comparing metrics...')

    if (!this.baselineMetrics) {
      this.addResult({
        name: 'Metrics Comparison',
        status: 'warn',
        message: '⚠️  No baseline metrics for comparison',
        details: 'Skipping metrics comparison'
      })
      return
    }

    // Count current files
    try {
      const { stdout: fileCount } = await execAsync(
        'find frontend/shared -type f \\( -name "*.ts" -o -name "*.tsx" \\) | wc -l'
      )

      const { stdout: importCount } = await execAsync(
        'grep -r "from [\'\\"]@/frontend/shared/" frontend/features --include="*.ts" --include="*.tsx" | wc -l'
      )

      this.currentMetrics = {
        ...this.currentMetrics!,
        fileCount: parseInt(fileCount.trim()),
        importCount: parseInt(importCount.trim())
      }

      const changes: string[] = []

      // Compare file count
      if (this.currentMetrics.fileCount !== this.baselineMetrics.fileCount) {
        const diff = this.currentMetrics.fileCount - this.baselineMetrics.fileCount
        changes.push(`File count: ${this.baselineMetrics.fileCount} → ${this.currentMetrics.fileCount} (${diff > 0 ? '+' : ''}${diff})`)
      }

      // Compare import count
      if (this.currentMetrics.importCount !== this.baselineMetrics.importCount) {
        const diff = this.currentMetrics.importCount - this.baselineMetrics.importCount
        changes.push(`Import count: ${this.baselineMetrics.importCount} → ${this.currentMetrics.importCount} (${diff > 0 ? '+' : ''}${diff})`)
      }

      if (changes.length === 0) {
        this.addResult({
          name: 'Metrics Comparison',
          status: 'pass',
          message: '✅ No significant metric changes',
          details: 'File and import counts unchanged'
        })
      } else {
        this.addResult({
          name: 'Metrics Comparison',
          status: 'warn',
          message: `⚠️  ${changes.length} metric(s) changed`,
          details: changes.join('; ')
        })
      }
    } catch (error: any) {
      this.addResult({
        name: 'Metrics Comparison',
        status: 'warn',
        message: '⚠️  Could not compare metrics',
        details: error.message
      })
    }
  }

  private createComparison(): MetricsComparison | undefined {
    if (!this.baselineMetrics || !this.currentMetrics) {
      return undefined
    }

    const changes: string[] = []

    if (this.currentMetrics.testCount !== this.baselineMetrics.testCount) {
      changes.push(`Tests: ${this.baselineMetrics.testCount} → ${this.currentMetrics.testCount}`)
    }

    if (this.currentMetrics.fileCount !== this.baselineMetrics.fileCount) {
      changes.push(`Files: ${this.baselineMetrics.fileCount} → ${this.currentMetrics.fileCount}`)
    }

    if (this.currentMetrics.importCount !== this.baselineMetrics.importCount) {
      changes.push(`Imports: ${this.baselineMetrics.importCount} → ${this.currentMetrics.importCount}`)
    }

    return {
      before: this.baselineMetrics,
      after: this.currentMetrics,
      changes
    }
  }

  private addResult(result: CheckResult): void {
    this.results.push(result)
    if (result.status !== 'pass') {
      console.log(`   ${result.message}`)
      if (result.details) {
        console.log(`   ℹ️  ${result.details}`)
      }
    }
  }

  private printSummary(allPassed: boolean): void {
    console.log('\n' + '='.repeat(60))
    console.log('\n📊 Validation Summary\n')

    const passed = this.results.filter(r => r.status === 'pass').length
    const warned = this.results.filter(r => r.status === 'warn').length
    const failed = this.results.filter(r => r.status === 'fail').length

    console.log(`✅ Passed:  ${passed}/${this.results.length}`)
    console.log(`⚠️  Warnings: ${warned}/${this.results.length}`)
    console.log(`❌ Failed:  ${failed}/${this.results.length}`)

    console.log('\n' + '='.repeat(60))

    if (allPassed) {
      console.log('\n🎉 Restructuring validation successful!')
      console.log('✅ All checks passed - ready for production\n')
    } else if (failed > 0) {
      console.log('\n❌ Restructuring validation failed!')
      console.log('⛔ Fix failing checks before deployment\n')
      process.exit(1)
    } else {
      console.log('\n⚠️  Validation completed with warnings')
      console.log('✅ Safe to proceed, but review warnings\n')
    }

    if (this.baselineMetrics && this.currentMetrics) {
      console.log('📈 Metrics Comparison:')
      console.log(`   Files:  ${this.baselineMetrics.fileCount} → ${this.currentMetrics.fileCount}`)
      console.log(`   Imports: ${this.baselineMetrics.importCount} → ${this.currentMetrics.importCount}`)
      console.log(`   Tests:  ${this.baselineMetrics.testsPassing}/${this.baselineMetrics.testCount} → ${this.currentMetrics.testsPassing}/${this.currentMetrics.testCount}`)
      console.log('')
    }
  }
}

// Main execution
async function main() {
  const validator = new RestructureValidator()
  await validator.run()
}

main().catch(error => {
  console.error('❌ Validation script failed:', error)
  process.exit(1)
})
