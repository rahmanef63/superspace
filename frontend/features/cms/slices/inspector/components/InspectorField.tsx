import React, { useState } from 'react';
import type { InspectorField as IField, CMSNode, CMSEdge } from '../../../shared/types';
import { Input, Label, Select, Switch } from '@/components/ui';
import { NodeSelectorField } from './NodeSelectorField';
import { AutoConnectButton } from './AutoConnectButton';
import { AIGenerationButton } from './AIGenerationButton';
import { AIGenerationModal } from './AIGenerationModal';

interface InspectorFieldProps {
  field: IField;
  value: any;
  onChange: (value: any) => void;
  nodes: CMSNode[];
  selectedNode: CMSNode;
  setEdges: React.Dispatch<React.SetStateAction<CMSEdge[]>>;
  setNodes: React.Dispatch<React.SetStateAction<CMSNode[]>>;
  edges: CMSEdge[];
}

export const InspectorField: React.FC<InspectorFieldProps> = ({
  field,
  value,
  onChange,
  nodes,
  selectedNode,
  setEdges,
  setNodes,
  edges,
}) => {
  const [showAIModal, setShowAIModal] = useState(false);
  const [generationType, setGenerationType] = useState<'ai' | 'custom'>('ai');

  const handleAIGeneration = (type: 'ai' | 'custom') => {
    setGenerationType(type);
    setShowAIModal(true);
  };

  const handleGenerate = async (prompt: string, contentType: string) => {
    // Mock AI generation - in real app this would call an AI service
    let generatedContent = '';
    
    if (generationType === 'ai') {
      // Simulate AI generation based on content type and prompt
      switch (contentType) {
        case 'text':
          generatedContent = `AI Generated: ${prompt.slice(0, 50)}...`;
          break;
        case 'image':
          generatedContent = `https://picsum.photos/seed/${Date.now()}/800/600`;
          break;
        case 'button':
          generatedContent = prompt.includes('cta') || prompt.includes('call') ? 'Get Started Now' : 'Learn More';
          break;
        default:
          generatedContent = `Generated content for ${contentType}`;
      }
    } else {
      // Custom node connection logic
      generatedContent = `Custom: ${prompt}`;
    }
    
    onChange(generatedContent);
  };

  const renderField = () => {
    switch (field.type) {
      case 'text':
      case 'number':
        return (
          <div className="flex items-center gap-2">
            <Input
              type={field.type}
              value={value || ''}
              onChange={onChange}
              placeholder={field.placeholder}
              className="flex-1"
            />
            <AutoConnectButton
              selectedNode={selectedNode}
              connectKey={field.key}
              setNodes={setNodes}
              setEdges={setEdges}
              edges={edges}
            />
            <AIGenerationButton onGenerate={handleAIGeneration} />
          </div>
        );

      case 'textarea':
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <textarea
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-black"
                  value={value || ''}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder={field.placeholder}
                  rows={3}
                />
              </div>
              <div className="ml-2 flex flex-col gap-1">
                <AutoConnectButton
                  selectedNode={selectedNode}
                  connectKey={field.key}
                  setNodes={setNodes}
                  setEdges={setEdges}
                  edges={edges}
                />
                <AIGenerationButton onGenerate={handleAIGeneration} />
              </div>
            </div>
          </div>
        );

      case 'select':
        return (
          <div className="flex items-center gap-2">
            <Select
              value={value || ''}
              onChange={onChange}
              options={field.options || []}
              className="flex-1"
            />
            <AIGenerationButton onGenerate={handleAIGeneration} />
          </div>
        );

      case 'switch':
        return (
          <div className="flex items-center justify-between">
            <Switch
              checked={!!value}
              onChange={onChange}
            />
            <AIGenerationButton onGenerate={handleAIGeneration} />
          </div>
        );

      case 'nodeSelector':
        return (
          <div className="flex items-center gap-2">
            <NodeSelectorField
              value={value || ''}
              onChange={onChange}
              nodes={nodes}
              placeholder={field.placeholder}
              className="flex-1"
            />
            <AIGenerationButton onGenerate={handleAIGeneration} />
          </div>
        );

      case 'custom':
        if (field.component) {
          const CustomComponent = field.component;
          return (
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <CustomComponent
                  value={value}
                  onChange={onChange}
                  nodes={nodes}
                  selectedNode={selectedNode}
                  setEdges={setEdges}
                />
              </div>
              <AIGenerationButton onGenerate={handleAIGeneration} />
            </div>
          );
        }
        return null;

      default:
        return (
          <div className="flex items-center gap-2">
            <Input
              value={value || ''}
              onChange={onChange}
              placeholder={field.placeholder}
              className="flex-1"
            />
            <AIGenerationButton onGenerate={handleAIGeneration} />
          </div>
        );
    }
  };

  return (
    <div>
      <Label>{field.label}</Label>
      {renderField()}
      
      <AIGenerationModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        onGenerate={handleGenerate}
        generationType={generationType}
      />
    </div>
  );
};
