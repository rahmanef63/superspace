import React, { useState } from 'react';
import { Input, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCrossFeatureRegistry } from '@/frontend/shared/foundation';
import type { FeatureTab, ComponentConfig } from '@/frontend/shared/foundation';
import { DraggableLibraryItem } from './DraggableLibraryItem';
import { getCategoryIcon, getFeatureIcon } from '@/frontend/shared/ui';
import type { LucideIcon } from 'lucide-react';

// Studio tab icons
import { STUDIO_TAB_ICONS } from '@/frontend/features/studio/registry/studioLibraryTabs';

interface UnifiedLibraryProps {
  currentFeature: 'cms' | 'automation' | 'database' | 'studio';
  onAdd?: (componentKey: string, category: string) => void;
}

export const UnifiedLibrary: React.FC<UnifiedLibraryProps> = ({ currentFeature, onAdd }) => {
  const [query, setQuery] = useState('');
  const { getFeatureTabs, getComponentsForTab } = useCrossFeatureRegistry();

  const currentTabs = getFeatureTabs(currentFeature);

  const getFilteredComponents = (tabId: string): ComponentConfig[] => {
    const tab = currentTabs.find((t: FeatureTab) => t.id === tabId);
    if (!tab) return [];

    const components = getComponentsForTab(tab.feature, tabId);
    return components.filter(
      (comp: ComponentConfig) =>
        comp.label.toLowerCase().includes(query.toLowerCase()) ||
        comp.category.toLowerCase().includes(query.toLowerCase())
    );
  };

  const renderComponentGrid = (components: ComponentConfig[]) => {
    // Flat grid - no category grouping (tabs already filter by category)
    return (
      <div className="grid grid-cols-2 gap-2">
        {components.map((component: ComponentConfig) => {
          const FeatureIcon = getFeatureIcon(component.feature);
          const CatIconI = (component.icon as LucideIcon) || getCategoryIcon(component.category);
          return (
            <DraggableLibraryItem
              key={component.key}
              componentKey={component.key}
              label={component.label}
              description={component.description}
              icon={CatIconI}
              category={component.category}
              feature={component.feature}
            >
              <div
                onClick={() => onAdd?.(component.key, component.category)}
                className="h-16 rounded-lg border border-border bg-card/50 p-2 text-left hover:border-primary/50 hover:bg-card transition-all group cursor-pointer"
              >
                <div className="text-xs font-medium truncate flex items-center gap-1.5">
                  {CatIconI && <CatIconI size={14} className="text-primary/70" />}
                  <span className="truncate">{component.label}</span>
                </div>
                <div className="text-[10px] text-muted-foreground mt-1 line-clamp-1">
                  {component.description || component.key}
                </div>
              </div>
            </DraggableLibraryItem>
          );
        })}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b border-border">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search components..."
        />
      </div>

      <Tabs defaultValue={currentTabs[0]?.id || 'layout'} className="flex-1 flex flex-col">
        <TabsList className="px-2 pt-2 flex flex-wrap gap-1 h-auto justify-start bg-transparent">
          {currentTabs.map((tab: FeatureTab) => {
            // Get icon for studio tabs, otherwise use feature icon
            const TabIcon = tab.feature === 'studio'
              ? STUDIO_TAB_ICONS[tab.id as keyof typeof STUDIO_TAB_ICONS]
              : getFeatureIcon(tab.feature);
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 h-auto data-[state=active]:bg-muted"
              >
                {TabIcon && <TabIcon size={14} />}
                {tab.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <ScrollArea className="flex-1">
          {currentTabs.map((tab: FeatureTab) => (
            <TabsContent key={tab.id} value={tab.id} className="p-3">
              {renderComponentGrid(getFilteredComponents(tab.id))}
            </TabsContent>
          ))}
        </ScrollArea>
      </Tabs>
    </div>
  );
};
