import React, { useState, useEffect } from 'react';
import { PropertyEditorProps } from '../../registry/types';
import { Input } from '@/components/ui/input';

export const DateEditor: React.FC<PropertyEditorProps> = ({ value, onChange }) => {
  // Convert to ISO date string (YYYY-MM-DD) for input
  const toInputValue = (val: unknown): string => {
    if (!val) return '';
    try {
      const date = new Date(String(val));
      if (isNaN(date.getTime())) return '';
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  const [localValue, setLocalValue] = useState(toInputValue(value));

  useEffect(() => {
    setLocalValue(toInputValue(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);

    if (!newValue) {
      onChange(null);
    } else {
      // Return ISO string
      onChange(new Date(newValue).toISOString());
    }
  };

  return (
    <Input
      type="date"
      value={localValue}
      onChange={handleChange}
      className="w-full"
    />
  );
};
