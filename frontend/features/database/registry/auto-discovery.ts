/**
 * Property Auto-Discovery
 *
 * Automatically discovers and registers all property type configurations
 * from the properties/ directory.
 *
 * This enables zero-config property registration - just create a new
 * property folder with config.ts and it will be automatically registered.
 *
 * Note: Next.js doesn't support import.meta.glob, so we use explicit imports.
 *
 * @module frontend/features/database/registry/auto-discovery
 */

import { propertyRegistry } from "./PropertyRegistry";
import type { PropertyConfig } from "./types";

// Explicitly import all property configurations for Next.js compatibility
import buttonConfig from "../properties/button/config";
import checkboxConfig from "../properties/checkbox/config";
import createdByConfig from "../properties/created_by/config";
import createdTimeConfig from "../properties/created_time/config";
import dateConfig from "../properties/date/config";
import emailConfig from "../properties/email/config";
import filesConfig from "../properties/files/config";
import formulaConfig from "../properties/formula/config";
import lastEditedByConfig from "../properties/last_edited_by/config";
import lastEditedTimeConfig from "../properties/last_edited_time/config";
import multiSelectConfig from "../properties/multi_select/config";
import numberConfig from "../properties/number/config";
import peopleConfig from "../properties/people/config";
import phoneConfig from "../properties/phone/config";
import placeConfig from "../properties/place/config";
import relationConfig from "../properties/relation/config";
import richTextConfig from "../properties/rich_text/config";
import rollupConfig from "../properties/rollup/config";
import selectConfig from "../properties/select/config";
import statusConfig from "../properties/status/config";
import titleConfig from "../properties/title/config";
import uniqueIdConfig from "../properties/unique_id/config";
import urlConfig from "../properties/url/config";

// Create a modules map for consistent processing
const propertyModules: Record<string, { default: PropertyConfig }> = {
  "../properties/button/config.ts": { default: buttonConfig },
  "../properties/checkbox/config.ts": { default: checkboxConfig },
  "../properties/created_by/config.ts": { default: createdByConfig },
  "../properties/created_time/config.ts": { default: createdTimeConfig },
  "../properties/date/config.ts": { default: dateConfig },
  "../properties/email/config.ts": { default: emailConfig },
  "../properties/files/config.ts": { default: filesConfig },
  "../properties/formula/config.ts": { default: formulaConfig },
  "../properties/last_edited_by/config.ts": { default: lastEditedByConfig },
  "../properties/last_edited_time/config.ts": { default: lastEditedTimeConfig },
  "../properties/multi_select/config.ts": { default: multiSelectConfig },
  "../properties/number/config.ts": { default: numberConfig },
  "../properties/people/config.ts": { default: peopleConfig },
  "../properties/phone/config.ts": { default: phoneConfig },
  "../properties/place/config.ts": { default: placeConfig },
  "../properties/relation/config.ts": { default: relationConfig },
  "../properties/rich_text/config.ts": { default: richTextConfig },
  "../properties/rollup/config.ts": { default: rollupConfig },
  "../properties/select/config.ts": { default: selectConfig },
  "../properties/status/config.ts": { default: statusConfig },
  "../properties/title/config.ts": { default: titleConfig },
  "../properties/unique_id/config.ts": { default: uniqueIdConfig },
  "../properties/url/config.ts": { default: urlConfig },
};

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
