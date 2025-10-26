import React from 'react';
import { Alert } from '@/components/ui';

interface AlertWidgetProps {
  variant?: 'default' | 'destructive';
  type?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  description?: string;
  className?: string;
}

export const AlertWidget: React.FC<AlertWidgetProps> = ({
  variant = 'default',
  type = 'info',
  title = 'Alert Title',
  description = 'This is an alert description.',
  className,
}) => {
  return (
    <Alert
      variant={variant}
      type={type}
      title={title}
      description={description}
      className={className}
    />
  );
};
