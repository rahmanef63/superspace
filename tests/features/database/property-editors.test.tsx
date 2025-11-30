/**
 * @vitest-environment jsdom
 * 
 * Using jsdom for Radix UI Dialog and Popover compatibility
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NumberEditor } from '@/frontend/features/database/properties/number/NumberEditor';
import { SelectEditor } from '@/frontend/features/database/properties/select/SelectEditor';
import { MultiSelectEditor } from '@/frontend/features/database/properties/multi_select/MultiSelectEditor';
import type { Property } from '@/frontend/shared/foundation/types/universal-database';
import type { SelectOptions } from '@/frontend/shared/foundation/types/property-options';

describe('Property Editors', () => {
  describe('NumberEditor', () => {
    const mockProperty: Property = {
      key: 'test-number',
      name: 'Number',
      type: 'number',
      isRequired: false,
    };

    it('should accept valid numbers', async () => {
      const onChange = vi.fn();
      render(
        <NumberEditor
          value={null}
          onChange={onChange}
          property={mockProperty}
        />
      );

      const input = screen.getByRole('textbox');
      await userEvent.type(input, '123');

      expect(onChange).toHaveBeenCalledWith(123);
    });

    it('should accept decimal numbers', async () => {
      const onChange = vi.fn();
      render(
        <NumberEditor
          value={null}
          onChange={onChange}
          property={mockProperty}
        />
      );

      const input = screen.getByRole('textbox');
      await userEvent.type(input, '123.45');

      expect(onChange).toHaveBeenCalledWith(123.45);
    });

    it('should show validation dialog for special characters', async () => {
      const onChange = vi.fn();
      render(
        <NumberEditor
          value={null}
          onChange={onChange}
          property={mockProperty}
        />
      );

      const input = screen.getByRole('textbox');
      
      // Type invalid special characters
      await userEvent.type(input, '@#$');

      // Validation dialog should appear
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      }, { timeout: 2000 });

      // Should not call onChange with invalid value
      expect(onChange).not.toHaveBeenCalled();
    });

    it('should accept numbers with thousand separators', async () => {
      const onChange = vi.fn();
      render(
        <NumberEditor
          value={null}
          onChange={onChange}
          property={mockProperty}
        />
      );

      const input = screen.getByRole('textbox');
      await userEvent.type(input, '1,234,567');

      expect(onChange).toHaveBeenCalledWith(1234567);
    });

    it('should clear value when input is empty', async () => {
      const onChange = vi.fn();
      render(
        <NumberEditor
          value={123}
          onChange={onChange}
          property={mockProperty}
        />
      );

      const input = screen.getByRole('textbox');
      await userEvent.clear(input);

      expect(onChange).toHaveBeenCalledWith(null);
    });

    it('should show validation dialog for invalid input', async () => {
      const onChange = vi.fn();
      render(
        <NumberEditor
          value={null}
          onChange={onChange}
          property={mockProperty}
        />
      );

      const input = screen.getByRole('textbox');
      
      // Type invalid characters - this should trigger the validation dialog
      await userEvent.type(input, 'abc');

      // Validation dialog should appear with the error message
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      }, { timeout: 2000 });
      
      // Check dialog title specifically
      const dialog = screen.getByRole('dialog');
      expect(within(dialog).getByText('Input Tidak Valid')).toBeInTheDocument();

      // Should not call onChange with invalid value
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('SelectEditor', () => {
    const mockSelectOptions: SelectOptions = {
      choices: [
        { id: 'opt1', name: 'Option 1', color: '#6b7280' },
        { id: 'opt2', name: 'Option 2', color: '#3b82f6' },
        { id: 'opt3', name: 'Option 3', color: '#10b981' },
      ],
      allowCreate: true,
    };

    const mockProperty: Property = {
      key: 'test-select',
      name: 'Select',
      type: 'select',
      isRequired: false,
      options: mockSelectOptions,
    };

    it('should render with default choices when no options provided', () => {
      const propertyWithoutOptions = { ...mockProperty, options: undefined };
      const onChange = vi.fn();
      
      render(
        <SelectEditor
          value={null}
          onChange={onChange}
          property={propertyWithoutOptions}
        />
      );

      const button = screen.getByRole('combobox');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent(/pilih opsi/i);
    });

    it('should open dropdown on click', async () => {
      const onChange = vi.fn();
      render(
        <SelectEditor
          value={null}
          onChange={onChange}
          property={mockProperty}
        />
      );

      const button = screen.getByRole('combobox');
      await userEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Option 1')).toBeInTheDocument();
        expect(screen.getByText('Option 2')).toBeInTheDocument();
        expect(screen.getByText('Option 3')).toBeInTheDocument();
      });
    });

    it('should select an option', async () => {
      const onChange = vi.fn();
      render(
        <SelectEditor
          value={null}
          onChange={onChange}
          property={mockProperty}
        />
      );

      const button = screen.getByRole('combobox');
      await userEvent.click(button);

      const option1 = await screen.findByText('Option 1');
      await userEvent.click(option1);

      expect(onChange).toHaveBeenCalledWith('Option 1');
    });

    it('should display selected value', () => {
      const onChange = vi.fn();
      render(
        <SelectEditor
          value="Option 2"
          onChange={onChange}
          property={mockProperty}
        />
      );

      expect(screen.getByText('Option 2')).toBeInTheDocument();
    });

    it('should clear selection when clicking X icon', async () => {
      const onChange = vi.fn();
      render(
        <SelectEditor
          value="Option 1"
          onChange={onChange}
          property={mockProperty}
        />
      );

      // The X icon is inside the combobox button, find it by its class
      const combobox = screen.getByRole('combobox');
      const clearIcon = combobox.querySelector('svg.lucide-x');
      
      expect(clearIcon).toBeInTheDocument();
      
      // Click the X icon to clear
      await userEvent.click(clearIcon!);

      expect(onChange).toHaveBeenCalledWith(null);
    });

    it('should show create options when searching for new value', async () => {
      const onChange = vi.fn();
      render(
        <SelectEditor
          value={null}
          onChange={onChange}
          property={mockProperty}
        />
      );

      const button = screen.getByRole('combobox');
      await userEvent.click(button);

      const searchInput = screen.getByPlaceholderText(/cari/i);
      await userEvent.type(searchInput, 'New Option');

      await waitFor(() => {
        expect(screen.getByText(/buat.*new option.*warna acak/i)).toBeInTheDocument();
        expect(screen.getByText(/buat dengan pilih warna/i)).toBeInTheDocument();
      });
    });
  });

  describe('MultiSelectEditor', () => {
    const mockSelectOptions: SelectOptions = {
      choices: [
        { id: 'opt1', name: 'Tag 1', color: '#6b7280' },
        { id: 'opt2', name: 'Tag 2', color: '#3b82f6' },
        { id: 'opt3', name: 'Tag 3', color: '#10b981' },
      ],
      allowCreate: true,
    };

    const mockProperty: Property = {
      key: 'test-multi-select',
      name: 'Multi-Select',
      type: 'multi_select',
      isRequired: false,
      options: mockSelectOptions,
    };

    it('should render with default choices when no options provided', () => {
      const propertyWithoutOptions = { ...mockProperty, options: undefined };
      const onChange = vi.fn();
      
      render(
        <MultiSelectEditor
          value={null}
          onChange={onChange}
          property={propertyWithoutOptions}
        />
      );

      const button = screen.getByRole('combobox');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent(/pilih opsi/i);
    });

    it('should open dropdown on click', async () => {
      const onChange = vi.fn();
      render(
        <MultiSelectEditor
          value={null}
          onChange={onChange}
          property={mockProperty}
        />
      );

      const button = screen.getByRole('combobox');
      await userEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Tag 1')).toBeInTheDocument();
        expect(screen.getByText('Tag 2')).toBeInTheDocument();
        expect(screen.getByText('Tag 3')).toBeInTheDocument();
      });
    });

    it('should display selected values as badges', () => {
      const onChange = vi.fn();
      render(
        <MultiSelectEditor
          value={['Tag 1', 'Tag 2']}
          onChange={onChange}
          property={mockProperty}
        />
      );

      // Should show badges in the button
      const badges = screen.getAllByText(/Tag [12]/);
      expect(badges.length).toBeGreaterThanOrEqual(2);
    });

    it('should remove individual badge when clicking X icon', async () => {
      const onChange = vi.fn();
      render(
        <MultiSelectEditor
          value={['Tag 1', 'Tag 2']}
          onChange={onChange}
          property={mockProperty}
        />
      );

      // Find the badges in the combobox
      const combobox = screen.getByRole('combobox');
      
      // Find X icons within badges - they have lucide-x class
      const xIcons = combobox.querySelectorAll('svg.lucide-x');
      expect(xIcons.length).toBeGreaterThanOrEqual(2);
      
      // Click the first X icon to remove Tag 1
      await userEvent.click(xIcons[0]);

      expect(onChange).toHaveBeenCalledWith(['Tag 2']);
    });

    it('should select an option from the dropdown', async () => {
      const onChange = vi.fn();
      render(
        <MultiSelectEditor
          value={null}
          onChange={onChange}
          property={mockProperty}
        />
      );

      const button = screen.getByRole('combobox');
      await userEvent.click(button);

      // Wait for dropdown and find the CommandItem
      const tag1Option = await screen.findByRole('option', { name: /tag 1/i });
      await userEvent.click(tag1Option);

      expect(onChange).toHaveBeenCalledWith(['Tag 1']);
    });

    it('should deselect when clicking already selected option', async () => {
      const onChange = vi.fn();
      render(
        <MultiSelectEditor
          value={['Tag 1']}
          onChange={onChange}
          property={mockProperty}
        />
      );

      const button = screen.getByRole('combobox');
      await userEvent.click(button);

      // Find and click the selected option to deselect
      const tag1Option = await screen.findByRole('option', { name: /tag 1/i });
      await userEvent.click(tag1Option);

      // Deselecting should call onChange with null (empty array becomes null)
      expect(onChange).toHaveBeenCalledWith(null);
    });

    it('should show create options when searching for new tag', async () => {
      const onChange = vi.fn();
      render(
        <MultiSelectEditor
          value={null}
          onChange={onChange}
          property={mockProperty}
        />
      );

      const button = screen.getByRole('combobox');
      await userEvent.click(button);

      const searchInput = screen.getByPlaceholderText(/cari/i);
      await userEvent.type(searchInput, 'New Tag');

      await waitFor(() => {
        expect(screen.getByText(/buat.*new tag.*warna acak/i)).toBeInTheDocument();
        expect(screen.getByText(/buat dengan pilih warna/i)).toBeInTheDocument();
      });
    });
  });
});
