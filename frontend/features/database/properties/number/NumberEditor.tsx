import React, { useState, useEffect } from 'react';
import { PropertyEditorProps } from '../../registry/types';
import { Input } from '@/components/ui/input';
import { ValidationDialog } from '../../components/ValidationDialog';

export const NumberEditor: React.FC<PropertyEditorProps> = ({ value, onChange }) => {
  console.log('🎯 [NumberEditor] Component mounted', { value });
  
  const [localValue, setLocalValue] = useState(
    value !== null && value !== undefined ? String(value) : ''
  );
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');

  useEffect(() => {
    const displayValue = value !== null && value !== undefined ? String(value) : '';
    console.log('🎯 [NumberEditor] Value changed:', { value, displayValue });
    setLocalValue(displayValue);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    console.log('⌨️ [NumberEditor] User typing:', newValue);
    
    // Allow empty value
    if (newValue === '') {
      console.log('✅ [NumberEditor] Empty value - cleared');
      setLocalValue('');
      onChange(null);
      return;
    }

    // Validate: only allow numbers, comma, dot, and minus sign
    const validPattern = /^-?[\d,]*\.?\d*$/;
    
    if (!validPattern.test(newValue)) {
      console.log('❌ [NumberEditor] VALIDATION FAILED - Invalid characters:', newValue);
      setValidationMessage('Input tidak valid. Hanya angka, koma (,), dan titik (.) yang diperbolehkan.');
      setShowValidationDialog(true);
      return;
    }

    console.log('✅ [NumberEditor] Valid input:', newValue);
    setLocalValue(newValue);

    // Remove commas for parsing (treat comma as thousand separator)
    const cleanValue = newValue.replace(/,/g, '');
    const numValue = Number(cleanValue);
    
    if (!isNaN(numValue)) {
      console.log('💾 [NumberEditor] Saving value:', { raw: newValue, parsed: numValue });
      onChange(numValue);
    } else {
      setValidationMessage('Format angka tidak valid. Silakan coba lagi.');
      setShowValidationDialog(true);
    }
  };

  const handleBlur = () => {
    // Format the number on blur (optional - adds thousand separators)
    if (localValue && localValue !== '') {
      const cleanValue = localValue.replace(/,/g, '');
      const numValue = Number(cleanValue);
      
      if (!isNaN(numValue)) {
        // Format with thousand separators
        const formatted = numValue.toLocaleString('id-ID');
        setLocalValue(formatted);
      }
    }
  };

  return (
    <>
      <Input
        type="text"
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="Masukkan angka..."
        className="font-mono"
      />
      
      <ValidationDialog
        open={showValidationDialog}
        onOpenChange={setShowValidationDialog}
        title="Input Tidak Valid"
        description={validationMessage}
      />
    </>
  );
};
