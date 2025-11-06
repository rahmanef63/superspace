/**
 * Gallery Card Component
 * 
 * Displays a record as a visual card in the gallery view.
 * Supports cover images, property display, hover effects, and multiple sizes.
 * 
 * @version 2.0
 * @since Phase 4 - Task 4.7
 */

import React from 'react';
import { ImageIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { PropertyRowData, PropertyColumnConfig } from './table-columns';
import type { GalleryCardSize } from './UniversalGalleryView';

export interface GalleryCardProps {
  /** The record to display */
  record: PropertyRowData;
  
  /** Title to display */
  title: string;
  
  /** Cover image URL */
  coverImage?: string;
  
  /** Properties to display */
  properties: PropertyColumnConfig[];
  
  /** Card size */
  cardSize?: GalleryCardSize;
  
  /** Click handler */
  onClick?: () => void;
  
  /** Optional CSS class name */
  className?: string;
}

export const GalleryCard: React.FC<GalleryCardProps> = ({
  record,
  title,
  coverImage,
  properties,
  cardSize = 'medium',
  onClick,
  className,
}) => {
  // Calculate image height based on card size
  const imageHeight = React.useMemo(() => {
    switch (cardSize) {
      case 'small': return 'h-32';
      case 'medium': return 'h-48';
      case 'large': return 'h-64';
    }
  }, [cardSize]);

  // Format property value for display
  const formatValue = (value: any, property: PropertyColumnConfig): React.ReactNode => {
    if (value === null || value === undefined) {
      return <span className="text-muted-foreground italic">Empty</span>;
    }

    // Handle different property types
    switch (property.type) {
      case 'checkbox':
        return value ? '✓' : '✗';
      
      case 'select':
      case 'status':
        if (typeof value === 'object' && value !== null && 'label' in value) {
          const color = 'color' in value ? value.color as string : undefined;
          return (
            <Badge 
              variant="secondary" 
              className="text-xs"
              style={color ? { backgroundColor: color + '20', color } : {}}
            >
              {value.label as string}
            </Badge>
          );
        }
        return String(value);
      
      case 'multi_select':
        if (Array.isArray(value)) {
          return (
            <div className="flex flex-wrap gap-1">
              {value.slice(0, 2).map((item, i) => {
                const label = typeof item === 'object' && item !== null && 'label' in item 
                  ? item.label as string 
                  : String(item);
                return (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {label}
                  </Badge>
                );
              })}
              {value.length > 2 && (
                <Badge variant="secondary" className="text-xs">
                  +{value.length - 2}
                </Badge>
              )}
            </div>
          );
        }
        return String(value);
      
      case 'date':
      case 'created_time':
      case 'last_edited_time':
        if (typeof value === 'number') {
          return new Date(value).toLocaleDateString();
        }
        if (typeof value === 'string') {
          return new Date(value).toLocaleDateString();
        }
        if (value instanceof Date) {
          return value.toLocaleDateString();
        }
        return String(value);
      
      case 'number':
        if (typeof value === 'number') {
          return value.toLocaleString();
        }
        return String(value);
      
      case 'url':
        return (
          <a 
            href={String(value)} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline text-xs truncate"
            onClick={(e) => e.stopPropagation()}
          >
            {String(value)}
          </a>
        );
      
      case 'email':
        return (
          <a 
            href={`mailto:${value}`}
            className="text-primary hover:underline text-xs truncate"
            onClick={(e) => e.stopPropagation()}
          >
            {String(value)}
          </a>
        );
      
      case 'people':
      case 'created_by':
      case 'last_edited_by':
        if (typeof value === 'object' && value !== null && 'name' in value) {
          return (
            <Badge variant="outline" className="text-xs">
              {value.name as string}
            </Badge>
          );
        }
        return String(value);
      
      default:
        const strValue = String(value);
        return strValue.length > 50 ? strValue.substring(0, 50) + '...' : strValue;
    }
  };

  return (
    <Card 
      className={cn(
        'overflow-hidden transition-all duration-200 cursor-pointer',
        'hover:shadow-lg hover:-translate-y-1',
        className
      )}
      onClick={onClick}
    >
      {/* Cover Image */}
      <div className={cn(
        'w-full bg-muted flex items-center justify-center overflow-hidden',
        imageHeight
      )}>
        {coverImage ? (
          <img 
            src={coverImage} 
            alt={title}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to placeholder on image error
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement!.innerHTML = `
                <div class="flex items-center justify-center w-full h-full">
                  <svg class="h-12 w-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              `;
            }}
          />
        ) : (
          <ImageIcon className="h-12 w-12 text-muted-foreground" />
        )}
      </div>

      {/* Card Content */}
      <CardHeader className={cn(
        cardSize === 'small' ? 'p-3' : 'p-4'
      )}>
        <CardTitle className={cn(
          'truncate',
          cardSize === 'small' ? 'text-sm' : 'text-base'
        )}>
          {title}
        </CardTitle>
      </CardHeader>

      {/* Properties */}
      {properties.length > 0 && (
        <CardContent className={cn(
          'space-y-2',
          cardSize === 'small' ? 'p-3 pt-0' : 'p-4 pt-0'
        )}>
          {properties.map(prop => {
            const value = record.properties?.[prop.key];
            if (value === null || value === undefined) return null;

            return (
              <div key={prop.key} className="flex flex-col gap-1">
                <span className="text-xs font-medium text-muted-foreground">
                  {prop.name}
                </span>
                <div className="text-sm">
                  {formatValue(value, prop)}
                </div>
              </div>
            );
          })}
        </CardContent>
      )}
    </Card>
  );
};

export default GalleryCard;
