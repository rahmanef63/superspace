/**
 * Data Export/Import Registry
 * Auto-discovery system for feature export/import configurations
 */

import type {
  FeatureExportConfig,
  ExportFormat,
  ExportProperty,
  ImportRequest,
  ImportResult,
} from "@/frontend/shared/foundation/utils/export/data-export-types"

// ============================================================================
// Registry Implementation
// ============================================================================

class DataExportRegistry {
  private configs = new Map<string, FeatureExportConfig>()
  private initialized = false

  // Initialize registry with auto-discovered configs
  async initialize(): Promise<void> {
    if (this.initialized) return

    try {
      // For now, manually register known features with export/import
      // In a real build system, this would be auto-generated

      // Register knowledge/docs feature
      try {
        const { exportConfig: docsExportConfig } = await import("@/frontend/features/documents/data/export-config")
        if (docsExportConfig) {
          this.configs.set("knowledge/docs", docsExportConfig)
          console.log("Registered export config for knowledge/docs")
        }
      } catch (error) {
        console.error("Failed to load knowledge/docs export config:", error)
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