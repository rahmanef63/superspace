import React, { useState, useEffect } from 'react';
import { PropertyEditorProps } from '../../registry/types';
import { Input } from '@/components/ui/input';

export const SelectEditor: React.FC<PropertyEditorProps> = ({ value, onChange }) => {
  const [localValue, setLocalValue] = useState(value ? String(value) : '');

  useEffect(() => {
    setLocalValue(value ? String(value) : '');
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange(newValue || null);
  };

  return (
    <Input
      value={localValue}
      onChange={handleChange}
      placeholder="Enter option..."
      className="w-full"
    />
  );
};
