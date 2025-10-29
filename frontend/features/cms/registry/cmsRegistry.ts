import type { ComponentConfig } from '@/frontend/shared/foundation/registry/CrossFeatureRegistry';
import { cmsWidgetRegistry } from '../widgets/registry';
import { resolveWidgetIcon } from '../shared/utils/iconUtils';

export const registerCMSComponents = (registerComponent: (config: ComponentConfig) => void) => {
  Object.entries(cmsWidgetRegistry).forEach(([key, widgetConfig]) => {
    const componentConfig: ComponentConfig = {
      key,
      label: widgetConfig.label,
      category: widgetConfig.category,
      feature: 'cms',
      description: widgetConfig.description,
      icon: resolveWidgetIcon(
        widgetConfig.icon,
        widgetConfig.category as any,
        key as any
      ),
      defaults: widgetConfig.defaults,
      inspector: widgetConfig.inspector,
      render: widgetConfig.render,
      autoConnect: widgetConfig.autoConnect,
    };
    registerComponent(componentConfig);
  });
};
