/**
 * OpenAI / GPT Node
 * 
 * Use OpenAI GPT models.
 */

import { Bot } from 'lucide-react';
import type { NodeManifest } from '../../types';
import { aiSystemPromptField, aiUserPromptField, aiTemperatureField, aiMaxTokensField } from '../../../inspectors';

export const openaiManifest: NodeManifest = {
    key: 'ai.openai',
    label: 'OpenAI / GPT',
    category: 'AI',
    description: 'Use OpenAI GPT models for text generation',
    icon: Bot,

    defaults: {
        model: 'gpt-4',
        operation: 'chat',
        systemPrompt: 'You are a helpful assistant.',
        userPrompt: '',
        temperature: 0.7,
        maxTokens: 1000,
    },

    inspector: {
        sections: [
            {
                title: 'Model',
                fields: [
                    {
                        key: 'operation',
                        label: 'Operation',
                        type: 'select',
                        options: ['chat', 'complete', 'embedding', 'image'],
                    },
                    {
                        key: 'model',
                        label: 'Model',
                        type: 'select',
                        options: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo', 'gpt-4o', 'gpt-4o-mini'],
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
                    aiTemperatureField,
                    aiMaxTokensField,
                ],
                collapsed: true,
            },
        ],
    },
};
