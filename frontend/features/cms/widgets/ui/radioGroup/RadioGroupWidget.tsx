import React from 'react';
import { RadioGroup } from '@/components/ui';

interface RadioGroupWidgetProps {
  value?: string;
  onValueChange?: (value: string) => void;
  options?: Array<{
    value: string;
    label: string;
    disabled?: boolean;
  }>;
  className?: string;
}

export const RadioGroupWidget: React.FC<RadioGroupWidgetProps> = ({
  value = '',
  onValueChange,
  options = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ],
  className,
}) => {
  return (
    <RadioGroup
      value={value}
      onValueChange={onValueChange}
      options={options}
      className={className}
    />
  );
};
