/**
 * Test New Feature Registry System
 *
 * This script tests the new auto-discovery feature registry
 * and compares it with the old features.config.ts system.
 */

import {
  getAllFeatures,
  getFeatureById,
  getFeaturesByCategory,
  getFeaturesByType,
  validateRegistry,
  DISCOVERED_FEATURES,
} from '../../lib/features/registry.server'

console.log('🧪 Testing New Feature Registry System\n')
console.log('='.repeat(60))

// ============================================================================
// TEST 1: Auto-Discovery
// ============================================================================

console.log('\n📦 TEST 1: Auto-Discovery')
console.log('-'.repeat(60))

const allFeatures = getAllFeatures()
console.log(`✅ Discovered ${allFeatures.length} features:`)
allFeatures.forEach(f => {
  console.log(`   - ${f.id} (${f.name})`)
  if (f.children) {
    f.children.forEach(c => {
      console.log(`     └─ ${c.id} (${c.name})`)
    })
  }
})

// ============================================================================
// TEST 2: Validation
// ============================================================================

console.log('\n✅ TEST 2: Validation')
console.log('-'.repeat(60))

const validation = validateRegistry()
if (validation.valid) {
  console.log('✅ All features valid - no duplicates or conflicts')
} else {
  console.log('❌ Validation errors:')
  validation.errors.forEach(err => console.log(`   - ${err}`))
}

// ============================================================================
// TEST 3: Query API
// ============================================================================

console.log('\n🔍 TEST 3: Query API')
console.log('-'.repeat(60))

// Get by ID
const cms = getFeatureById('cms')
console.log(`Get by ID ('cms'): ${cms ? '✅ Found' : '❌ Not found'}`)
if (cms) {
  console.log(`   Name: ${cms.name}`)
  console.log(`   Path: ${cms.ui.path}`)
  console.log(`   Children: ${cms.children?.length || 0}`)
}

// Get by category
const creativityFeatures = getFeaturesByCategory('creativity')
console.log(`\nGet by category ('creativity'): Found ${creativityFeatures.length}`)
creativityFeatures.forEach(f => {
  console.log(`   - ${f.name}`)
})

// Get by type
const optionalFeatures = getFeaturesByType('optional')
console.log(`\nGet by type ('optional'): Found ${optionalFeatures.length}`)

// ============================================================================
// TEST 4: Feature Type Breakdown
// ============================================================================

console.log('\n TEST 4: Feature Type Breakdown')
console.log('-'.repeat(60))

const allDefault = getFeaturesByType('default')
const allSystem = getFeaturesByType('system')
const allOptional = getFeaturesByType('optional')
const allExperimental = getFeaturesByType('experimental')

console.log(`✅ Default: ${allDefault.length}`)
console.log(`✅ System: ${allSystem.length}`)
console.log(`✅ Optional: ${allOptional.length}`)
console.log(`✅ Experimental: ${allExperimental.length}`)
console.log(`✅ Total: ${allFeatures.length}`)

// ============================================================================
// TEST 5: Feature Details
// ============================================================================

console.log('\n📝 TEST 5: Feature Details')
console.log('-'.repeat(60))

DISCOVERED_FEATURES.forEach(feature => {
  console.log(`\n${feature.name} (${feature.id})`)
  console.log(`  Category: ${feature.ui.category}`)
  console.log(`  Type: ${feature.technical.featureType}`)
  console.log(`  Status: ${feature.status.state} (ready: ${feature.status.isReady})`)
  console.log(`  Path: ${feature.ui.path}`)
  console.log(`  Permissions: ${feature.permissions?.length || 0}`)
  console.log(`  Tags: ${feature.tags?.join(', ') || 'none'}`)
})

// ============================================================================
// SUMMARY
// ============================================================================

console.log('\n' + '='.repeat(60))
console.log(' SUMMARY')
console.log('='.repeat(60))

const readyCount = DISCOVERED_FEATURES.filter(f => f.status.isReady).length
const totalChildren = DISCOVERED_FEATURES.reduce(
  (sum, f) => sum + (f.children?.length || 0),
  0
)

console.log(`Total Features: ${DISCOVERED_FEATURES.length}`)
console.log(`Ready Features: ${readyCount}/${DISCOVERED_FEATURES.length}`)
console.log(`Total Child Routes: ${totalChildren}`)
console.log(`Validation: ${validation.valid ? '✅ PASS' : '❌ FAIL'}`)

// ============================================================================
// COMPARISON WITH OLD SYSTEM
// ============================================================================

console.log('\n' + '='.repeat(60))
console.log(' COMPARISON: New vs Old System')
console.log('='.repeat(60))

console.log('\n🆕 NEW SYSTEM (Auto-Discovery):')
console.log('   ✅ Zero config outside feature folders')
console.log('   ✅ Type-safe with Zod validation')
console.log('   ✅ Auto-discovers new features')
console.log('   ✅ Single source of truth per feature')
console.log(`   📦 Features discovered: ${DISCOVERED_FEATURES.length}`)

console.log('\n🗄️  OLD SYSTEM (features.config.ts):')
console.log('   ❌ Manual editing required (771 lines)')
console.log('   ❌ Hard-coded feature data')
console.log('   ❌ Duplication with manifests')
console.log('   ❌ Easy to forget to update')

console.log('\n' + '='.repeat(60))
console.log('✅ Test Complete!')
console.log('='.repeat(60))
