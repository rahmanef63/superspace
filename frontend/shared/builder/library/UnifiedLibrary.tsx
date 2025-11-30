import React, { useState } from 'react';
import { Input, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui';
import { useCrossFeatureRegistry } from '@/frontend/shared/foundation';
import type { FeatureTab, ComponentConfig } from '@/frontend/shared/foundation';
import { DraggableLibraryItem } from './DraggableLibraryItem';
import { getCategoryIcon, getFeatureIcon } from '@/frontend/shared/ui';
import type { LucideIcon } from 'lucide-react';

interface UnifiedLibraryProps {
  currentFeature: 'cms' | 'automation' | 'database';
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
    const groupedByCategory = components.reduce((acc: Record<string, ComponentConfig[]>, comp: ComponentConfig) => {
      if (!acc[comp.category]) acc[comp.category] = [];
      acc[comp.category].push(comp);
      return acc;
    }, {} as Record<string, ComponentConfig[]>);

    return (
      <div className="space-y-4">
        {Object.entries(groupedByCategory).map(([category, categoryComponents]) => {
          const CatIcon = getCategoryIcon(category);
          return (
            <div key={category}>
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-2">
                <CatIcon size={14} />
                <span>{category}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {categoryComponents.map((component: ComponentConfig) => {
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
                        className="h-20 rounded-xl border border-border bg-card p-2 text-left hover:border-primary transition group cursor-pointer"
                      >
                        <div className="text-xs font-semibold truncate flex items-center gap-1">
                          <FeatureIcon size={12} className="text-muted-foreground" />
                          <CatIconI size={14} className="text-foreground" />
                          <span className="truncate">{component.label}</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-1 truncate">
                          {component.description || component.key}
                        </div>
                      </div>
                    </DraggableLibraryItem>
                  );
                })}
              </div>
            </div>
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
        <TabsList className="px-3 pt-2 overflow-x-auto">
          {currentTabs.map((tab: FeatureTab) => {
            const Icon = getFeatureIcon(tab.feature);
            return (
              <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-1">
                {tab.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <div className="flex-1 overflow-y-auto">
          {currentTabs.map((tab: FeatureTab) => (
            <TabsContent key={tab.id} value={tab.id} className="p-3">
              {renderComponentGrid(getFilteredComponents(tab.id))}
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
};
