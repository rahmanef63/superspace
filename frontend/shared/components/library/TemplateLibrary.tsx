import React, { useEffect, useMemo, useState } from 'react';
import { Button, Input } from '@/components/ui';
import { useDnD } from '@/frontend/shared/canvas/core/DnDProvider';
import { getDefaultTemplates, listAssetTemplates, saveAssetTemplate, deleteAssetTemplate } from '@/frontend/features/cms/state/templateStore';

interface TemplateLibraryProps {
  onOpen: (key: string) => void;
}

export const TemplateLibrary: React.FC<TemplateLibraryProps> = ({ onOpen }) => {
  const [query, setQuery] = useState("");
  const [assets, setAssets] = useState<Record<string, any>>({});
  const [, setType] = useDnD();

  useEffect(() => {
    setAssets(listAssetTemplates());
  }, []);

  const builtin = useMemo(() => getDefaultTemplates(), []);
  const builtinKeys = Object.keys(builtin);
  const assetKeys = Object.keys(assets);

  const filteredBuiltins = builtinKeys.filter(k => k.toLowerCase().includes(query.toLowerCase()));
  const filteredAssets = assetKeys.filter(k => k.toLowerCase().includes(query.toLowerCase()));

  const onDragStart = (e: React.DragEvent, key: string, source: 'builtin' | 'asset') => {
    setType(null); // prevent SharedCanvas default add-node behavior
    e.dataTransfer.setData('cms/template', JSON.stringify({ key, source }));
    e.dataTransfer.effectAllowed = 'copyMove';
  };

  const removeAsset = (key: string) => {
    deleteAssetTemplate(key);
    setAssets(listAssetTemplates());
  };

  const renderItem = (key: string, source: 'builtin' | 'asset') => (
    <div
      key={`${source}:${key}`}
      className="relative rounded-xl border p-3 hover:bg-gray-50 group cursor-default"
      title={key}
    >
      <div className="text-sm font-medium truncate">{key}</div>
      <div className="text-[11px] text-gray-500 mt-1">
        {source === 'builtin' ? 'Built-in template' : 'Saved template'}
      </div>
      <div className="mt-2 flex items-center gap-2">
        <div
          draggable
          onDragStart={(e) => onDragStart(e, key, source)}
          className="text-[11px] rounded-lg border px-2 py-1 bg-white cursor-grab active:cursor-grabbing"
        >
          Drag
        </div>
        <Button size="sm" variant="outline" onClick={() => onOpen(`${source}:${key}`)}>
          Open
        </Button>
        {source === 'asset' && (
          <Button size="sm" variant="destructive" onClick={() => removeAsset(key)}>
            Delete
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b border-gray-200">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search templates..."
        />
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        <div>
          <div className="text-[10px] uppercase tracking-wide text-gray-400 mb-2">Built-in</div>
          <div className="grid grid-cols-1 gap-2">
            {filteredBuiltins.map(key => renderItem(key, 'builtin'))}
            {filteredBuiltins.length === 0 && (
              <div className="text-xs text-gray-500">No templates</div>
            )}
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wide text-gray-400 mb-2">Asset Templates</div>
          <div className="grid grid-cols-1 gap-2">
            {filteredAssets.map(key => renderItem(key, 'asset'))}
            {filteredAssets.length === 0 && (
              <div className="text-xs text-gray-500">No saved templates yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper to save a new asset template from external callers
export function addSelectionAsTemplate(name: string, schema: any) {
  saveAssetTemplate(name, schema);
}
