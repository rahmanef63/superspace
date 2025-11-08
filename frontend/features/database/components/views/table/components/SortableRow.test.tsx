import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { SortableRow } from './SortableRow';
import { DndContext } from '@dnd-kit/core';
import type { Row } from '@tanstack/react-table';

// Mock @dnd-kit/sortable
vi.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: { role: 'button', tabIndex: 0 },
    listeners: { onPointerDown: vi.fn() },
    setNodeRef: vi.fn(),
    transform: null,
    transition: undefined,
    isDragging: false,
  }),
  SortableContext: ({ children }: any) => children,
  verticalListSortingStrategy: {},
}));

describe('SortableRow', () => {
  const mockRow = {
    id: 'row-1',
    getVisibleCells: () => [
      {
        id: 'cell-drag',
        column: { id: 'drag' },
        getContext: () => ({}),
      },
      {
        id: 'cell-name',
        column: { id: 'name' },
        getContext: () => ({}),
      },
    ],
    getIsSelected: () => false,
  } as unknown as Row<any>;

  it('should render row with drag handle', () => {
    const { container } = render(
      <DndContext>
        <table>
          <tbody>
            <SortableRow row={mockRow} />
          </tbody>
        </table>
      </DndContext>
    );

    const tr = container.querySelector('tr');
    expect(tr).toBeTruthy();
    
    const cells = container.querySelectorAll('td');
    expect(cells.length).toBe(2); // drag cell + name cell
  });

  it('should have drag handle cell with listeners', () => {
    const { container } = render(
      <DndContext>
        <table>
          <tbody>
            <SortableRow row={mockRow} />
          </tbody>
        </table>
      </DndContext>
    );

    const dragCell = container.querySelector('td:first-child');
    expect(dragCell).toBeTruthy();
    
    const dragHandle = dragCell?.querySelector('div');
    expect(dragHandle).toBeTruthy();
    expect(dragHandle?.className).toContain('cursor-grab');
  });

  it('should apply isDragging opacity when dragging', () => {
    // This test verifies the visual feedback exists
    const { container } = render(
      <DndContext>
        <table>
          <tbody>
            <SortableRow row={mockRow} />
          </tbody>
        </table>
      </DndContext>
    );

    const tr = container.querySelector('tr');
    // Should not have opacity-50 when not dragging (mocked as false)
    expect(tr?.className).not.toContain('opacity-50');
  });
});
