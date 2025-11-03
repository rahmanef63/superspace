import React, { useState, useEffect } from 'react';
import { PropertyEditorProps } from '../../registry/types';
import { Textarea } from '@/components/ui/textarea';

export const RichTextEditor: React.FC<PropertyEditorProps> = ({ value, onChange }) => {
  const [localValue, setLocalValue] = useState(value ? String(value) : '');

  useEffect(() => {
    setLocalValue(value ? String(value) : '');
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange(newValue);
  };

  return (
    <Textarea
      value={localValue}
      onChange={handleChange}
      placeholder="Enter rich text..."
      className="min-h-[120px] font-mono text-sm"
      rows={5}
    />
  );
};
