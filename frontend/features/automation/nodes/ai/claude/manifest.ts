/**
 * Anthropic Claude Node
 * 
 * Use Anthropic Claude models.
 */

import { Brain } from 'lucide-react';
import type { NodeManifest } from '../../types';
import { aiSystemPromptField, aiUserPromptField, aiMaxTokensField } from '../../../inspectors';

export const claudeManifest: NodeManifest = {
    key: 'ai.claude',
    label: 'Anthropic Claude',
    category: 'AI',
    description: 'Use Anthropic Claude models for text generation',
    icon: Brain,

    defaults: {
        model: 'claude-3-sonnet',
        systemPrompt: 'You are a helpful assistant.',
        userPrompt: '',
        maxTokens: 1000,
    },

    inspector: {
        sections: [
            {
                title: 'Model',
                fields: [
                    {
                        key: 'model',
                        label: 'Model',
                        type: 'select',
                        options: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku', 'claude-3.5-sonnet', 'claude-3.5-haiku'],
                    },
                ],
            },
            {
                title: 'Prompt',
                fields: [
                    aiSystemPromptField,
                    aiUserPromptField,
                ],
            },
            {
                title: 'Parameters',
                fields: [
                    aiMaxTokensField,
                ],
                collapsed: true,
            },
        ],
    },
};
