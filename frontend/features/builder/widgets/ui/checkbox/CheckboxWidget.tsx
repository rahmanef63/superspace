import React from 'react';
import { Checkbox } from '@/components/ui';

interface CheckboxWidgetProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export const CheckboxWidget: React.FC<CheckboxWidgetProps> = ({
  checked = false,
  onCheckedChange,
  label = 'Checkbox label',
  disabled = false,
  className,
}) => {
  return (
    <Checkbox
      checked={checked}
      onCheckedChange={onCheckedChange}
      label={label}
      disabled={disabled}
      className={className}
    />
  );
};
