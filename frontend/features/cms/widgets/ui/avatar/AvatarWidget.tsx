import React from 'react';
import { Avatar } from '@/components/ui';

interface AvatarWidgetProps {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const AvatarWidget: React.FC<AvatarWidgetProps> = ({
  src = '',
  alt = 'Avatar',
  fallback = 'CN',
  size = 'md',
  className,
}) => {
  return (
    <Avatar
      src={src}
      alt={alt}
      fallback={fallback}
      size={size}
      className={className}
    />
  );
};
