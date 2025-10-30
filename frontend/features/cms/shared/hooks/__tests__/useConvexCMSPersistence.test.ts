import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useConvexCMSPersistence } from '../useConvexCMSPersistence';

vi.mock('@/frontend/shared/foundation', () => ({
  useCMSCollections: vi.fn(),
  useCreateCollection: vi.fn(),
  useUpdateCollection: vi.fn(),
  useDeleteCollection: vi.fn()
}));

vi.mock('@/frontend/shared/context/ConvexWorkspaceContext', () => ({
  useConvexWorkspaceContext: vi.fn()
}));

describe('useConvexCMSPersistence', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should initialize with empty state', () => {
    const { useCMSCollections } = require('@/frontend/shared/foundation');
    const { useConvexWorkspaceContext } = require('@/frontend/shared/context/ConvexWorkspaceContext');
    
    useCMSCollections.mockReturnValue({ collections: [], loading: false });
    useConvexWorkspaceContext.mockReturnValue({
      currentWorkspace: { _id: 'ws-1' },
      currentUser: { _id: 'user-1' }
    });

    const { result } = renderHook(() =>
      useConvexCMSPersistence([], [], vi.fn(), vi.fn())
    );

    expect(result.current.collections).toEqual([]);
    expect(result.current.currentCollection).toBeUndefined();
    expect(result.current.isDirty).toBe(false);
  });

  it('should save collection successfully', async () => {
    const { useCMSCollections, useCreateCollection } = require('@/frontend/shared/foundation');
    const { useConvexWorkspaceContext } = require('@/frontend/shared/context/ConvexWorkspaceContext');
    
    const mockCreate = vi.fn().mockResolvedValue('collection-1');
    useCMSCollections.mockReturnValue({ collections: [], loading: false });
    useCreateCollection.mockReturnValue({ mutate: mockCreate });
    useConvexWorkspaceContext.mockReturnValue({
      currentWorkspace: { _id: 'ws-1' },
      currentUser: { _id: 'user-1' }
    });

    const { result } = renderHook(() =>
      useConvexCMSPersistence([], [], vi.fn(), vi.fn())
    );

    await result.current.saveCollection('Test Collection');

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        workspaceId: 'ws-1',
        label: 'Test Collection'
      })
    );
  });

  it('should mark as dirty when nodes change', async () => {
    const { useCMSCollections } = require('@/frontend/shared/foundation');
    const { useConvexWorkspaceContext } = require('@/frontend/shared/context/ConvexWorkspaceContext');
    
    useCMSCollections.mockReturnValue({ collections: [], loading: false });
    useConvexWorkspaceContext.mockReturnValue({
      currentWorkspace: { _id: 'ws-1' },
      currentUser: { _id: 'user-1' }
    });

    const setNodes = vi.fn();
    const { result, rerender } = renderHook(
      ({ nodes }) => useConvexCMSPersistence(nodes, [], setNodes, vi.fn()),
      { initialProps: { nodes: [] } }
    );

    rerender({ nodes: [{ id: '1', type: 'text' }] });

    await waitFor(() => {
      expect(result.current.isDirty).toBe(true);
    });
  });
});
