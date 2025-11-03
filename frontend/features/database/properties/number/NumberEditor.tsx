import React, { useState, useEffect } from 'react';
import { PropertyEditorProps } from '../../registry/types';
import { Input } from '@/components/ui/input';

export const NumberEditor: React.FC<PropertyEditorProps> = ({ value, onChange }) => {
  const [localValue, setLocalValue] = useState(
    value !== null && value !== undefined ? String(value) : ''
  );

  useEffect(() => {
    setLocalValue(value !== null && value !== undefined ? String(value) : '');
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);

    // Convert to number if valid, otherwise pass empty string
    if (newValue === '') {
      onChange(null);
    } else {
      const numValue = Number(newValue);
      if (!isNaN(numValue)) {
        onChange(numValue);
      }
    }
  };

  return (
    <Input
      type="number"
      value={localValue}
      onChange={handleChange}
      placeholder="Enter number..."
      className="font-mono"
      step="any"
    />
  );
};
