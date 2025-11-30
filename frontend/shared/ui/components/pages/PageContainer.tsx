import React from 'react';
import { cn } from '@/lib/utils';

interface PageContainerProps {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: boolean;
  fullHeight?: boolean;
  className?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  maxWidth = 'full',
  padding = true,
  fullHeight = false,
  className
}) => {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full'
  };

  return (
    <div className={cn(
      "mx-auto",
      maxWidthClasses[maxWidth],
      padding && "p-6",
      fullHeight && "h-full",
      className
    )}>
      {children}
    </div>
  );
};
