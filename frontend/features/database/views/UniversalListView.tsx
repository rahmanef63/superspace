/**
 * UniversalListView Component
 * 
 * A simplified list view for the Universal Database system.
 * Lightweight alternative to the full table view with essential features only.
 * 
 * Features:
 * - Clean, minimal design
 * - Property display in rows
 * - Search filtering
 * - Click to view records
 * - Fast rendering for large datasets
 * - No inline editing, sorting, or complex features
 * 
 * @version 2.0
 * @since Phase 4 - Task 4.8
 */

import React, { useMemo, useState } from 'react';
import { Search, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { PropertyRowData, PropertyColumnConfig } from './table-columns';

export interface UniversalListViewProps {
  /** Array of records to display */
  records: PropertyRowData[];
  
  /** Array of properties for the records */
  properties: PropertyColumnConfig[];
  
  /** Properties to display in list items (defaults to first 3 visible) */
  visibleProperties?: string[];
  
  /** Callback when a record is clicked */
  onRecordClick?: (record: PropertyRowData) => void;
  
  /** Show property labels */
  showPropertyLabels?: boolean;
  
  /** Compact mode (smaller padding) */
  compact?: boolean;
  
  /** Optional CSS class name */
  className?: string;
}

export const UniversalListView: React.FC<UniversalListViewProps> = ({
  records,
  properties,
  visibleProperties,
  onRecordClick,
  showPropertyLabels = true,
  compact = false,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Get properties to display
  const displayProperties = useMemo(() => {
    if (visibleProperties && visibleProperties.length > 0) {
      return properties.filter(prop => visibleProperties.includes(prop.key));
    }
    // Default: show first 3 visible properties
    return properties.filter(prop => prop.visible !== false).slice(0, 3);
  }, [properties, visibleProperties]);

  // Get title property
  const titleProperty = useMemo(() => {
    return properties.find(p => p.type === 'title') || 
           properties.find(p => p.type === 'rich_text') ||
           properties[0];
  }, [properties]);

  // Filter records based on search query
  const filteredRecords = useMemo(() => {
    if (!searchQuery.trim()) return records;

    const query = searchQuery.toLowerCase();
    return records.filter(record => {
      return Object.entries(record.properties || {}).some(([key, value]) => {
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(query);
      });
    });
  }, [records, searchQuery]);

  // Format property value for display
  const formatValue = (value: any, property: PropertyColumnConfig): React.ReactNode => {
    if (value === null || value === undefined) {
      return <span className="text-muted-foreground italic text-sm">Empty</span>;
    }

    switch (property.type) {
      case 'checkbox':
        return value ? (
          <Badge variant="default" className="text-xs">Yes</Badge>
        ) : (
          <Badge variant="secondary" className="text-xs">No</Badge>
        );
      
      case 'select':
      case 'status':
        if (typeof value === 'object' && value !== null && 'label' in value) {
          const color = 'color' in value ? value.color as string : undefined;
          return (
            <Badge 
              variant="secondary"
              className="text-xs font-normal"
              style={color ? { backgroundColor: color + '20', color } : {}}
            >
              {value.label as string}
            </Badge>
          );
        }
        return <span className="text-sm">{String(value)}</span>;
      
      case 'multi_select':
        if (Array.isArray(value)) {
          return (
            <div className="flex flex-wrap gap-1">
              {value.slice(0, 3).map((item, i) => {
                const label = typeof item === 'object' && item !== null && 'label' in item 
                  ? item.label as string 
                  : String(item);
                return (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {label}
                  </Badge>
                );
              })}
              {value.length > 3 && (
                <span className="text-xs text-muted-foreground">+{value.length - 3}</span>
              )}
            </div>
          );
        }
        return <span className="text-sm">{String(value)}</span>;
      
      case 'date':
      case 'created_time':
      case 'last_edited_time':
        let date: Date | null = null;
        if (typeof value === 'number') {
          date = new Date(value);
        } else if (typeof value === 'string') {
          date = new Date(value);
        } else if (value instanceof Date) {
          date = value;
        }
        if (date && !isNaN(date.getTime())) {
          return <span className="text-sm">{date.toLocaleDateString()}</span>;
        }
        return <span className="text-sm">{String(value)}</span>;
      
      case 'number':
        if (typeof value === 'number') {
          return <span className="text-sm font-mono">{value.toLocaleString()}</span>;
        }
        return <span className="text-sm">{String(value)}</span>;
      
      case 'people':
      case 'created_by':
      case 'last_edited_by':
        if (typeof value === 'object' && value !== null && 'name' in value) {
          return (
            <Badge variant="outline" className="text-xs font-normal">
              {value.name as string}
            </Badge>
          );
        }
        return <span className="text-sm">{String(value)}</span>;
      
      default:
        const strValue = String(value);
        return (
          <span className="text-sm truncate block max-w-[300px]" title={strValue}>
            {strValue}
          </span>
        );
    }
  };

  // Get record title
  const getRecordTitle = (record: PropertyRowData): string => {
    if (titleProperty) {
      const value = record.properties?.[titleProperty.key];
      if (value) return String(value);
    }
    return (record as any).name || record.id || 'Untitled';
  };

  return (
    <Card className={className}>
      <CardHeader className={cn(compact && 'py-3')}>
        <div className="flex items-center justify-between gap-4">
          <CardTitle className={cn('text-2xl', compact && 'text-xl')}>
            List
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 w-[250px]"
              />
            </div>
            <span className="text-sm text-muted-foreground">
              {filteredRecords.length} {filteredRecords.length === 1 ? 'item' : 'items'}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className={cn(compact && 'p-0')}>
        {filteredRecords.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchQuery ? 'No records match your search.' : 'No records to display.'}
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="space-y-0">
              {filteredRecords.map((record, index) => (
                <React.Fragment key={record.id}>
                  <div
                    className={cn(
                      'flex items-center justify-between transition-colors cursor-pointer',
                      'hover:bg-accent',
                      compact ? 'p-3' : 'p-4'
                    )}
                    onClick={() => onRecordClick?.(record)}
                  >
                    {/* Left: Title and properties */}
                    <div className="flex-1 min-w-0 space-y-2">
                      {/* Title */}
                      <h3 className={cn(
                        'font-medium truncate',
                        compact ? 'text-sm' : 'text-base'
                      )}>
                        {getRecordTitle(record)}
                      </h3>

                      {/* Properties */}
                      {displayProperties.length > 0 && (
                        <div className="flex flex-wrap gap-x-4 gap-y-1">
                          {displayProperties.map(prop => {
                            const value = record.properties?.[prop.key];
                            if (value === null || value === undefined) return null;

                            return (
                              <div key={prop.key} className="flex items-center gap-2">
                                {showPropertyLabels && (
                                  <span className="text-xs font-medium text-muted-foreground">
                                    {prop.name}:
                                  </span>
                                )}
                                {formatValue(value, prop)}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Right: Arrow icon */}
                    <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 ml-4" />
                  </div>
                  {index < filteredRecords.length - 1 && <Separator />}
                </React.Fragment>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default UniversalListView;
