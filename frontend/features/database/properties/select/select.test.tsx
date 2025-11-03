/**
 * Select Property - Unit Tests
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { selectPropertyConfig } from './config';
import { SelectRenderer } from './SelectRenderer';
import { SelectEditor } from './SelectEditor';
import type { Property } from '@/frontend/shared/foundation/types/universal-database';

const mockProperty: Property = {
  name: 'Status',
  type: 'select',
  key: 'status',
};

describe('selectPropertyConfig', () => {
  it('should have correct type', () => {
    expect(selectPropertyConfig.type).toBe('select');
  });

  it('should have correct label', () => {
    expect(selectPropertyConfig.label).toBe('Select');
  });

  it('should be in core category', () => {
    expect(selectPropertyConfig.category).toBe('core');
  });

  it('should support options', () => {
    expect(selectPropertyConfig.supportsOptions).toBe(true);
  });

  it('should have icon component', () => {
    expect(selectPropertyConfig.icon).toBeDefined();
  });
});

describe('selectPropertyConfig.validate', () => {
  it('should accept string values', () => {
    expect(selectPropertyConfig.validate?.('In Progress', mockProperty)).toBeNull();
    expect(selectPropertyConfig.validate?.('Done', mockProperty)).toBeNull();
  });

  it('should accept null/undefined', () => {
    expect(selectPropertyConfig.validate?.(null, mockProperty)).toBeNull();
    expect(selectPropertyConfig.validate?.(undefined, mockProperty)).toBeNull();
  });

  it('should reject non-string values', () => {
    expect(selectPropertyConfig.validate?.(123 as any, mockProperty)).toBe('Select value must be text');
  });
});

describe('selectPropertyConfig.format', () => {
  it('should format string values', () => {
    expect(selectPropertyConfig.format?.('In Progress')).toBe('In Progress');
  });

  it('should return empty string for null', () => {
    expect(selectPropertyConfig.format?.(null)).toBe('');
  });
});

describe('SelectRenderer', () => {
  it('should render value as badge', () => {
    render(<SelectRenderer value="In Progress" property={mockProperty} readOnly={true} />);
    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });

  it('should render empty state for null', () => {
    render(<SelectRenderer value={null} property={mockProperty} readOnly={true} />);
    expect(screen.getByText('Empty')).toBeInTheDocument();
  });
});

describe('SelectEditor', () => {
  let mockOnChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnChange = vi.fn();
  });

  it('should render input with value', () => {
    render(<SelectEditor value="In Progress" onChange={mockOnChange} property={mockProperty} />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('In Progress');
  });

  it('should call onChange when typing', async () => {
    const user = userEvent.setup();
    render(<SelectEditor value="" onChange={mockOnChange} property={mockProperty} />);
    
    const input = screen.getByRole('textbox');
    await user.type(input, 'Done');
    
    expect(mockOnChange).toHaveBeenCalled();
  });

  it('should call onChange with null for empty', async () => {
    const user = userEvent.setup();
    render(<SelectEditor value="In Progress" onChange={mockOnChange} property={mockProperty} />);
    
    const input = screen.getByRole('textbox');
    await user.clear(input);
    
    expect(mockOnChange).toHaveBeenCalledWith(null);
  });
});

describe('Select Property Integration', () => {
  it('should work in read-edit-read cycle', async () => {
    const user = userEvent.setup();
    let currentValue = 'In Progress';
    const onChange = (newValue: unknown) => {
      currentValue = String(newValue || '');
    };

    let result = render(<SelectRenderer value={currentValue} property={mockProperty} readOnly={true} />);
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    result.unmount();

    result = render(<SelectEditor value={currentValue} property={mockProperty} onChange={onChange} />);
    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, 'Done');
    expect(currentValue).toBe('Done');
    result.unmount();

    result = render(<SelectRenderer value={currentValue} property={mockProperty} readOnly={true} />);
    expect(screen.getByText('Done')).toBeInTheDocument();
  });
});
