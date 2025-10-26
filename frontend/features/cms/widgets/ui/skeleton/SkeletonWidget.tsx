import React from 'react';
import { Skeleton } from '@/components/ui';

interface SkeletonWidgetProps {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  className?: string;
}

export const SkeletonWidget: React.FC<SkeletonWidgetProps> = ({
  variant = 'rectangular',
  width = '100%',
  height = 20,
  className,
}) => {
  return (
    <Skeleton
      variant={variant}
      width={width}
      height={height}
      className={className}
    />
  );
};
