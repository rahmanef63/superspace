/**
 * Property Auto-Discovery
 *
 * Automatically discovers and registers all property type configurations
 * from the properties/ directory using Vite's glob import feature.
 *
 * This enables zero-config property registration - just create a new
 * property folder with config.ts and it will be automatically registered.
 *
 * @module frontend/features/database/registry/auto-discovery
 */

import { propertyRegistry } from "./PropertyRegistry";
import type { PropertyConfig } from "./types";

// Auto-discover all property configurations using Vite's glob import
// Pattern matches: properties/*/config.ts
// Example: properties/title/config.ts, properties/rich-text/config.ts, etc.
const propertyModules = import.meta.glob<{ default: PropertyConfig }>(
  "../properties/*/config.ts",
  { eager: true }
);

/**
 * Register all discovered properties
 *
 * Iterates through all discovered property modules and registers each
 * configuration with the property registry.
 *
 * Validates each config before registration and logs warnings for invalid configs.
 *
 * @returns Number of successfully registered properties
 */
export function registerAllProperties(): number {
  let successCount = 0;
  let failCount = 0;

  Object.entries(propertyModules).forEach(([path, module]) => {
    try {
      const config = module.default;

      // Validate config exists
      if (!config) {
        console.warn(`No default export found at ${path}`);
        failCount++;
        return;
      }

      // Validate config has type
      if (!config.type) {
        console.warn(`Property config at ${path} is missing 'type' field`);
        failCount++;
        return;
      }

      // Validate config has required components
      if (!config.Renderer) {
        console.warn(`Property config at ${path} is missing 'Renderer' component`);
        failCount++;
        return;
      }

      if (!config.Editor) {
        console.warn(`Property config at ${path} is missing 'Editor' component`);
        failCount++;
        return;
      }

      // Register the config
      propertyRegistry.register(config);
      successCount++;
    } catch (error) {
      console.error(`Error registering property from ${path}:`, error);
      failCount++;
    }
  });

  if (process.env.NODE_ENV === "development") {
    console.log(
      `📦 Property Registry: Registered ${successCount} property types` +
        (failCount > 0 ? ` (${failCount} failed)` : "")
    );
  }

  return successCount;
}

/**
 * Get list of discovered property module paths
 *
 * Useful for debugging and testing to see which property modules
 * were found by the auto-discovery system.
 *
 * @returns Array of module paths
 */
export function getDiscoveredModulePaths(): string[] {
  return Object.keys(propertyModules);
}

/**
 * Check if a specific property type was discovered
 *
 * @param type - Property type to check
 * @returns True if property was discovered, false otherwise
 */
export function wasPropertyDiscovered(type: string): boolean {
  return Object.keys(propertyModules).some((path) =>
    path.includes(`properties/${type}/config.ts`)
  );
}

// Auto-register all properties on module load
// This ensures properties are registered as soon as the registry is imported
if (typeof window !== "undefined") {
  // Only run in browser environment
  registerAllProperties();
}

// Export for manual registration (useful in SSR or testing)
export { propertyModules };
