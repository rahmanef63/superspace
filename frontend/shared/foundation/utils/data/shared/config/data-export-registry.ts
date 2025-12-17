/**
 * Data Export/Import Registry
 * Auto-discovery system for feature export/import configurations
 */

import type {
  FeatureExportConfig,
  ExportFormat,
} from "../types/data-export-types"

// ============================================================================
// Registry Implementation
// ============================================================================

class DataExportRegistry {
  private configs = new Map<string, FeatureExportConfig>()
  private initialized = false

  private registerNormalized(featureId: string, featureName: string, config: FeatureExportConfig) {
    this.configs.set(featureId, {
      ...config,
      featureId,
      featureName,
    })
  }

  private async loadConfigModule(exportConfigPath: string): Promise<FeatureExportConfig | null> {
    const importers: Record<string, () => Promise<any>> = {
      "features/documents/data/export-config": () => import("@/frontend/features/documents/data/export-config"),
      "features/tasks/data/export-config": () => import("@/frontend/features/tasks/data/export-config"),
      // Template path (kept for future use)
      "features/_templates/data/export-config": () => import("@/frontend/features/_templates/data/export-config"),
    }

    const importer = importers[exportConfigPath]
    if (!importer) {
      return null
    }

    const mod = await importer()
    return (mod?.exportConfig ?? mod?.default ?? null) as FeatureExportConfig | null
  }

  // Initialize registry with auto-discovered configs
  async initialize(): Promise<void> {
    if (this.initialized) return

    try {
      // 1) Manually register knowledge sub-features (not yet included in lib/features/registry.ts)

      // Register knowledge/docs feature
      try {
        const docsExportConfig = await this.loadConfigModule("features/documents/data/export-config")
        if (docsExportConfig) {
          this.registerNormalized("knowledge/docs", "Documents", docsExportConfig)
          this.registerNormalized("knowledge/articles", "Knowledge Base", docsExportConfig)
          console.log("Registered export config for knowledge/docs and knowledge/articles")
        }
      } catch (error) {
        console.error("Failed to load knowledge/docs export config:", error)
      }

      // 2) Auto-register top-level features that declare export/import in the feature registry
      try {
        const { getAllFeatures } = await import("@/lib/features/registry")
        type FeatureNode = {
          id: string
          name: string
          hasExportImport?: boolean
          exportConfigPath?: string
          children?: FeatureNode[]
        }

        const flatten = (features: FeatureNode[]): FeatureNode[] =>
          features.flatMap((feature) => [feature, ...(feature.children ? flatten(feature.children) : [])])

        const features = flatten(getAllFeatures() as FeatureNode[])
        const exportable = features.filter((feature) => feature.hasExportImport && feature.exportConfigPath)

        await Promise.all(
          exportable.map(async (feature) => {
            const exportConfigPath = feature.exportConfigPath!
            const config = await this.loadConfigModule(exportConfigPath)
            if (!config) {
              console.warn(
                `No importer registered for exportConfigPath="${exportConfigPath}" (featureId="${feature.id}")`
              )
              return
            }

            this.registerNormalized(feature.id, feature.name, config)
            console.log(`Registered export config for ${feature.id}`)
          })
        )
      } catch (error) {
        console.error("Failed to auto-register export configs from feature registry:", error)
      }

      this.initialized = true
      console.log(`DataExportRegistry initialized with ${this.configs.size} features`)
    } catch (error) {
      console.error("Failed to initialize DataExportRegistry:", error)
    }
  }

  // Get export config for a feature
  async getExportConfig(featureId: string): Promise<FeatureExportConfig | null> {
    if (!this.initialized) {
      await this.initialize()
    }

    return this.configs.get(featureId) || null
  }

  // Register a feature export config
  register(featureId: string, config: FeatureExportConfig): void {
    this.configs.set(featureId, config)
  }

  // Get all registered features
  getRegisteredFeatures(): string[] {
    return Array.from(this.configs.keys())
  }

  // Check if feature supports export/import
  isFeatureSupported(featureId: string): boolean {
    return this.configs.has(featureId)
  }

  // Get supported formats for a feature
  getSupportedFormats(featureId: string): ExportFormat[] {
    const config = this.configs.get(featureId)
    if (!config) return []

    const formats: ExportFormat[] = []
    formats.push("json") // All features support JSON by default
    formats.push("csv")  // All features support CSV by default

    return formats
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

export const dataExportRegistry = new DataExportRegistry()

// ============================================================================
// Registry Helper Functions
// ============================================================================

// Initialize registry (call this early in app startup)
export async function initializeDataExportRegistry(): Promise<void> {
  await dataExportRegistry.initialize()
}

// Get feature export config
export async function getFeatureExportConfig(featureId: string): Promise<FeatureExportConfig | null> {
  return dataExportRegistry.getExportConfig(featureId)
}

// Register feature export config
export function registerFeatureExportConfig(
  featureId: string,
  config: FeatureExportConfig
): void {
  dataExportRegistry.register(featureId, config)
}

// Check if feature supports export/import
export function isExportImportSupported(featureId: string): boolean {
  return dataExportRegistry.isFeatureSupported(featureId)
}

// Get all supported features
export function getSupportedExportFeatures(): string[] {
  return dataExportRegistry.getRegisteredFeatures()
}

// ============================================================================
// Decorator for Auto-Registration (Optional)
// ============================================================================

export function ExportImport(config: Partial<FeatureExportConfig>) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    // This decorator can be used to automatically register export/import configs
    // Implementation depends on your needs
    console.log(`ExportImport decorator applied to ${propertyKey}`)
  }
}