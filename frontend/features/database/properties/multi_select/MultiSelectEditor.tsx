import React, { useState, useEffect } from 'react';
import { PropertyEditorProps } from '../../registry/types';
import { Input } from '@/components/ui/input';

export const MultiSelectEditor: React.FC<PropertyEditorProps> = ({ value, onChange }) => {
  // Convert array to comma-separated string for editing
  const initialValue = Array.isArray(value) 
    ? value.join(', ') 
    : value ? String(value) : '';

  const [localValue, setLocalValue] = useState(initialValue);

  useEffect(() => {
    const newValue = Array.isArray(value) 
      ? value.join(', ') 
      : value ? String(value) : '';
    setLocalValue(newValue);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);

    // Convert comma-separated string to array
    if (!newValue.trim()) {
      onChange([]);
    } else {
      const items = newValue.split(',').map(v => v.trim()).filter(Boolean);
      onChange(items);
    }
  };

  return (
    <Input
      value={localValue}
      onChange={handleChange}
      placeholder="Enter options (comma-separated)..."
      className="w-full"
    />
  );
};
