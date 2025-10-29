import { useState, useEffect, useCallback, useRef } from 'react';
import { Id } from '../../../../../convex/_generated/dataModel';
import {
  useCMSCollections,
  useCreateCollection,
  useUpdateCollection,
  useDeleteCollection
} from '@/frontend/shared/foundation/hooks/useConvexCMS';
import { useConvexWorkspaceContext } from '@/frontend/shared/context/ConvexWorkspaceContext';
import { toSchema, fromSchema } from './useSchemaParser';

interface CMSPersistenceOptions {
  autoSave?: boolean;
  autoSaveDelay?: number;
  onSaveSuccess?: (collectionId: Id<'cms_collections'>) => void;
  onSaveError?: (error: Error) => void;
  onLoadSuccess?: () => void;
  onLoadError?: (error: Error) => void;
}

export function useConvexCMSPersistence(
  nodes: any[],
  edges: any[],
  setNodes: (nodes: any[]) => void,
  setEdges: (edges: any[]) => void,
  options: CMSPersistenceOptions = {}
) {
  const {
    autoSave = true,
    autoSaveDelay = 2000,
    onSaveSuccess,
    onSaveError,
    onLoadSuccess,
    onLoadError
  } = options;

  const { currentWorkspace, currentUser } = useConvexWorkspaceContext();
  const workspaceId = currentWorkspace?._id || null;

  const { collections, loading: collectionsLoading } = useCMSCollections(workspaceId);
  const { mutate: createCollection } = useCreateCollection();
  const { mutate: updateCollection } = useUpdateCollection();
  const { mutate: deleteCollection } = useDeleteCollection();

  const [currentCollectionId, setCurrentCollectionId] = useState<Id<'cms_collections'> | null>(() => {
    const stored = localStorage.getItem('current-cms-collection-id');
    return stored as Id<'cms_collections'> | null;
  });

  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const previousNodesRef = useRef(nodes);
  const previousEdgesRef = useRef(edges);

  const currentCollection = collections?.find(c => c._id === currentCollectionId);

  const saveCollection = useCallback(async (name: string, slug?: string) => {
    if (!workspaceId) {
      throw new Error('No workspace selected');
    }

    setIsSaving(true);
    
    try {
      const schema = toSchema(nodes, edges);
      
      if (currentCollectionId && currentCollection) {
        await updateCollection({
          id: currentCollectionId,
          workspaceId,
          label: name,
          fields: schema
        });
        
        setLastSaved(new Date());
        setIsDirty(false);
        onSaveSuccess?.(currentCollectionId);
        
        return currentCollectionId;
      } else {
        const collectionSlug = slug || name.toLowerCase().replace(/\s+/g, '-');
        const collectionId = await createCollection({
          workspaceId,
          slug: collectionSlug,
          label: name,
          fields: schema,
          draftsEnabled: true
        });
        
        setCurrentCollectionId(collectionId);
        localStorage.setItem('current-cms-collection-id', collectionId);
        setLastSaved(new Date());
        setIsDirty(false);
        onSaveSuccess?.(collectionId);
        
        return collectionId;
      }
    } catch (error) {
      console.error('Failed to save collection:', error);
      onSaveError?.(error as Error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [
    workspaceId,
    nodes,
    edges,
    currentCollectionId,
    currentCollection,
    createCollection,
    updateCollection,
    onSaveSuccess,
    onSaveError
  ]);

  const loadCollection = useCallback(async (collectionId: Id<'cms_collections'>) => {
    const collection = collections?.find(c => c._id === collectionId);
    
    if (!collection) {
      const error = new Error('Collection not found');
      onLoadError?.(error);
      throw error;
    }

    try {
      const { nodes: loadedNodes, edges: loadedEdges } = fromSchema(collection.fields);
      setNodes(loadedNodes);
      setEdges(loadedEdges);
      setCurrentCollectionId(collectionId);
      localStorage.setItem('current-cms-collection-id', collectionId);
      setIsDirty(false);
      onLoadSuccess?.();
    } catch (error) {
      console.error('Failed to load collection:', error);
      onLoadError?.(error as Error);
      throw error;
    }
  }, [collections, setNodes, setEdges, onLoadSuccess, onLoadError]);

  const createNewCollection = useCallback(async (name: string, slug?: string) => {
    setNodes([]);
    setEdges([]);
    setCurrentCollectionId(null);
    localStorage.removeItem('current-cms-collection-id');
    setIsDirty(true);
    
    const collectionId = await saveCollection(name, slug);
    return collectionId;
  }, [setNodes, setEdges, saveCollection]);

  const deleteCurrentCollection = useCallback(async () => {
    if (!currentCollectionId || !workspaceId) {
      throw new Error('No collection selected');
    }

    try {
      await deleteCollection({
        id: currentCollectionId,
        workspaceId
      });
      
      setNodes([]);
      setEdges([]);
      setCurrentCollectionId(null);
      localStorage.removeItem('current-cms-collection-id');
      setIsDirty(false);
    } catch (error) {
      console.error('Failed to delete collection:', error);
      throw error;
    }
  }, [currentCollectionId, workspaceId, deleteCollection, setNodes, setEdges]);

  useEffect(() => {
    if (collections && collections.length > 0 && !currentCollectionId) {
      const lastUsed = localStorage.getItem('current-cms-collection-id');
      const collection = lastUsed 
        ? collections.find(c => c._id === lastUsed as Id<'cms_collections'>)
        : collections[0];
      
      if (collection) {
        loadCollection(collection._id);
      }
    }
  }, [collections, currentCollectionId, loadCollection]);

  useEffect(() => {
    const nodesChanged = JSON.stringify(previousNodesRef.current) !== JSON.stringify(nodes);
    const edgesChanged = JSON.stringify(previousEdgesRef.current) !== JSON.stringify(edges);
    
    if (nodesChanged || edgesChanged) {
      setIsDirty(true);
      previousNodesRef.current = nodes;
      previousEdgesRef.current = edges;

      if (autoSave && (nodesChanged || edgesChanged)) {
        if (autoSaveTimerRef.current) {
          clearTimeout(autoSaveTimerRef.current);
        }

        autoSaveTimerRef.current = setTimeout(() => {
          if (currentCollection) {
            saveCollection(currentCollection.label).catch(console.error);
          }
        }, autoSaveDelay);
      }
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [nodes, edges, autoSave, autoSaveDelay, currentCollection, saveCollection]);

  return {
    collections: collections || [],
    currentCollection,
    currentCollectionId,
    lastSaved,
    isDirty,
    isSaving,
    loading: collectionsLoading,
    saveCollection,
    loadCollection,
    createNewCollection,
    deleteCurrentCollection
  };
}
