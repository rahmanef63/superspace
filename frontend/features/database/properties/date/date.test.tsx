/**
 * Date Property - Unit Tests
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { datePropertyConfig } from './config';
import { DateRenderer } from './DateRenderer';
import { DateEditor } from './DateEditor';
import type { Property } from '@/frontend/shared/foundation/types/universal-database';

const mockProperty: Property = {
  key: 'testDate',
  name: 'Date',
  type: 'date',
};

describe('datePropertyConfig', () => {
  it('should have correct type', () => {
    expect(datePropertyConfig.type).toBe('date');
  });

  it('should have correct label', () => {
    expect(datePropertyConfig.label).toBe('Date');
  });

  it('should be in core category', () => {
    expect(datePropertyConfig.category).toBe('core');
  });

  it('should have correct capabilities', () => {
    expect(datePropertyConfig.supportsDefault).toBe(true);
    expect(datePropertyConfig.isEditable).toBe(true);
  });

  it('should have icon component', () => {
    expect(datePropertyConfig.icon).toBeDefined();
  });
});

describe('datePropertyConfig.validate', () => {
  it('should accept valid ISO date strings', () => {
    expect(datePropertyConfig.validate?.('2024-01-15', mockProperty)).toBeNull();
    expect(datePropertyConfig.validate?.('2024-12-31T23:59:59Z', mockProperty)).toBeNull();
  });

  it('should accept valid date objects', () => {
    const date = new Date('2024-01-15');
    expect(datePropertyConfig.validate?.(date.toISOString(), mockProperty)).toBeNull();
  });

  it('should accept null/undefined', () => {
    expect(datePropertyConfig.validate?.(null, mockProperty)).toBeNull();
    expect(datePropertyConfig.validate?.(undefined, mockProperty)).toBeNull();
  });

  it('should reject invalid date strings', () => {
    expect(datePropertyConfig.validate?.('not-a-date', mockProperty)).toBe('Invalid date format');
    expect(datePropertyConfig.validate?.('2024-13-45', mockProperty)).toBe('Invalid date format');
  });
});

describe('datePropertyConfig.format', () => {
  it('should format dates in US format', () => {
    const result = datePropertyConfig.format?.('2024-01-15');
    expect(result).toBe('Jan 15, 2024');
  });

  it('should handle different month names', () => {
    expect(datePropertyConfig.format?.('2024-03-20')).toBe('Mar 20, 2024');
    expect(datePropertyConfig.format?.('2024-12-25')).toBe('Dec 25, 2024');
  });

  it('should return empty string for null', () => {
    expect(datePropertyConfig.format?.(null)).toBe('');
  });

  it('should return empty string for invalid dates', () => {
    expect(datePropertyConfig.format?.('invalid')).toBe('');
  });
});

describe('DateRenderer', () => {
  it('should render formatted date', () => {
    render(<DateRenderer value="2024-01-15" property={mockProperty} readOnly={true} />);
    expect(screen.getByText('Jan 15, 2024')).toBeInTheDocument();
  });

  it('should render calendar icon', () => {
    const { container } = render(<DateRenderer value="2024-01-15" property={mockProperty} readOnly={true} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('should render empty state for null', () => {
    render(<DateRenderer value={null} property={mockProperty} readOnly={true} />);
    expect(screen.getByText('Empty')).toBeInTheDocument();
  });

  it('should show error for invalid date', () => {
    render(<DateRenderer value="invalid" property={mockProperty} readOnly={true} />);
    expect(screen.getByText('Invalid date')).toBeInTheDocument();
  });
});

describe('DateEditor', () => {
  let mockOnChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnChange = vi.fn();
  });

  it('should render date input with value', () => {
    const { container } = render(<DateEditor value="2024-01-15T00:00:00Z" onChange={mockOnChange} property={mockProperty} />);
    const input = container.querySelector('input[type="date"]') as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.value).toBe('2024-01-15');
  });

  it('should have type="date" attribute', () => {
    const { container } = render(<DateEditor value="" onChange={mockOnChange} property={mockProperty} />);
    const input = container.querySelector('input');
    expect(input).toHaveAttribute('type', 'date');
  });

  it('should call onChange when typing', async () => {
    const user = userEvent.setup();
    const { container } = render(<DateEditor value="" onChange={mockOnChange} property={mockProperty} />);
    
    const input = container.querySelector('input') as HTMLInputElement;
    await user.type(input, '2024-01-15');
    
    expect(mockOnChange).toHaveBeenCalled();
  });

  it('should call onChange with null when cleared', async () => {
    const user = userEvent.setup();
    const { container } = render(<DateEditor value="2024-01-15" onChange={mockOnChange} property={mockProperty} />);
    
    const input = container.querySelector('input') as HTMLInputElement;
    await user.clear(input);
    
    expect(mockOnChange).toHaveBeenCalledWith(null);
  });

  it('should update when value prop changes', () => {
    const { rerender, container } = render(<DateEditor value="2024-01-15" onChange={mockOnChange} property={mockProperty} />);
    let input = container.querySelector('input') as HTMLInputElement;
    expect(input.value).toBe('2024-01-15');

    rerender(<DateEditor value="2024-12-31" onChange={mockOnChange} property={mockProperty} />);
    input = container.querySelector('input') as HTMLInputElement;
    expect(input.value).toBe('2024-12-31');
  });
});

describe('Date Property Integration', () => {
  it('should work in read-edit-read cycle', async () => {
    const user = userEvent.setup();
    let currentValue = '2024-01-15T00:00:00Z';
    const onChange = (newValue: unknown) => {
      currentValue = String(newValue);
    };

    let result = render(<DateRenderer value={currentValue} property={mockProperty} readOnly={true} />);
    expect(screen.getByText('Jan 15, 2024')).toBeInTheDocument();
    result.unmount();

    result = render(<DateEditor value={currentValue} property={mockProperty} onChange={onChange} />);
    const input = result.container.querySelector('input') as HTMLInputElement;
    await user.clear(input);
    await user.type(input, '2024-12-25');
    expect(new Date(currentValue).getMonth() + 1).toBe(12);
    expect(new Date(currentValue).getDate()).toBe(25);
    result.unmount();

    result = render(<DateRenderer value={currentValue} property={mockProperty} readOnly={true} />);
    expect(screen.getByText('Dec 25, 2024')).toBeInTheDocument();
  });
});

describe('Date Property Edge Cases', () => {
  it('should handle leap year dates', () => {
    render(<DateRenderer value="2024-02-29" property={mockProperty} readOnly={true} />);
    expect(screen.getByText('Feb 29, 2024')).toBeInTheDocument();
  });

  it('should handle year boundaries', () => {
    render(<DateRenderer value="2024-01-01" property={mockProperty} readOnly={true} />);
    expect(screen.getByText('Jan 1, 2024')).toBeInTheDocument();
    
    render(<DateRenderer value="2024-12-31" property={mockProperty} readOnly={true} />);
    expect(screen.getByText('Dec 31, 2024')).toBeInTheDocument();
  });

  it('should handle dates with time components', () => {
    render(<DateRenderer value="2024-06-15T14:30:00Z" property={mockProperty} readOnly={true} />);
    expect(screen.getByText('Jun 15, 2024')).toBeInTheDocument();
  });
});
