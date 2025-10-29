import React from 'react';
import { cn } from '../../lib/utils';
import type { LucideIcon } from 'lucide-react';
import { getFeatureIcon } from '@/frontend/shared/ui/icons';

export interface NavigationItem {
  id: string;
  label: string;
  icon?: LucideIcon;
  href?: string;
  active?: boolean;
  children?: NavigationItem[];
  badge?: string;
}

interface NavigationMenuProps {
  items: NavigationItem[];
  onItemClick?: (item: NavigationItem) => void;
  className?: string;
}

function deriveIcon(item: NavigationItem): LucideIcon | null {
  if (item.icon) return item.icon;
  // try to infer from href or id
  const path = item.href || '';
  const key = (item.id || path.split('/')[1] || '').toLowerCase();
  return getFeatureIcon(key) || null;
}

export const NavigationMenu: React.FC<NavigationMenuProps> = ({
  items,
  onItemClick,
  className,
}) => {
  const renderItem = (item: NavigationItem, level = 0) => {
    const Icon = deriveIcon(item);
    return (
      <div key={item.id} className={cn('', level > 0 && 'ml-4')}>
        <button
          onClick={() => onItemClick?.(item)}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all text-left hover:translate-x-0.5 active:scale-[0.98]',
            item.active ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'
          )}
        >
          {Icon && <Icon size={16} className="text-current" />}
          <span className="flex-1">{item.label}</span>
          {item.badge && (
            <span
              className={cn(
                'px-2 py-1 text-xs rounded-full',
                item.active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
              )}
            >
              {item.badge}
            </span>
          )}
        </button>
        {item.children && (
          <div className="mt-1 space-y-1">
            {item.children.map((child) => renderItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return <nav className={cn('p-4 space-y-2', className)}>{items.map((item) => renderItem(item))}</nav>;
};
