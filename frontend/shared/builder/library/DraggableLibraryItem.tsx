import React from 'react';
import { useDnD } from '../canvas/core/DnDProvider';
import type { LucideIcon } from 'lucide-react';
import { getCategoryIcon, getFeatureIcon } from '@/frontend/shared/ui';

interface DraggableLibraryItemProps {
  componentKey: string;
  label: string;
  description?: string;
  icon?: LucideIcon;
  category: string;
  feature: string;
  children?: React.ReactNode;
  className?: string;
}

export const DraggableLibraryItem: React.FC<DraggableLibraryItemProps> = ({
  componentKey,
  label,
  description,
  icon,
  category,
  feature,
  children,
  className = '',
}) => {
  const [, setType] = useDnD();

  const onDragStart = (event: React.DragEvent) => {
    setType(componentKey);
    event.dataTransfer.setData('text/plain', componentKey);
    event.dataTransfer.setData(
      'application/json',
      JSON.stringify({
        componentKey,
        label,
        category,
        feature,
      })
    );
    event.dataTransfer.effectAllowed = 'move';
  };

  const CategoryIcon = icon || getCategoryIcon(category);
  const FeatureIcon = getFeatureIcon(feature);

  if (children) {
    return (
      <div draggable onDragStart={onDragStart} className={`${className} transition-all hover:-translate-y-0.5 active:scale-[0.98]`}>
        {children}
      </div>
    );
  }

  return (
    <div
      className={`h-20 rounded-xl border border-gray-200 bg-white p-2 text-left hover:border-black transition-all hover:-translate-y-0.5 active:scale-[0.98] group cursor-grab active:cursor-grabbing ${className}`}
      draggable
      onDragStart={onDragStart}
    >
      <div className="text-xs font-semibold flex items-center gap-1">
        <FeatureIcon size={14} className="text-gray-500" />
        <CategoryIcon size={14} className="text-gray-900" />
        <span className="truncate">{label}</span>
      </div>
      <div className="text-[10px] text-gray-500 mt-1 truncate">{description || componentKey}</div>
    </div>
  );
};
