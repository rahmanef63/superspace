/**
 * Studio Feature Initialization
 */

import { registerStudioComponents, registerStudioLibraryTabs } from './registry';

export function initStudio(registry: {
    registerComponent: (config: any) => void;
    registerFeatureTabs: (feature: string, tabs: any[]) => void;
}): void {
    registerStudioComponents(registry.registerComponent);
    registerStudioLibraryTabs(registry.registerFeatureTabs);
}

export default initStudio;
