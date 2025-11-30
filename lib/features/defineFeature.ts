/**
 * Feature Definition Helper
 *
 * Use this to define features in a type-safe, validated way.
 * Each feature should have a config.ts that uses this helper.
 */

import { z } from 'zod'

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
 *   tags: ['builder', 'content', 'automation', 'visual'],
 * })
 * ```
 */
export function defineFeature(config: FeatureConfig): FeatureConfig {
  // Validate at definition time
  const validated = FeatureConfigSchema.parse(config)

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
export type { FeatureConfig }
