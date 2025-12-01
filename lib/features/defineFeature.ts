/**
 * Feature Definition Helper
 *
 * Use this to define features in a type-safe, validated way.
 * Each feature should have a config.ts that uses this helper.
 */

import { z } from 'zod'

// ============================================================================
// BUNDLE IDS - All available workspace bundle templates
// ============================================================================

/**
 * Available Bundle IDs
 * Features declare which bundles they belong to via `bundles` config
 */
export const BUNDLE_IDS = [
  // Business
  'startup',
  'business-pro',
  'sales-crm',
  // Productivity
  'project-management',
  'knowledge-base',
  // Personal
  'personal-minimal',
  'personal-productivity',
  'family',
  // Creative
  'content-creator',
  'digital-agency',
  // Education
  'education',
  // Community
  'community',
  // Special
  'custom', // All optional features available
] as const

export type BundleId = typeof BUNDLE_IDS[number]

// ============================================================================
// SCHEMA
// ============================================================================

const UIConfigSchema = z.object({
  icon: z.string(),
  path: z.string().startsWith('/'),
  component: z.string(),
  category: z.enum([
    'communication',
    'productivity',
    'collaboration',
    'administration',
    'social',
    'creativity',
    'analytics',
    'content'
  ]),
  order: z.number().min(0),
})

const TechnicalConfigSchema = z.object({
  featureType: z.enum(['default', 'system', 'optional', 'experimental']),
  hasUI: z.boolean().default(true),
  hasConvex: z.boolean().default(true),
  hasTests: z.boolean().default(true),
  version: z.string().regex(/^\d+\.\d+\.\d+$/), // semver
})

const StatusConfigSchema = z.object({
  state: z.enum(['stable', 'beta', 'development', 'experimental', 'deprecated']),
  isReady: z.boolean(),
  expectedRelease: z.string().optional(),
})

/**
 * Bundle Configuration Schema
 * 
 * Each feature declares which bundles it belongs to and its role in each bundle:
 * - core: Feature is always enabled and cannot be disabled
 * - recommended: Feature is enabled by default but can be disabled
 * - optional: Feature is disabled by default but can be enabled
 */
const BundleConfigSchema = z.object({
  // Bundles where this feature is CORE (cannot be disabled)
  core: z.array(z.enum(BUNDLE_IDS)).default([]),
  // Bundles where this feature is RECOMMENDED (enabled by default)
  recommended: z.array(z.enum(BUNDLE_IDS)).default([]),
  // Bundles where this feature is OPTIONAL (disabled by default)
  optional: z.array(z.enum(BUNDLE_IDS)).default([]),
}).optional()

// Base schema without children
const BaseFeatureConfigSchema = z.object({
  // Identity
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  description: z.string(),

  // Configurations
  ui: UIConfigSchema,
  technical: TechnicalConfigSchema,
  status: StatusConfigSchema,

  // Bundle membership - REQUIRED for non-system features
  bundles: BundleConfigSchema,

  // Optional metadata
  tags: z.array(z.string()).optional(),
  permissions: z.array(z.string()).optional(),
  dependencies: z.array(z.string()).optional(),
  author: z.string().optional(),

  // Settings integration
  hasSettings: z.boolean().optional(),
  settingsPath: z.string().optional(),
})

// Recursive type for children
export type FeatureConfig = z.infer<typeof BaseFeatureConfigSchema> & {
  children?: FeatureConfig[]
}

const FeatureConfigSchema: z.ZodType<FeatureConfig> = BaseFeatureConfigSchema.extend({
  children: z.lazy(() => z.array(FeatureConfigSchema)).optional(),
})

// ============================================================================
// HELPER FUNCTION
// ============================================================================

/**
 * Define a feature with validation
 *
 * @example
 * ```ts
 * export default defineFeature({
 *   id: 'builder',
 *   name: 'Builder',
 *   description: 'Create content, automation, and interfaces with visual node canvas',
 *   ui: {
 *     icon: 'Hammer',
 *     path: '/dashboard/builder',
 *     component: 'BuilderPage',
 *     category: 'creativity',
 *     order: 20,
 *   },
 *   technical: {
 *     featureType: 'optional',
 *     hasUI: true,
 *     hasConvex: true,
 *     hasTests: true,
 *     version: '1.0.0',
 *   },
 *   status: {
 *     state: 'stable',
 *     isReady: true,
 *   },
 *   bundles: {
 *     core: [],
 *     recommended: ['content-creator', 'digital-agency'],
 *     optional: ['startup', 'business-pro', 'personal-productivity'],
 *   },
 *   tags: ['builder', 'content', 'automation', 'visual'],
 * })
 * ```
 */
export function defineFeature(config: FeatureConfig): FeatureConfig {
  // Validate at definition time
  const validated = FeatureConfigSchema.parse(config)

  // Warn if non-system feature has no bundle configuration
  if (
    validated.technical.featureType !== 'system' &&
    (!validated.bundles || 
      (validated.bundles.core.length === 0 && 
       validated.bundles.recommended.length === 0 && 
       validated.bundles.optional.length === 0))
  ) {
    console.warn(
      `[defineFeature] Feature "${validated.id}" has no bundle configuration. ` +
      `It won't appear in any workspace template.`
    )
  }

  return validated
}

/**
 * Type guard to check if something is a valid feature config
 */
export function isFeatureConfig(value: unknown): value is FeatureConfig {
  return FeatureConfigSchema.safeParse(value).success
}

// ============================================================================
// EXPORTS
// ============================================================================

export { FeatureConfigSchema }
