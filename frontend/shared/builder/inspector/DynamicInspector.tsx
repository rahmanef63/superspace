import React, { useCallback, useMemo } from 'react';
import { Button, Input, Label, Switch, Slider } from '@/components/ui';
import {
  Trash2,
  MoreHorizontal,
  Settings,
  Maximize2,
  Lock,
} from 'lucide-react';
import { useCrossFeatureRegistry } from '@/frontend/shared/foundation';
import { useSharedCanvas } from '../canvas/core';
// InspectorField type - defined locally to avoid coupling to studio
export interface InspectorField {
  key: string;
  label: string;
  type:
  | 'text'
  | 'number'
  | 'select'
  | 'switch'
  | 'textarea'
  | 'custom'
  | 'nodeSelector'
  | 'slider'
  | 'color'
  | 'checkbox'
  | 'button'
  | 'buttonGroup'
  | 'range';
  options?: string[];
  placeholder?: string;
  component?: React.ComponentType<any>;
  min?: number;
  max?: number;
  step?: number;
  buttonLabel?: string;
  buttonVariant?: 'default' | 'outline' | 'ghost' | 'destructive';
  onButtonClick?: () => void;
  buttons?: Array<{ value: string; label: string; icon?: React.ComponentType<any> }>;
}
import { useInspectorControls, getNestedValue, setNestedValue } from './hooks/useInspectorControls';
import { DynamicInspectorControl } from './controls/DynamicInspectorControl';
import {
  InspectorSection,
  InspectorSubsection,
  InspectorRow,
  InspectorInput,
  InspectorSelect,
  InspectorButtonGroup,
  InspectorColorPicker,
} from './components/InspectorSection';
import {
  INSPECTOR_SECTIONS,
  INSPECTOR_DEFAULTS,
  FONT_FAMILIES,
  FONT_WEIGHTS,
  FONT_SIZES,
  TEXT_ALIGNMENTS,
  TEXT_DECORATIONS,
  BORDER_STYLES,
  BORDER_COLORS,
  BORDER_RADII,
  BOX_SHADOWS,
  SPACING_ICONS,
  SUBSECTION_COLORS,
  // Dimension & Display
  SIZE_PRESETS,
  DISPLAY_OPTIONS,
  FLEX_DIRECTIONS,
  FLEX_WRAPS,
  ALIGN_ITEMS,
  JUSTIFY_CONTENT,
  GAP_OPTIONS,
  POSITION_OPTIONS,
  OVERFLOW_OPTIONS,
  // Helpers
  getColorLabel,
  toSelectOptions,
  toLabeledSelectOptions,
} from './config/inspector.config';
import { Layers } from 'lucide-react';

interface DynamicInspectorProps {
  selectedNode: any | null;
  /** Injectable widget fields getter. Studio passes a function based on getWidgetConfig; defaults to () => undefined */
  getWidgetFields?: (comp: string) => InspectorField[] | undefined;
}

