import type { ComponentConfig } from '@/frontend/shared/foundation';
import { automationWidgetRegistry } from '../widgets/registry';

// LLM Components
const openAIConfig: ComponentConfig = {
  key: 'openAI',
  label: 'OpenAI',
  category: 'LLM',
  feature: 'automation',
  description: 'OpenAI GPT integration',
  icon: '🤖',
  defaults: {
    model: 'gpt-4',
    prompt: 'You are a helpful assistant.',
    temperature: 0.7,
    maxTokens: 1000,
    apiKey: '',
  },
  inspector: {
    fields: [
      {
        key: 'model',
        label: 'Model',
        type: 'select',
        options: ['gpt-4', 'gpt-3.5-turbo', 'gpt-4-turbo'],
      },
      {
        key: 'prompt',
        label: 'Prompt',
        type: 'textarea',
        placeholder: 'Enter your prompt...',
      },
      {
        key: 'temperature',
        label: 'Temperature',
        type: 'number',
        placeholder: '0.7',
      },
      {
        key: 'maxTokens',
        label: 'Max Tokens',
        type: 'number',
        placeholder: '1000',
      },
      {
        key: 'apiKey',
        label: 'API Key',
        type: 'text',
        placeholder: 'OpenAI API Key',
      },
    ],
  },
};

const claudeConfig: ComponentConfig = {
  key: 'claude',
  label: 'Claude',
  category: 'LLM',
  feature: 'automation',
  description: 'Anthropic Claude integration',
  icon: '🧠',
  defaults: {
    model: 'claude-3-sonnet',
    prompt: 'You are a helpful assistant.',
    maxTokens: 1000,
    apiKey: '',
  },
  inspector: {
    fields: [
      {
        key: 'model',
        label: 'Model',
        type: 'select',
        options: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
      },
      {
        key: 'prompt',
        label: 'Prompt',
        type: 'textarea',
        placeholder: 'Enter your prompt...',
      },
      {
        key: 'maxTokens',
        label: 'Max Tokens',
        type: 'number',
        placeholder: '1000',
      },
      {
        key: 'apiKey',
        label: 'API Key',
        type: 'text',
        placeholder: 'Anthropic API Key',
      },
    ],
  },
};

// AI Category Components
const textAnalysisConfig: ComponentConfig = {
  key: 'textAnalysis',
  label: 'Text Analysis',
  category: 'AI',
  feature: 'automation',
  description: 'Analyze text sentiment and entities',
  icon: '',
  defaults: {
    analysisType: 'sentiment',
    text: '',
    language: 'en',
  },
  inspector: {
    fields: [
      {
        key: 'analysisType',
        label: 'Analysis Type',
        type: 'select',
        options: ['sentiment', 'entities', 'keywords', 'summary'],
      },
      {
        key: 'text',
        label: 'Text to Analyze',
        type: 'textarea',
        placeholder: 'Enter text to analyze...',
      },
      {
        key: 'language',
        label: 'Language',
        type: 'select',
        options: ['en', 'es', 'fr', 'de', 'it', 'pt'],
      },
    ],
  },
};

