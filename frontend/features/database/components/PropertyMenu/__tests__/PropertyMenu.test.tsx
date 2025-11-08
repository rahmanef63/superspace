/**
 * Property Menu CRUD Operations Test Suite
 * 
 * Comprehensive tests for all PropertyMenu handlers:
 * - Create (Insert, Duplicate)
 * - Read (Menu display, submenu)
 * - Update (Rename, Format, Required, Hide, Move)
 * - Delete (Permanent deletion)
 * 
 * Tests use Shadcn Dialog components (not window.prompt/confirm/alert)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PropertyMenu } from '../PropertyMenu';
import type { DatabaseField } from '../../../types';

// Mock toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock field data
const mockNumberField: DatabaseField = {
  _id: 'field_123' as any,
  _creationTime: Date.now(),
  tableId: 'table_456' as any,
  name: 'Price',
  type: 'number',
  position: 0,
  isRequired: false,
  isPrimary: false,
};

const mockSelectField: DatabaseField = {
  _id: 'field_124' as any,
  _creationTime: Date.now(),
  tableId: 'table_456' as any,
  name: 'Status',
  type: 'select',
  position: 1,
  isRequired: false,
  isPrimary: false,
  options: {
    selectOptions: [
      { id: '1', name: 'Active', color: 'green' },
      { id: '2', name: 'Inactive', color: 'gray' },
    ],
  },
};

const mockDateField: DatabaseField = {
  _id: 'field_125' as any,
  _creationTime: Date.now(),
  tableId: 'table_456' as any,
  name: 'Due Date',
  type: 'date',
  position: 2,
  isRequired: true,
  isPrimary: false,
};

describe('PropertyMenu - CRUD Operations', () => {
  let user: ReturnType<typeof userEvent.setup>;
  
  beforeEach(() => {
    user = userEvent.setup();
  });

  describe('READ Operations', () => {
    it('should display property menu with all sections', async () => {
      const onRename = vi.fn();
      const onDelete = vi.fn();
      
      render(
        <PropertyMenu
          field={mockNumberField}
          onRename={onRename}
          onDelete={onDelete}
        />
      );

      // Open menu
      const trigger = screen.getByRole('button', { name: /property menu/i });
      await user.click(trigger);

      // Check sections present
      expect(screen.getByText('Rename')).toBeInTheDocument();
      expect(screen.getByText('Duplicate')).toBeInTheDocument();
      expect(screen.getByText('Sort ascending')).toBeInTheDocument();
      expect(screen.getByText('Sort descending')).toBeInTheDocument();
      expect(screen.getByText('Filter')).toBeInTheDocument();
      expect(screen.getByText('Calculate')).toBeInTheDocument();
      expect(screen.getByText('Insert left')).toBeInTheDocument();
      expect(screen.getByText('Insert right')).toBeInTheDocument();
      expect(screen.getByText('Move left')).toBeInTheDocument();
      expect(screen.getByText('Move right')).toBeInTheDocument();
      expect(screen.getByText('Toggle required')).toBeInTheDocument();
      expect(screen.getByText('Hide')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('should display type-specific items for Number property', async () => {
      render(<PropertyMenu field={mockNumberField} />);

      const trigger = screen.getByRole('button', { name: /property menu/i });
      await user.click(trigger);

      // Check Number-specific items
      expect(screen.getByText('Set Format')).toBeInTheDocument();
      expect(screen.getByText('Show As')).toBeInTheDocument();
    });

    it('should display submenu for Calculate with overrides', async () => {
      render(<PropertyMenu field={mockNumberField} />);

      const trigger = screen.getByRole('button', { name: /property menu/i });
      await user.click(trigger);

      // Hover over Calculate to show submenu
      const calculateItem = screen.getByText('Calculate');
      await user.hover(calculateItem);

      // Wait for submenu to appear
      await waitFor(() => {
        expect(screen.getByText('Sum')).toBeInTheDocument();
        expect(screen.getByText('Average')).toBeInTheDocument();
        expect(screen.getByText('Median')).toBeInTheDocument();
        expect(screen.getByText('Min')).toBeInTheDocument();
        expect(screen.getByText('Max')).toBeInTheDocument();
      });
    });

    it('should display type-specific items for Select property', async () => {
      render(<PropertyMenu field={mockSelectField} />);

      const trigger = screen.getByRole('button', { name: /property menu/i });
      await user.click(trigger);

      // Check Select-specific items
      expect(screen.getByText('Edit Options')).toBeInTheDocument();
      expect(screen.getByText('Manage Colors')).toBeInTheDocument();
    });

    it('should display type-specific items for Date property', async () => {
      render(<PropertyMenu field={mockDateField} />);

      const trigger = screen.getByRole('button', { name: /property menu/i });
      await user.click(trigger);

      // Check Date-specific items
      expect(screen.getByText('Date Format')).toBeInTheDocument();
      expect(screen.getByText('Time Format')).toBeInTheDocument();
      expect(screen.getByText('Notifications')).toBeInTheDocument();
    });
  });

  describe('CREATE Operations', () => {
    it('should call onDuplicate when duplicate clicked', async () => {
      const onDuplicate = vi.fn().mockResolvedValue(undefined);
      
      render(
        <PropertyMenu field={mockNumberField} onDuplicate={onDuplicate} />
      );

      const trigger = screen.getByRole('button', { name: /property menu/i });
      await user.click(trigger);

      const duplicateItem = screen.getByText('Duplicate');
      await user.click(duplicateItem);

      await waitFor(() => {
        expect(onDuplicate).toHaveBeenCalledWith('field_123');
      });
    });

    it('should call onInsertLeft when insert left clicked', async () => {
      const onInsertLeft = vi.fn().mockResolvedValue(undefined);
      
      render(
        <PropertyMenu field={mockNumberField} onInsertLeft={onInsertLeft} />
      );

      const trigger = screen.getByRole('button', { name: /property menu/i });
      await user.click(trigger);

      const insertItem = screen.getByText('Insert left');
      await user.click(insertItem);

      await waitFor(() => {
        expect(onInsertLeft).toHaveBeenCalledWith('field_123');
      });
    });

    it('should call onInsertRight when insert right clicked', async () => {
      const onInsertRight = vi.fn().mockResolvedValue(undefined);
      
      render(
        <PropertyMenu field={mockNumberField} onInsertRight={onInsertRight} />
      );

      const trigger = screen.getByRole('button', { name: /property menu/i });
      await user.click(trigger);

      const insertItem = screen.getByText('Insert right');
      await user.click(insertItem);

      await waitFor(() => {
        expect(onInsertRight).toHaveBeenCalledWith('field_123');
      });
    });
  });

  describe('UPDATE Operations', () => {
    describe('Rename', () => {
      it('should open rename dialog when rename clicked', async () => {
        const onRename = vi.fn().mockResolvedValue(undefined);
        
        render(
          <PropertyMenu field={mockNumberField} onRename={onRename} />
        );

        const trigger = screen.getByRole('button', { name: /property menu/i });
        await user.click(trigger);

        const renameItem = screen.getByText('Rename');
        await user.click(renameItem);

        // Check dialog appears
        await waitFor(() => {
          expect(screen.getByRole('dialog')).toBeInTheDocument();
          expect(screen.getByText('Rename property')).toBeInTheDocument();
          expect(screen.getByLabelText('Property name')).toHaveValue('Price');
        });
      });

      it('should call onRename with new name when confirmed', async () => {
        const onRename = vi.fn().mockResolvedValue(undefined);
        
        render(
          <PropertyMenu field={mockNumberField} onRename={onRename} />
        );

        const trigger = screen.getByRole('button', { name: /property menu/i });
        await user.click(trigger);

        const renameItem = screen.getByText('Rename');
        await user.click(renameItem);

        // Enter new name
        const input = await screen.findByLabelText('Property name');
        await user.clear(input);
        await user.type(input, 'Unit Price');

        // Confirm
        const confirmButton = screen.getByRole('button', { name: /^rename$/i });
        await user.click(confirmButton);

        await waitFor(() => {
          expect(onRename).toHaveBeenCalledWith('field_123', 'Unit Price');
        });
      });

      it('should not call onRename when cancelled', async () => {
        const onRename = vi.fn();
        
        render(
          <PropertyMenu field={mockNumberField} onRename={onRename} />
        );

        const trigger = screen.getByRole('button', { name: /property menu/i });
        await user.click(trigger);

        const renameItem = screen.getByText('Rename');
        await user.click(renameItem);

        // Cancel
        const cancelButton = await screen.findByRole('button', { name: /cancel/i });
        await user.click(cancelButton);

        expect(onRename).not.toHaveBeenCalled();
      });
    });

    describe('Format Changes', () => {
      it('should call onSetFormat with format value', async () => {
        const onSetFormat = vi.fn().mockResolvedValue(undefined);
        
        render(
          <PropertyMenu field={mockNumberField} onSetFormat={onSetFormat} />
        );

        const trigger = screen.getByRole('button', { name: /property menu/i });
        await user.click(trigger);

        // Hover over Set Format to show submenu
        const formatItem = screen.getByText('Set Format');
        await user.hover(formatItem);

        // Click submenu item
        await waitFor(async () => {
          const numberOption = await screen.findByText('Number');
          await user.click(numberOption);
        });

        await waitFor(() => {
          expect(onSetFormat).toHaveBeenCalledWith('field_123', 'Number');
        });
      });

      it('should call onShowAs with display type', async () => {
        const onShowAs = vi.fn().mockResolvedValue(undefined);
        
        render(
          <PropertyMenu field={mockNumberField} onShowAs={onShowAs} />
        );

        const trigger = screen.getByRole('button', { name: /property menu/i });
        await user.click(trigger);

        // Hover over Show As to show submenu
        const showAsItem = screen.getByText('Show As');
        await user.hover(showAsItem);

        // Click submenu item
        await waitFor(async () => {
          const barOption = await screen.findByText('Bar');
          await user.click(barOption);
        });

        await waitFor(() => {
          expect(onShowAs).toHaveBeenCalledWith('field_123', 'Bar');
        });
      });
    });

    describe('Toggle Required', () => {
      it('should call onToggleRequired with opposite value', async () => {
        const onToggleRequired = vi.fn().mockResolvedValue(undefined);
        
        render(
          <PropertyMenu
            field={mockNumberField}
            isRequired={false}
            onToggleRequired={onToggleRequired}
          />
        );

        const trigger = screen.getByRole('button', { name: /property menu/i });
        await user.click(trigger);

        const toggleItem = screen.getByText('Toggle required');
        await user.click(toggleItem);

        await waitFor(() => {
          expect(onToggleRequired).toHaveBeenCalledWith('field_123', true);
        });
      });
    });

    describe('Hide', () => {
      it('should call onHide when hide clicked', async () => {
        const onHide = vi.fn().mockResolvedValue(undefined);
        
        render(
          <PropertyMenu field={mockNumberField} onHide={onHide} />
        );

        const trigger = screen.getByRole('button', { name: /property menu/i });
        await user.click(trigger);

        const hideItem = screen.getByText('Hide');
        await user.click(hideItem);

        await waitFor(() => {
          expect(onHide).toHaveBeenCalledWith('field_123');
        });
      });
    });

    describe('Move', () => {
      it('should call onMoveLeft when move left clicked', async () => {
        const onMoveLeft = vi.fn().mockResolvedValue(undefined);
        
        render(
          <PropertyMenu field={mockNumberField} onMoveLeft={onMoveLeft} />
        );

        const trigger = screen.getByRole('button', { name: /property menu/i });
        await user.click(trigger);

        const moveItem = screen.getByText('Move left');
        await user.click(moveItem);

        await waitFor(() => {
          expect(onMoveLeft).toHaveBeenCalledWith('field_123');
        });
      });

      it('should call onMoveRight when move right clicked', async () => {
        const onMoveRight = vi.fn().mockResolvedValue(undefined);
        
        render(
          <PropertyMenu field={mockNumberField} onMoveRight={onMoveRight} />
        );

        const trigger = screen.getByRole('button', { name: /property menu/i });
        await user.click(trigger);

        const moveItem = screen.getByText('Move right');
        await user.click(moveItem);

        await waitFor(() => {
          expect(onMoveRight).toHaveBeenCalledWith('field_123');
        });
      });
    });
  });

  describe('DELETE Operations', () => {
    it('should open delete dialog when delete clicked', async () => {
      const onDelete = vi.fn().mockResolvedValue(undefined);
      
      render(
        <PropertyMenu field={mockNumberField} onDelete={onDelete} />
      );

      const trigger = screen.getByRole('button', { name: /property menu/i });
      await user.click(trigger);

      const deleteItem = screen.getByText('Delete');
      await user.click(deleteItem);

      // Check dialog appears
      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
        expect(screen.getByText(/Delete property "Price"/i)).toBeInTheDocument();
        expect(screen.getByText(/This will remove the property/i)).toBeInTheDocument();
      });
    });

    it('should call onDelete when confirmed', async () => {
      const onDelete = vi.fn().mockResolvedValue(undefined);
      
      render(
        <PropertyMenu field={mockNumberField} onDelete={onDelete} />
      );

      const trigger = screen.getByRole('button', { name: /property menu/i });
      await user.click(trigger);

      const deleteItem = screen.getByText('Delete');
      await user.click(deleteItem);

      // Confirm deletion
      const confirmButton = await screen.findByRole('button', { name: /^delete$/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(onDelete).toHaveBeenCalledWith('field_123');
      });
    });

    it('should not call onDelete when cancelled', async () => {
      const onDelete = vi.fn();
      
      render(
        <PropertyMenu field={mockNumberField} onDelete={onDelete} />
      );

      const trigger = screen.getByRole('button', { name: /property menu/i });
      await user.click(trigger);

      const deleteItem = screen.getByText('Delete');
      await user.click(deleteItem);

      // Cancel deletion
      const cancelButton = await screen.findByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(onDelete).not.toHaveBeenCalled();
    });
  });

  describe('Data Operations', () => {
    it('should call onSort with asc direction', async () => {
      const onSort = vi.fn();
      
      render(
        <PropertyMenu field={mockNumberField} onSort={onSort} />
      );

      const trigger = screen.getByRole('button', { name: /property menu/i });
      await user.click(trigger);

      const sortItem = screen.getByText('Sort ascending');
      await user.click(sortItem);

      expect(onSort).toHaveBeenCalledWith('field_123', 'asc');
    });

    it('should call onSort with desc direction', async () => {
      const onSort = vi.fn();
      
      render(
        <PropertyMenu field={mockNumberField} onSort={onSort} />
      );

      const trigger = screen.getByRole('button', { name: /property menu/i });
      await user.click(trigger);

      const sortItem = screen.getByText('Sort descending');
      await user.click(sortItem);

      expect(onSort).toHaveBeenCalledWith('field_123', 'desc');
    });

    it('should call onFilter when filter clicked', async () => {
      const onFilter = vi.fn();
      
      render(
        <PropertyMenu field={mockNumberField} onFilter={onFilter} />
      );

      const trigger = screen.getByRole('button', { name: /property menu/i });
      await user.click(trigger);

      const filterItem = screen.getByText('Filter');
      await user.click(filterItem);

      expect(onFilter).toHaveBeenCalledWith('field_123');
    });

    it('should call onCalculate with aggregation type from submenu', async () => {
      const onCalculate = vi.fn();
      
      render(
        <PropertyMenu field={mockNumberField} onCalculate={onCalculate} />
      );

      const trigger = screen.getByRole('button', { name: /property menu/i });
      await user.click(trigger);

      // Hover over Calculate
      const calculateItem = screen.getByText('Calculate');
      await user.hover(calculateItem);

      // Click submenu item
      await waitFor(async () => {
        const sumOption = await screen.findByText('Sum');
        await user.click(sumOption);
      });

      await waitFor(() => {
        expect(onCalculate).toHaveBeenCalledWith('field_123', 'Sum');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle rename error gracefully', async () => {
      const onRename = vi.fn().mockRejectedValue(new Error('Network error'));
      const mockToast = vi.fn();
      
      vi.mocked(require('@/hooks/use-toast').useToast).mockReturnValue({
        toast: mockToast,
      });
      
      render(
        <PropertyMenu field={mockNumberField} onRename={onRename} />
      );

      const trigger = screen.getByRole('button', { name: /property menu/i });
      await user.click(trigger);

      const renameItem = screen.getByText('Rename');
      await user.click(renameItem);

      const input = await screen.findByLabelText('Property name');
      await user.clear(input);
      await user.type(input, 'New Name');

      const confirmButton = screen.getByRole('button', { name: /^rename$/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            variant: 'destructive',
            title: 'Failed to rename property',
          })
        );
      });
    });

    it('should handle delete error gracefully', async () => {
      const onDelete = vi.fn().mockRejectedValue(new Error('Permission denied'));
      const mockToast = vi.fn();
      
      vi.mocked(require('@/hooks/use-toast').useToast).mockReturnValue({
        toast: mockToast,
      });
      
      render(
        <PropertyMenu field={mockNumberField} onDelete={onDelete} />
      );

      const trigger = screen.getByRole('button', { name: /property menu/i });
      await user.click(trigger);

      const deleteItem = screen.getByText('Delete');
      await user.click(deleteItem);

      const confirmButton = await screen.findByRole('button', { name: /^delete$/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            variant: 'destructive',
            title: 'Failed to delete property',
          })
        );
      });
    });
  });
});