export function DynamicInspector({ selectedNode, getWidgetFields }: DynamicInspectorProps) {
  const registry = useCrossFeatureRegistry();
  const canvas = useSharedCanvas();
  const controls = useInspectorControls(selectedNode?.data.comp || '');

  const currentProps = useMemo(() => {
    if (!selectedNode) return {};
    return selectedNode.data.props || {};
  }, [selectedNode?.data.props, selectedNode?.id]);

  // Helper to get prop value with default fallback
  const getProp = useCallback((key: string) => {
    return currentProps[key] ?? INSPECTOR_DEFAULTS[key as keyof typeof INSPECTOR_DEFAULTS] ?? '';
  }, [currentProps]);

  const setProp = useCallback((path: string, value: any) => {
    if (!selectedNode) return;
    const newProps = { ...currentProps };
    setNestedValue(newProps, path, value);
    canvas.setNodeProps(selectedNode.id, newProps);
  }, [selectedNode, currentProps, canvas]);

  if (!selectedNode) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
          <Layers className="w-8 h-8 text-muted-foreground/50" />
        </div>
        <p className="text-sm text-muted-foreground">
          Select a node to edit its properties.
        </p>
      </div>
    );
  }

  const widget = registry.getWidget(selectedNode.data.comp) || registry.getComponent(selectedNode.data.comp);
  const nodeType = widget?.label || selectedNode.data.comp;

  // Widget-specific inspector fields from WidgetConfig.inspector.fields
  const widgetFields: InspectorField[] = (getWidgetFields ? getWidgetFields(selectedNode.data.comp) : undefined) ?? [];

  // Renderer for a single InspectorField
  const renderField = (field: InspectorField) => {
    const value = currentProps[field.key] ?? '';
    const update = (v: any) => setProp(field.key, v);
    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            key={field.key}
            value={value}
            onChange={e => update(e.target.value)}
            placeholder={field.placeholder}
            className="w-full min-h-[64px] px-2.5 py-1.5 text-sm rounded-md border border-border/50 bg-background resize-none focus:outline-none focus:ring-1 focus:ring-ring"
          />
        );
      case 'select':
        return (
          <select
            key={field.key}
            value={value}
            onChange={e => update(e.target.value)}
            className="w-full h-8 px-2.5 text-sm rounded-md border border-border/50 bg-background focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {(field.options || []).map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        );
      case 'switch':
      case 'checkbox':
        return (
          <div key={field.key} className="flex items-center gap-2">
            <Switch checked={!!value} onCheckedChange={update} />
          </div>
        );
      case 'color':
        return (
          <input key={field.key} type="color" value={value || '#000000'} onChange={e => update(e.target.value)} className="h-8 w-full rounded-md border border-border/50" />
        );
      case 'slider':
      case 'range':
        return (
          <Slider key={field.key} value={[Number(value) || field.min || 0]} min={field.min ?? 0} max={field.max ?? 100} step={field.step ?? 1} onValueChange={([v]) => update(v)} className="w-full" />
        );
      case 'number':
        return (
          <Input key={field.key} type="number" value={value} onChange={e => update(Number(e.target.value))} placeholder={field.placeholder} className="h-8" min={field.min} max={field.max} step={field.step} />
        );
      case 'custom':
        if (field.component) {
          const Comp = field.component;
          return <Comp key={field.key} value={value} onChange={update} />;
        }
        return null;
      default:
        return (
          <Input key={field.key} value={value} onChange={e => update(e.target.value)} placeholder={field.placeholder} className="h-8" />
        );
    }
  };

  // Convert SSOT arrays to button group options
  const alignmentOptions = TEXT_ALIGNMENTS.map(a => ({
    value: a.value,
    icon: <a.icon className="h-3.5 w-3.5" />,
    label: a.label,
  }));

  const decorationOptions = TEXT_DECORATIONS.map(d => ({
    value: d.value,
    icon: <d.icon className="h-3.5 w-3.5" />,
    label: d.label,
  }));

  // Reusable spacing input renderer (DRY)
  const renderSpacingInputs = (prefix: 'margin' | 'padding') => (
    <div className="flex items-center gap-2">
      <div className="flex-1 grid grid-cols-2 gap-1.5">
        {(['Top', 'Bottom', 'Left', 'Right'] as const).map(side => {
          const key = `${prefix}${side}` as keyof typeof INSPECTOR_DEFAULTS;
          const iconKey = side.toLowerCase() as keyof typeof SPACING_ICONS;
          return (
            <InspectorInput
              key={key}
              icon={<span className="text-xs text-muted-foreground">{SPACING_ICONS[iconKey]}</span>}
              value={getProp(key)}
              onChange={(v) => setProp(key, v)}
            />
          );
        })}
      </div>
      <div className="flex flex-col gap-1">
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <Maximize2 className="h-3 w-3" />
        </Button>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <Lock className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header - Element Type Display */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/50">
        <div className="flex items-center gap-2">
          <span className="text-primary">◇</span>
          <span className="text-sm font-semibold">{nodeType}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Scrollable Content - Design Properties */}
      <div className="flex-1 overflow-y-auto">

        {/* Widget-specific fields (from WidgetConfig.inspector.fields) */}
        {widgetFields.length > 0 && (
          <InspectorSection title="Content" defaultOpen={true}>
            <div className="space-y-3">
              {widgetFields.map(field => (
                <div key={field.key} className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">{field.label}</Label>
                  {renderField(field)}
                </div>
              ))}
            </div>
          </InspectorSection>
        )}

        {/* Content Section (for nodes with raw content prop not in widgetFields) */}
        {currentProps.content !== undefined && !widgetFields.some(f => f.key === 'content') && (
          <InspectorSection {...INSPECTOR_SECTIONS.content}>
            <textarea
              value={currentProps.content || ''}
              onChange={(e) => setProp('content', e.target.value)}
              placeholder="Add to canvas"
              className="w-full min-h-[80px] px-3 py-2 text-sm rounded-md border border-border/50 bg-background resize-none focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </InspectorSection>
        )}

        {/* Typography Section */}
        <InspectorSection {...INSPECTOR_SECTIONS.typography}>
          <InspectorSelect
            value={getProp('fontFamily')}
            onChange={(v) => setProp('fontFamily', v)}
            options={toSelectOptions(FONT_FAMILIES)}
          />

          <InspectorRow>
            <InspectorSelect
              value={getProp('fontWeight')}
              onChange={(v) => setProp('fontWeight', v)}
              options={toLabeledSelectOptions(FONT_WEIGHTS)}
            />
            <InspectorSelect
              value={getProp('fontSize')}
              onChange={(v) => setProp('fontSize', v)}
              options={toLabeledSelectOptions(FONT_SIZES)}
            />
          </InspectorRow>

          <InspectorRow>
            <InspectorSubsection label="Line Height" color={SUBSECTION_COLORS.lineHeight}>
              <InspectorInput
                value={getProp('lineHeight')}
                onChange={(v) => setProp('lineHeight', v)}
              />
            </InspectorSubsection>
            <InspectorSubsection label="Letter Spacing" color={SUBSECTION_COLORS.letterSpacing}>
              <InspectorInput
                value={getProp('letterSpacing')}
                onChange={(v) => setProp('letterSpacing', v)}
              />
            </InspectorSubsection>
          </InspectorRow>

          <InspectorRow>
            <InspectorSubsection label="Alignment">
              <InspectorButtonGroup
                value={getProp('textAlign')}
                onChange={(v) => setProp('textAlign', v)}
                options={alignmentOptions}
              />
            </InspectorSubsection>
            <InspectorSubsection label="Decoration">
              <InspectorButtonGroup
                value={getProp('textDecoration')}
                onChange={(v) => setProp('textDecoration', v)}
                options={decorationOptions}
              />
            </InspectorSubsection>
          </InspectorRow>
        </InspectorSection>

        {/* Color Section */}
        <InspectorSection {...INSPECTOR_SECTIONS.color}>
          <InspectorColorPicker
            value={getProp('color')}
            onChange={(v) => setProp('color', v)}
            label={getColorLabel(currentProps.color, 'text')}
          />
        </InspectorSection>

        {/* Background Section */}
        <InspectorSection {...INSPECTOR_SECTIONS.background}>
          <InspectorColorPicker
            value={getProp('backgroundColor')}
            onChange={(v) => setProp('backgroundColor', v)}
            label={getColorLabel(currentProps.backgroundColor, 'bg')}
          />
        </InspectorSection>

        {/* Dimensions Section */}
        <InspectorSection {...INSPECTOR_SECTIONS.dimensions}>
          <InspectorRow>
            <InspectorSubsection label="Width">
              <InspectorInput
                value={getProp('width')}
                onChange={(v) => setProp('width', v)}
                placeholder="auto"
              />
            </InspectorSubsection>
            <InspectorSubsection label="Height">
              <InspectorInput
                value={getProp('height')}
                onChange={(v) => setProp('height', v)}
                placeholder="auto"
              />
            </InspectorSubsection>
          </InspectorRow>

          <InspectorSubsection label="Display">
            <InspectorSelect
              value={getProp('display')}
              onChange={(v) => setProp('display', v)}
              options={toLabeledSelectOptions(DISPLAY_OPTIONS)}
            />
          </InspectorSubsection>

          <InspectorRow>
            <InspectorSubsection label="Direction">
              <InspectorSelect
                value={getProp('flexDirection')}
                onChange={(v) => setProp('flexDirection', v)}
                options={toLabeledSelectOptions(FLEX_DIRECTIONS)}
              />
            </InspectorSubsection>
            <InspectorSubsection label="Wrap">
              <InspectorSelect
                value={getProp('flexWrap')}
                onChange={(v) => setProp('flexWrap', v)}
                options={toLabeledSelectOptions(FLEX_WRAPS)}
              />
            </InspectorSubsection>
          </InspectorRow>

          <InspectorRow>
            <InspectorSubsection label="Align Items">
              <InspectorSelect
                value={getProp('alignItems')}
                onChange={(v) => setProp('alignItems', v)}
                options={toLabeledSelectOptions(ALIGN_ITEMS)}
              />
            </InspectorSubsection>
            <InspectorSubsection label="Justify">
              <InspectorSelect
                value={getProp('justifyContent')}
                onChange={(v) => setProp('justifyContent', v)}
                options={toLabeledSelectOptions(JUSTIFY_CONTENT)}
              />
            </InspectorSubsection>
          </InspectorRow>

          <InspectorSubsection label="Gap">
            <InspectorSelect
              value={getProp('gap')}
              onChange={(v) => setProp('gap', v)}
              options={toLabeledSelectOptions(GAP_OPTIONS)}
            />
          </InspectorSubsection>
        </InspectorSection>

        {/* Layout Section */}
        <InspectorSection {...INSPECTOR_SECTIONS.layout}>
          <InspectorSubsection label="Margin" color={SUBSECTION_COLORS.margin}>
            {renderSpacingInputs('margin')}
          </InspectorSubsection>
          <InspectorSubsection label="Padding" color={SUBSECTION_COLORS.padding}>
            {renderSpacingInputs('padding')}
          </InspectorSubsection>
        </InspectorSection>

        {/* Border Section */}
        <InspectorSection {...INSPECTOR_SECTIONS.border}>
          <InspectorRow>
            <InspectorSelect
              value={getProp('borderStyle')}
              onChange={(v) => setProp('borderStyle', v)}
              options={toSelectOptions(BORDER_STYLES)}
            />
            <InspectorSelect
              value={getProp('borderColor')}
              onChange={(v) => setProp('borderColor', v)}
              options={toLabeledSelectOptions(BORDER_COLORS)}
            />
          </InspectorRow>
          <InspectorInput
            value={getProp('borderWidth')}
            onChange={(v) => setProp('borderWidth', v)}
          />
        </InspectorSection>

        {/* Appearance Section */}
        <InspectorSection {...INSPECTOR_SECTIONS.appearance}>
          <InspectorRow>
            <InspectorSubsection label="Opacity" color={SUBSECTION_COLORS.opacity}>
              <InspectorInput
                value={getProp('opacity')}
                onChange={(v) => setProp('opacity', v)}
                type="number"
              />
            </InspectorSubsection>
            <InspectorSubsection label="Radius">
              <InspectorSelect
                value={getProp('borderRadius')}
                onChange={(v) => setProp('borderRadius', v)}
                options={toLabeledSelectOptions(BORDER_RADII)}
              />
            </InspectorSubsection>
          </InspectorRow>
        </InspectorSection>

        {/* Shadow Section */}
        <InspectorSection {...INSPECTOR_SECTIONS.shadow}>
          <InspectorSelect
            value={getProp('boxShadow')}
            onChange={(v) => setProp('boxShadow', v)}
            options={toLabeledSelectOptions(BOX_SHADOWS)}
          />
        </InspectorSection>

        {/* Widget-specific controls only (non-styling props) */}
        {/* Note: Styling properties are handled by the sections above */}
        {/* Only show Properties section for widget-specific (non-CSS) fields */}
      </div>

      {/* Children Section */}
      {canvas.childrenOrdered && canvas.childrenOrdered.length > 0 && (
        <div className="border-t border-border/50 max-h-48 flex flex-col shrink-0">
          <div className="px-4 py-2 border-b border-border/50 bg-muted/30">
            <span className="text-xs font-medium text-muted-foreground">
              Children ({canvas.childrenOrdered.length})
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
            {canvas.childrenOrdered.map((child: any, idx: number) => (
              <div
                key={child.id}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-border/50 bg-background text-xs"
              >
                <span className="flex-1 truncate">{child.label}</span>
                <div className="flex items-center gap-0.5">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-5 w-5"
                    onClick={() => canvas.reorderChild?.(idx, idx - 1)}
                    disabled={idx === 0}
                  >
                    ↑
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-5 w-5"
                    onClick={() => canvas.reorderChild?.(idx, idx + 1)}
                    disabled={idx === canvas.childrenOrdered.length - 1}
                  >
                    ↓
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-5 w-5 text-destructive hover:text-destructive"
                    onClick={() => canvas.removeChildEdge?.(child.edgeId)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
