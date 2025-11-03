/**
 * Multi-Select Property - Unit Tests
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { multiSelectPropertyConfig } from './config';
import { MultiSelectRenderer } from './MultiSelectRenderer';
import { MultiSelectEditor } from './MultiSelectEditor';
import type { Property } from '@/frontend/shared/foundation/types/universal-database';

const mockProperty: Property = {
  name: 'Tags',
  type: 'multi_select',
  key: 'tags',
};

describe('multiSelectPropertyConfig', () => {
  it('should have correct type', () => {
    expect(multiSelectPropertyConfig.type).toBe('multi_select');
  });

  it('should have correct label', () => {
    expect(multiSelectPropertyConfig.label).toBe('Multi-Select');
  });

  it('should be in core category', () => {
    expect(multiSelectPropertyConfig.category).toBe('core');
  });

  it('should support options', () => {
    expect(multiSelectPropertyConfig.supportsOptions).toBe(true);
  });

  it('should have icon component', () => {
    expect(multiSelectPropertyConfig.icon).toBeDefined();
  });
});

describe('multiSelectPropertyConfig.validate', () => {
  it('should accept arrays', () => {
    expect(multiSelectPropertyConfig.validate?.(['tag1', 'tag2'], mockProperty)).toBeNull();
  });

  it('should accept comma-separated strings', () => {
    expect(multiSelectPropertyConfig.validate?.('tag1, tag2', mockProperty)).toBeNull();
  });

  it('should accept null/undefined', () => {
    expect(multiSelectPropertyConfig.validate?.(null, mockProperty)).toBeNull();
    expect(multiSelectPropertyConfig.validate?.(undefined, mockProperty)).toBeNull();
  });

  it('should reject invalid types', () => {
    expect(multiSelectPropertyConfig.validate?.(123 as any, mockProperty)).toBe('Multi-select must be an array or comma-separated string');
  });
});

describe('multiSelectPropertyConfig.format', () => {
  it('should format array as comma-separated string', () => {
    expect(multiSelectPropertyConfig.format?.(['tag1', 'tag2', 'tag3'])).toBe('tag1, tag2, tag3');
  });

  it('should format string values', () => {
    expect(multiSelectPropertyConfig.format?.('tag1, tag2')).toBe('tag1, tag2');
  });

  it('should return empty string for null', () => {
    expect(multiSelectPropertyConfig.format?.(null)).toBe('');
  });
});

describe('MultiSelectRenderer', () => {
  it('should render array as badges', () => {
    render(<MultiSelectRenderer value={['tag1', 'tag2']} property={mockProperty} readOnly={true} />);
    expect(screen.getByText('tag1')).toBeInTheDocument();
    expect(screen.getByText('tag2')).toBeInTheDocument();
  });

  it('should render comma-separated string as badges', () => {
    render(<MultiSelectRenderer value="tag1, tag2, tag3" property={mockProperty} readOnly={true} />);
    expect(screen.getByText('tag1')).toBeInTheDocument();
    expect(screen.getByText('tag2')).toBeInTheDocument();
    expect(screen.getByText('tag3')).toBeInTheDocument();
  });

  it('should render empty state for null', () => {
    render(<MultiSelectRenderer value={null} property={mockProperty} readOnly={true} />);
    expect(screen.getByText('Empty')).toBeInTheDocument();
  });

  it('should render empty state for empty array', () => {
    render(<MultiSelectRenderer value={[]} property={mockProperty} readOnly={true} />);
    expect(screen.getByText('Empty')).toBeInTheDocument();
  });
});

describe('MultiSelectEditor', () => {
  let mockOnChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnChange = vi.fn();
  });

  it('should render input with array value', () => {
    render(<MultiSelectEditor value={['tag1', 'tag2']} onChange={mockOnChange} property={mockProperty} />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('tag1, tag2');
  });

  it('should call onChange when typing', async () => {
    const user = userEvent.setup();
    render(<MultiSelectEditor value={[]} onChange={mockOnChange} property={mockProperty} />);
    
    const input = screen.getByRole('textbox');
    await user.type(input, 'new-tag');
    
    expect(mockOnChange).toHaveBeenCalled();
  });
});

describe('Multi-Select Property Integration', () => {
  it('should work in read-edit-read cycle', async () => {
    const user = userEvent.setup();
    let currentValue: string[] = ['tag1'];
    const onChange = (newValue: unknown) => {
      if (Array.isArray(newValue)) {
        currentValue = newValue;
      } else if (typeof newValue === 'string') {
        currentValue = newValue.split(',').map(v => v.trim()).filter(Boolean);
      }
    };

    let result = render(<MultiSelectRenderer value={currentValue} property={mockProperty} readOnly={true} />);
    expect(screen.getByText('tag1')).toBeInTheDocument();
    result.unmount();

    result = render(<MultiSelectEditor value={currentValue} property={mockProperty} onChange={onChange} />);
    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, 'tag1, tag2, tag3');
    expect(currentValue.length).toBeGreaterThanOrEqual(1);
    result.unmount();

    result = render(<MultiSelectRenderer value={currentValue} property={mockProperty} readOnly={true} />);
    expect(screen.getByText('tag1')).toBeInTheDocument();
  });
});