export const registerAutomationComponents = (registerComponent: (config: ComponentConfig) => void) => {
  // First, register any modular automation widgets discovered under widgets/registry.ts
  Object.values(automationWidgetRegistry).forEach(registerComponent);

  // HTTP
  registerComponent({
    key: 'httpRequest',
    label: 'HTTP Request',
    category: 'HTTP',
    feature: 'automation',
    description: 'Make HTTP requests to APIs',
    icon: '🌐',
    defaults: {
      method: 'GET',
      url: 'https://api.example.com',
      headers: '{}',
      body: '',
      timeout: 30000,
    },
    inspector: {
      fields: [
        {
          key: 'method',
          label: 'Method',
          type: 'select',
          options: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        },
        {
          key: 'url',
          label: 'URL',
          type: 'text',
          placeholder: 'https://api.example.com',
        },
        {
          key: 'headers',
          label: 'Headers (JSON)',
          type: 'textarea',
          placeholder: '{"Content-Type": "application/json"}',
        },
        {
          key: 'body',
          label: 'Request Body',
          type: 'textarea',
          placeholder: 'Request body content',
        },
        {
          key: 'timeout',
          label: 'Timeout (ms)',
          type: 'number',
          placeholder: '30000',
        },
      ],
    },
  });

  // Webhook
  registerComponent({
    key: 'webhookTrigger',
    label: 'Webhook Trigger',
    category: 'Webhook',
    feature: 'automation',
    description: 'Receive webhook events',
    icon: '🔗',
    defaults: {
      path: '/webhook',
      method: 'POST',
      authentication: 'none',
      secret: '',
    },
    inspector: {
      fields: [
        {
          key: 'path',
          label: 'Webhook Path',
          type: 'text',
          placeholder: '/webhook',
        },
        {
          key: 'method',
          label: 'HTTP Method',
          type: 'select',
          options: ['POST', 'GET', 'PUT', 'DELETE'],
        },
        {
          key: 'authentication',
          label: 'Authentication',
          type: 'select',
          options: ['none', 'secret', 'signature'],
        },
        {
          key: 'secret',
          label: 'Secret Key',
          type: 'text',
          placeholder: 'webhook-secret',
        },
      ],
    },
  });

  // Integrations
  registerComponent({
    key: 'googleSheets',
    label: 'Google Sheets',
    category: 'Integration',
    feature: 'automation',
    description: 'Read/write Google Sheets',
    icon: '',
    defaults: {
      action: 'read',
      spreadsheetId: '',
      range: 'A1:Z1000',
      apiKey: '',
    },
    inspector: {
      fields: [
        {
          key: 'action',
          label: 'Action',
          type: 'select',
          options: ['read', 'write', 'append'],
        },
        {
          key: 'spreadsheetId',
          label: 'Spreadsheet ID',
          type: 'text',
          placeholder: 'Google Sheets ID',
        },
        {
          key: 'range',
          label: 'Range',
          type: 'text',
          placeholder: 'A1:Z1000',
        },
        {
          key: 'apiKey',
          label: 'API Key',
          type: 'text',
          placeholder: 'Google API Key',
        },
      ],
    },
  });

  registerComponent({
    key: 'notion',
    label: 'Notion',
    category: 'Integration',
    feature: 'automation',
    description: 'Interact with Notion databases',
    icon: '📝',
    defaults: {
      action: 'query',
      databaseId: '',
      apiKey: '',
      filter: '{}',
    },
    inspector: {
      fields: [
        {
          key: 'action',
          label: 'Action',
          type: 'select',
          options: ['query', 'create', 'update'],
        },
        {
          key: 'databaseId',
          label: 'Database ID',
          type: 'text',
          placeholder: 'Notion Database ID',
        },
        {
          key: 'apiKey',
          label: 'API Key',
          type: 'text',
          placeholder: 'Notion Integration Token',
        },
        {
          key: 'filter',
          label: 'Filter (JSON)',
          type: 'textarea',
          placeholder: '{"property": "Status", "select": {"equals": "Done"}}',
        },
      ],
    },
  });

  registerComponent({
    key: 'telegram',
    label: 'Telegram Bot',
    category: 'Integration',
    feature: 'automation',
    description: 'Send messages via Telegram',
    icon: '💬',
    defaults: {
      action: 'sendMessage',
      botToken: '',
      chatId: '',
      message: 'Hello from automation!',
    },
    inspector: {
      fields: [
        {
          key: 'action',
          label: 'Action',
          type: 'select',
          options: ['sendMessage', 'sendPhoto', 'sendDocument'],
        },
        {
          key: 'botToken',
          label: 'Bot Token',
          type: 'text',
          placeholder: 'Telegram Bot Token',
        },
        {
          key: 'chatId',
          label: 'Chat ID',
          type: 'text',
          placeholder: 'Telegram Chat ID',
        },
        {
          key: 'message',
          label: 'Message',
          type: 'textarea',
          placeholder: 'Message to send',
        },
      ],
    },
  });

  // Logic
  registerComponent({
    key: 'condition',
    label: 'Condition',
    category: 'Logic',
    feature: 'automation',
    description: 'Conditional logic branching',
    icon: '🔀',
    defaults: {
      operator: 'equals',
      leftValue: '',
      rightValue: '',
    },
    inspector: {
      fields: [
        {
          key: 'operator',
          label: 'Operator',
          type: 'select',
          options: ['equals', 'not_equals', 'greater_than', 'less_than', 'contains'],
        },
        {
          key: 'leftValue',
          label: 'Left Value',
          type: 'text',
          placeholder: 'Value to compare',
        },
        {
          key: 'rightValue',
          label: 'Right Value',
          type: 'text',
          placeholder: 'Compare against',
        },
      ],
    },
  });

  registerComponent({
    key: 'delay',
    label: 'Delay',
    category: 'Logic',
    feature: 'automation',
    description: 'Add delay to workflow',
    icon: '⏱️',
    defaults: {
      duration: 1000,
      unit: 'milliseconds',
    },
    inspector: {
      fields: [
        {
          key: 'duration',
          label: 'Duration',
          type: 'number',
          placeholder: '1000',
        },
        {
          key: 'unit',
          label: 'Unit',
          type: 'select',
          options: ['milliseconds', 'seconds', 'minutes', 'hours'],
        },
      ],
    },
  });

  // Data
  registerComponent({
    key: 'dataTransform',
    label: 'Data Transform',
    category: 'Data',
    feature: 'automation',
    description: 'Transform data between steps',
    icon: '🔄',
    defaults: {
      transformation: 'map',
      script: 'return data;',
    },
    inspector: {
      fields: [
        {
          key: 'transformation',
          label: 'Transformation',
          type: 'select',
          options: ['map', 'filter', 'reduce', 'custom'],
        },
        {
          key: 'script',
          label: 'JavaScript Code',
          type: 'textarea',
          placeholder: 'return data.map(item => ({ ...item, processed: true }));',
        },
      ],
    },
  });

  // LLM Components
  registerComponent(openAIConfig);
  registerComponent(claudeConfig);

  // AI Components
  registerComponent(textAnalysisConfig);
};
