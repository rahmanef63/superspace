import type { ComponentConfig } from '@/frontend/shared/foundation';

// Modular automation widget registry placeholder.
// Populate this by exporting ComponentConfig objects keyed by unique keys.
// Import blocks from builder registry
import { cmsWidgetRegistry } from '../../builder/widgets/registry';

// Filter only blocks and map to automation feature
const automationBlocks = Object.entries(cmsWidgetRegistry)
  .filter(([_, config]) => config.category === 'Blocks')
  .reduce((acc, [key, config]) => {
    acc[key] = { ...config, key, feature: 'automation' } as any;
    return acc;
  }, {} as Record<string, ComponentConfig>);

export const automationWidgetRegistry: Record<string, ComponentConfig> = {
  ...automationBlocks,
  // Example to add later:
  // 'auto-s3-upload': { ... }
};
