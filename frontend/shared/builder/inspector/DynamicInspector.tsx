import React, { useCallback, useMemo } from 'react';
import { Button } from '@/components/ui';
import { Trash2, Pin, PinOff } from 'lucide-react';
import { useCrossFeatureRegistry } from '@/frontend/shared/registry/CrossFeatureRegistry';
import { useSharedCanvas } from '@/frontend/shared/canvas/core/SharedCanvasProvider';
import { useInspectorControls, getNestedValue, setNestedValue } from './hooks/useInspectorControls';
import { DynamicInspectorControl } from './controls/DynamicInspectorControl';

interface DynamicInspectorProps {
  selectedNode: any | null;
}

export function DynamicInspector({ selectedNode }: DynamicInspectorProps) {
  const registry = useCrossFeatureRegistry();
  const canvas = useSharedCanvas();
  const controls = useInspectorControls(selectedNode?.data.comp || '');

  // Memoize the current props to prevent unnecessary re-renders
  const currentProps = useMemo(() => {
    if (!selectedNode) return {};
    const props = selectedNode.data.props || {};
    console.log('Current inspector props:', props);
    return props;
  }, [selectedNode?.data.props, selectedNode?.id]);

  // Enhanced setProp function with better error handling and logging
  const setProp = useCallback((path: string, value: any) => {
    if (!selectedNode) {
      console.warn('No selected node to set props');
      return;
    }
    console.log('Setting prop:', {
      nodeId: selectedNode.id,
      path,
      value
    });
    const newProps = {
      ...currentProps
    };
    setNestedValue(newProps, path, value);
    console.log('New props after update:', newProps);
    canvas.setNodeProps(selectedNode.id, newProps);
  }, [selectedNode, currentProps, canvas]);

  if (!selectedNode) {
    return (
      <div className="p-4 text-sm text-gray-500">
        Select a node on the canvas to edit its properties.
      </div>
    );
  }

  const widget = registry.getWidget(selectedNode.data.comp) || registry.getComponent(selectedNode.data.comp);

  return (
    <div className="h-screen flex flex-col">
      {/* Header - Fixed */}
      <div className="p-3 border-b flex items-center justify-between flex-shrink-0">
        <div className="text-xs font-semibold">
          {widget?.label || selectedNode.data.comp}
        </div>
        <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => canvas.isPinned?.(selectedNode.id) ? canvas.unpin?.(selectedNode.id) : canvas.pin?.(selectedNode.id)}
          >
            {canvas.isPinned?.(selectedNode.id) ? <PinOff size={16} /> : <Pin size={16} />}
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => canvas.removeSelectedNode()}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </div>

      {/* Properties Section - Scrollable */}
      <div className="flex-1 overflow-hidden min-h-0">
        <div className="h-full overflow-y-auto">
          <div className="p-3 space-y-4">
            {/* Debug info */}
            <div className="text-xs text-gray-500">
              Node ID: {selectedNode.id} | Props: {Object.keys(currentProps).length}
            </div>

            {/* Preset-based controls (preferred) */}
            {controls.length > 0 ? (
              // Group controls by category
              (() => {
                const groupedControls = controls.reduce((acc, control) => {
                  const category = control.path.split('.')[0];
                  if (!acc[category]) acc[category] = [];
                  acc[category].push(control);
                  return acc;
                }, {} as Record<string, typeof controls>);

                return Object.entries(groupedControls).map(([category, categoryControls]) => {
                  const singleColumnControls = categoryControls.filter(c => !c.layout || c.layout === 'single');
                  const doubleColumnControls = categoryControls.filter(c => c.layout === 'double');
                  const tripleColumnControls = categoryControls.filter(c => c.layout === 'triple');
                  const spacingControls = categoryControls.filter(c => c.ui === 'spacing');

                  return (
                    <div key={category} className="space-y-3">
                      <div className="text-xs uppercase tracking-wide text-gray-400">
                        {category.toUpperCase()}
                      </div>
                      
                      {/* Single column controls */}
                      {singleColumnControls.length > 0 && (
                        <div className="space-y-3">
                          {singleColumnControls.map(control => (
                            <DynamicInspectorControl
                              key={`${selectedNode.id}-${control.path}`}
                              control={control}
                              value={getNestedValue(currentProps, control.path)}
                              onChange={value => setProp(control.path, value)}
                            />
                          ))}
                        </div>
                      )}

                      {/* Spacing controls */}
                      {spacingControls.length > 0 && (
                        <div className="space-y-3">
                          {spacingControls.map(control => (
                            <DynamicInspectorControl
                              key={`${selectedNode.id}-${control.path}`}
                              control={control}
                              value={getNestedValue(currentProps, control.path)}
                              onChange={value => setProp(control.path, value)}
                            />
                          ))}
                        </div>
                      )}

                      {/* Double column controls */}
                      {doubleColumnControls.length > 0 && (
                        <div className="grid grid-cols-2 gap-3">
                          {doubleColumnControls.map(control => (
                            <DynamicInspectorControl
                              key={`${selectedNode.id}-${control.path}`}
                              control={control}
                              value={getNestedValue(currentProps, control.path)}
                              onChange={value => setProp(control.path, value)}
                            />
                          ))}
                        </div>
                      )}

                      {/* Triple column controls */}
                      {tripleColumnControls.length > 0 && (
                        <div className="grid grid-cols-3 gap-2">
                          {tripleColumnControls.map(control => (
                            <DynamicInspectorControl
                              key={`${selectedNode.id}-${control.path}`}
                              control={control}
                              value={getNestedValue(currentProps, control.path)}
                              onChange={value => setProp(control.path, value)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                });
              })()
            ) : (
              /* Legacy inspector fields fallback */
              widget?.inspector?.fields && (
                <div className="space-y-3">
                  <div className="text-xs uppercase tracking-wide text-gray-400">
                    Properties
                  </div>
                  {widget.inspector.fields.map(field => (
                    <DynamicInspectorControl
                      key={`${selectedNode.id}-${field.key}`}
                      control={{
                        label: field.label,
                        ui: field.type as any,
                        uiComponentPath: field.type,
                        path: field.key,
                        options: field.options,
                        default: field.placeholder || ''
                      }}
                      value={currentProps[field.key]}
                      onChange={value => setProp(field.key, value)}
                    />
                  ))}
                </div>
              )
            )}

            {/* Fallback for widgets with inspectorFields */}
            {!controls.length && !widget?.inspector?.fields && widget?.inspectorFields && (
              <div className="space-y-3">
                <div className="text-xs uppercase tracking-wide text-gray-400">
                  Properties
                </div>
                {widget.inspectorFields.map(field => (
                  <DynamicInspectorControl
                    key={`${selectedNode.id}-${field.key}`}
                    control={{
                      label: field.label,
                      ui: field.type as any,
                      uiComponentPath: field.type,
                      path: field.key,
                      options: field.options,
                      default: field.placeholder || ''
                    }}
                    value={currentProps[field.key]}
                    onChange={value => setProp(field.key, value)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Children Section - Scrollable if has children */}
      {canvas.childrenOrdered && canvas.childrenOrdered.length > 0 && (
        <div className="border-t flex-shrink-0 max-h-48 flex flex-col">
          <div className="p-3 pb-2 border-b bg-gray-50">
            <div className="text-xs uppercase tracking-wide text-gray-400">
              Children ({canvas.childrenOrdered.length})
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="p-3 pt-2 space-y-2">
              {canvas.childrenOrdered.map((child: any, idx: number) => (
                <div key={child.id} className="flex items-center gap-2 rounded-lg border border-gray-200 p-2 text-xs">
                  <div className="flex-1 truncate">
                    {child.label}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => canvas.reorderChild?.(idx, idx - 1)} 
                      disabled={idx === 0}
                    >
                      ↑
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => canvas.reorderChild?.(idx, idx + 1)} 
                      disabled={idx === canvas.childrenOrdered.length - 1}
                    >
                      ↓
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={() => canvas.removeChildEdge?.(child.edgeId)}
                    >
                      <Trash2 size={12} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
