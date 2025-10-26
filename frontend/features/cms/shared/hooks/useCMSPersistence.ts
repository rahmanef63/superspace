import { useEffect, useCallback, useState } from 'react';
import { useWorkspaceContext } from '@/frontend/shared/context/WorkspaceContext';
import { useCMSSchemas, useCreateSchema, useUpdateSchema } from '@/frontend/shared/hooks/useCMSBackend';
import type { CMSNode, CMSEdge, Schema } from '../types';
import { toSchema } from './useSchema';
import { fromSchema } from './useSchemaParser';

export interface CMSPersistenceOptions {
  autoSave?: boolean;
  autoSaveDelay?: number;
  onSaveSuccess?: (schemaId: number) => void;
  onSaveError?: (error: string) => void;
}

export function useCMSPersistence(
  nodes: CMSNode[],
  edges: CMSEdge[],
  setNodes: (nodes: CMSNode[]) => void,
  setEdges: (edges: CMSEdge[]) => void,
  options: CMSPersistenceOptions = {}
) {
  const { currentWorkspace, currentUserId } = useWorkspaceContext();
  const [currentSchemaId, setCurrentSchemaId] = useState<number | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  const { 
    autoSave = true, 
    autoSaveDelay = 2000,
    onSaveSuccess,
    onSaveError 
  } = options;

  const { data: schemasData, loading: schemasLoading, refetch } = useCMSSchemas(
    currentWorkspace?.id || 0,
    { limit: 100 }
  );

  const { mutate: createSchema, loading: creating } = useCreateSchema();
  const { mutate: updateSchema, loading: updating } = useUpdateSchema();

  const isSaving = creating || updating;

  const saveSchema = useCallback(async (name?: string) => {
    if (!currentWorkspace || !currentUserId) {
      onSaveError?.('No workspace or user selected');
      return;
    }

    const schema = toSchema(nodes, edges);
    
    try {
      if (currentSchemaId) {
        const result = await updateSchema({
          id: currentSchemaId,
          name: name || 'Main Schema',
          schema_data: schema,
          change_summary: 'Updated via CMS builder',
          updated_by: currentUserId
        });
        
        setLastSaved(new Date());
        setIsDirty(false);
        onSaveSuccess?.(currentSchemaId);
      } else {
        const result = await createSchema({
          workspace_id: currentWorkspace.id,
          name: name || 'Main Schema',
          schema_data: schema,
          created_by: currentUserId
        });
        
        setCurrentSchemaId(result.id);
        setLastSaved(new Date());
        setIsDirty(false);
        onSaveSuccess?.(result.id);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to save schema';
      onSaveError?.(errorMsg);
      console.error('Schema save error:', error);
    }
  }, [
    currentWorkspace,
    currentUserId,
    currentSchemaId,
    nodes,
    edges,
    createSchema,
    updateSchema,
    onSaveSuccess,
    onSaveError
  ]);

  const loadSchema = useCallback(async (schemaId: number) => {
    if (!currentWorkspace) return;

    const schema = schemasData?.schemas?.find(s => s.id === schemaId);
    if (schema?.schema_data) {
      const { nodes: loadedNodes, edges: loadedEdges } = fromSchema(schema.schema_data as Schema);
      setNodes(loadedNodes);
      setEdges(loadedEdges);
      setCurrentSchemaId(schemaId);
      setLastSaved(new Date(schema.updated_at));
      setIsDirty(false);
    }
  }, [currentWorkspace, schemasData, setNodes, setEdges]);

  const createNewSchema = useCallback(async (name: string) => {
    if (!currentWorkspace || !currentUserId) return;

    try {
      const emptySchema = { version: '0.4', root: [], nodes: {} };
      const result = await createSchema({
        workspace_id: currentWorkspace.id,
        name,
        schema_data: emptySchema,
        created_by: currentUserId
      });

      setCurrentSchemaId(result.id);
      setNodes([]);
      setEdges([]);
      setIsDirty(false);
      await refetch();
      return result.id;
    } catch (error) {
      console.error('Failed to create schema:', error);
      throw error;
    }
  }, [currentWorkspace, currentUserId, createSchema, setNodes, setEdges, refetch]);

  useEffect(() => {
    setIsDirty(true);
  }, [nodes, edges]);

  useEffect(() => {
    if (!autoSave || !isDirty || isSaving) return;

    const timer = setTimeout(() => {
      saveSchema();
    }, autoSaveDelay);

    return () => clearTimeout(timer);
  }, [autoSave, isDirty, isSaving, autoSaveDelay, saveSchema]);

  useEffect(() => {
    if (!schemasLoading && schemasData?.schemas && schemasData.schemas.length > 0 && !currentSchemaId) {
      const firstSchema = schemasData.schemas[0];
      loadSchema(firstSchema.id);
    }
  }, [schemasLoading, schemasData, currentSchemaId, loadSchema]);

  return {
    schemas: schemasData?.schemas || [],
    currentSchemaId,
    lastSaved,
    isDirty,
    isSaving,
    loading: schemasLoading,
    saveSchema,
    loadSchema,
    createNewSchema,
    refetchSchemas: refetch
  };
}
