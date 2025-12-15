/**
 * n8n-style Core Automation Nodes
 * 
 * Complete set of nodes required for a full automation builder:
 * - Triggers: Manual, Webhook, Schedule, Event
 * - HTTP Request: Universal integrator
 * - Data: Set, Extract, Merge, Expression
 * - Flow Control: IF/Condition, Switch, Merge, Split
 * - Error Handling: Try/Catch, Retry, Error Trigger
 * - Credentials: Secrets management
 */

import type { ComponentConfig } from '@/frontend/shared/foundation';
import { automationWidgetRegistry } from '../widgets/registry';

// ============================================================================
// TRIGGERS - Workflow start nodes
// ============================================================================

const triggerManual: ComponentConfig = {
  key: 'trigger.manual',
  label: 'Manual Trigger',
  category: 'Trigger',
  feature: 'automation',
  description: 'Start workflow manually with custom input data',
  icon: undefined,
  defaults: {
    name: 'Manual Run',
    inputData: '{}',
  },
  inspector: {
    fields: [
      { key: 'name', label: 'Trigger Name', type: 'text', placeholder: 'My Trigger' },
      { key: 'inputData', label: 'Input Data (JSON)', type: 'textarea', placeholder: '{"key": "value"}' },
    ],
  },
};

const triggerWebhook: ComponentConfig = {
  key: 'trigger.webhook',
  label: 'Webhook Trigger',
  category: 'Trigger',
  feature: 'automation',
  description: 'Receive HTTP requests to trigger workflow',
  icon: undefined,
  defaults: {
    path: '/webhook/my-workflow',
    method: 'POST',
    responseMode: 'onReceived',
    authentication: 'none',
  },
  inspector: {
    fields: [
      { key: 'path', label: 'Webhook Path', type: 'text', placeholder: '/webhook/my-workflow' },
      { key: 'method', label: 'HTTP Method', type: 'select', options: ['GET', 'POST', 'PUT', 'DELETE'] },
      { key: 'responseMode', label: 'Response Mode', type: 'select', options: ['onReceived', 'lastNode'] },
      { key: 'authentication', label: 'Authentication', type: 'select', options: ['none', 'basicAuth', 'headerAuth'] },
    ],
  },
};

const triggerSchedule: ComponentConfig = {
  key: 'trigger.schedule',
  label: 'Schedule Trigger',
  category: 'Trigger',
  feature: 'automation',
  description: 'Run workflow on a schedule (cron expression)',
  icon: undefined,
  defaults: {
    cronExpression: '0 * * * *',
    timezone: 'UTC',
  },
  inspector: {
    fields: [
      { key: 'cronExpression', label: 'Cron Expression', type: 'text', placeholder: '0 * * * * (every hour)' },
      { key: 'timezone', label: 'Timezone', type: 'select', options: ['UTC', 'Asia/Jakarta', 'America/New_York', 'Europe/London'] },
    ],
  },
};

const triggerEvent: ComponentConfig = {
  key: 'trigger.event',
  label: 'Event Trigger',
  category: 'Trigger',
  feature: 'automation',
  description: 'Trigger on internal system events',
  icon: undefined,
  defaults: {
    eventType: 'database.update',
    filter: '',
  },
  inspector: {
    fields: [
      { key: 'eventType', label: 'Event Type', type: 'select', options: ['database.insert', 'database.update', 'database.delete', 'user.login', 'form.submit'] },
      { key: 'filter', label: 'Filter Expression', type: 'text', placeholder: 'e.g. data.status === "active"' },
    ],
  },
};

// ============================================================================
// HTTP REQUEST - Universal integrator
// ============================================================================

const httpRequest: ComponentConfig = {
  key: 'http.request',
  label: 'HTTP Request',
  category: 'HTTP',
  feature: 'automation',
  description: 'Make HTTP requests to any API',
  icon: undefined,
  defaults: {
    method: 'GET',
    url: '',
    headers: '{"Content-Type": "application/json"}',
    body: '',
    authentication: 'none',
    timeout: 30000,
    followRedirects: true,
    responseType: 'json',
  },
  inspector: {
    fields: [
      { key: 'method', label: 'Method', type: 'select', options: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'] },
      { key: 'url', label: 'URL', type: 'text', placeholder: 'https://api.example.com/endpoint' },
      { key: 'authentication', label: 'Authentication', type: 'select', options: ['none', 'basicAuth', 'bearerToken', 'apiKey', 'oauth2'] },
      { key: 'headers', label: 'Headers (JSON)', type: 'textarea', placeholder: '{"Authorization": "Bearer ..."}' },
      { key: 'body', label: 'Request Body', type: 'textarea', placeholder: 'JSON body for POST/PUT/PATCH' },
      { key: 'timeout', label: 'Timeout (ms)', type: 'number', placeholder: '30000' },
      { key: 'responseType', label: 'Response Type', type: 'select', options: ['json', 'text', 'binary', 'stream'] },
    ],
  },
};

const httpRespond: ComponentConfig = {
  key: 'http.respond',
  label: 'Respond to Webhook',
  category: 'HTTP',
  feature: 'automation',
  description: 'Send response back to webhook caller',
  icon: undefined,
  defaults: {
    statusCode: 200,
    headers: '{}',
    body: '{"success": true}',
    respondWith: 'json',
  },
  inspector: {
    fields: [
      { key: 'statusCode', label: 'Status Code', type: 'number', placeholder: '200' },
      { key: 'respondWith', label: 'Response Type', type: 'select', options: ['json', 'text', 'binary', 'lastNodeData'] },
      { key: 'headers', label: 'Response Headers', type: 'textarea', placeholder: '{}' },
      { key: 'body', label: 'Response Body', type: 'textarea', placeholder: '{"success": true, "data": ...}' },
    ],
  },
};

// ============================================================================
// DATA MAPPING & EXPRESSIONS
// ============================================================================

const dataSet: ComponentConfig = {
  key: 'data.set',
  label: 'Set Variable',
  category: 'Data',
  feature: 'automation',
  description: 'Set or create a variable in workflow context',
  icon: undefined,
  defaults: {
    variableName: 'myVariable',
    value: '',
    valueType: 'string',
    keepOnlySet: false,
  },
  inspector: {
    fields: [
      { key: 'variableName', label: 'Variable Name', type: 'text', placeholder: 'myVariable' },
      { key: 'valueType', label: 'Value Type', type: 'select', options: ['string', 'number', 'boolean', 'json', 'expression'] },
      { key: 'value', label: 'Value', type: 'textarea', placeholder: 'Value or expression like {{ $node.prev.data.field }}' },
      { key: 'keepOnlySet', label: 'Keep Only This Value', type: 'switch' },
    ],
  },
};

const dataCode: ComponentConfig = {
  key: 'data.code',
  label: 'Code / Function',
  category: 'Data',
  feature: 'automation',
  description: 'Execute custom JavaScript code',
  icon: undefined,
  defaults: {
    mode: 'runOnceForAllItems',
    language: 'javascript',
    code: '// Access input data with $input\n// Return data to pass to next node\nreturn $input.all();',
  },
  inspector: {
    fields: [
      { key: 'mode', label: 'Run Mode', type: 'select', options: ['runOnceForAllItems', 'runOnceForEachItem'] },
      { key: 'language', label: 'Language', type: 'select', options: ['javascript'] },
      { key: 'code', label: 'Code', type: 'textarea', placeholder: '// Your JavaScript code here\nreturn items;' },
    ],
  },
};

const dataExpression: ComponentConfig = {
  key: 'data.expression',
  label: 'Expression',
  category: 'Data',
  feature: 'automation',
  description: 'Evaluate expressions and template strings',
  icon: undefined,
  defaults: {
    expression: '{{ $node["Previous"].data.field }}',
    outputName: 'result',
  },
  inspector: {
    fields: [
      { key: 'expression', label: 'Expression', type: 'textarea', placeholder: '{{ $node["HTTP Request"].data.response.id }}' },
      { key: 'outputName', label: 'Output Variable', type: 'text', placeholder: 'result' },
    ],
  },
};

const dataExtract: ComponentConfig = {
  key: 'data.extract',
  label: 'Extract Field',
  category: 'Data',
  feature: 'automation',
  description: 'Extract specific fields from data',
  icon: undefined,
  defaults: {
    source: 'previousNode',
    fields: 'id, name, email',
    outputFormat: 'object',
  },
  inspector: {
    fields: [
      { key: 'source', label: 'Data Source', type: 'select', options: ['previousNode', 'specificNode', 'context'] },
      { key: 'fields', label: 'Fields (comma-separated)', type: 'text', placeholder: 'id, name, email' },
      { key: 'outputFormat', label: 'Output Format', type: 'select', options: ['object', 'array', 'flat'] },
    ],
  },
};

const dataMerge: ComponentConfig = {
  key: 'data.merge',
  label: 'Merge',
  category: 'Data',
  feature: 'automation',
  description: 'Merge data from multiple branches',
  icon: undefined,
  defaults: {
    mode: 'append',
    clashHandling: 'preferInput1',
  },
  inspector: {
    fields: [
      { key: 'mode', label: 'Merge Mode', type: 'select', options: ['append', 'combine', 'chooseBranch', 'mergeByField'] },
      { key: 'clashHandling', label: 'If Fields Clash', type: 'select', options: ['preferInput1', 'preferInput2', 'merge'] },
    ],
  },
};

// ============================================================================
// FLOW CONTROL
// ============================================================================

const flowIf: ComponentConfig = {
  key: 'flow.if',
  label: 'IF / Condition',
  category: 'Logic',
  feature: 'automation',
  description: 'Branch workflow based on conditions',
  icon: undefined,
  defaults: {
    conditions: [{ field: '', operator: 'equals', value: '' }],
    combineWith: 'AND',
  },
  inspector: {
    fields: [
      { key: 'leftValue', label: 'Value 1', type: 'text', placeholder: '{{ $node.prev.data.status }}' },
      { key: 'operator', label: 'Operator', type: 'select', options: ['equals', 'notEquals', 'contains', 'notContains', 'greaterThan', 'lessThan', 'isEmpty', 'isNotEmpty', 'regex'] },
      { key: 'rightValue', label: 'Value 2', type: 'text', placeholder: 'active' },
      { key: 'combineWith', label: 'Combine Multiple', type: 'select', options: ['AND', 'OR'] },
    ],
  },
};

const flowSwitch: ComponentConfig = {
  key: 'flow.switch',
  label: 'Switch',
  category: 'Logic',
  feature: 'automation',
  description: 'Route to different branches based on value',
  icon: undefined,
  defaults: {
    mode: 'value',
    dataToSwitch: '',
    fallbackOutput: 'default',
    cases: [{ value: 'case1', output: 0 }],
  },
  inspector: {
    fields: [
      { key: 'mode', label: 'Mode', type: 'select', options: ['value', 'expression', 'regex'] },
      { key: 'dataToSwitch', label: 'Data to Evaluate', type: 'text', placeholder: '{{ $node.prev.data.type }}' },
      { key: 'case1Value', label: 'Case 1: Value', type: 'text', placeholder: 'typeA' },
      { key: 'case2Value', label: 'Case 2: Value', type: 'text', placeholder: 'typeB' },
      { key: 'case3Value', label: 'Case 3: Value', type: 'text', placeholder: 'typeC' },
      { key: 'fallbackOutput', label: 'Fallback', type: 'select', options: ['default', 'none', 'error'] },
    ],
  },
};

const flowSplit: ComponentConfig = {
  key: 'flow.split',
  label: 'Split Out',
  category: 'Logic',
  feature: 'automation',
  description: 'Split array into individual items',
  icon: undefined,
  defaults: {
    fieldToSplit: 'items',
    includeOtherFields: true,
  },
  inspector: {
    fields: [
      { key: 'fieldToSplit', label: 'Field to Split', type: 'text', placeholder: 'items' },
      { key: 'includeOtherFields', label: 'Include Other Fields', type: 'switch' },
    ],
  },
};

const flowLoop: ComponentConfig = {
  key: 'flow.loop',
  label: 'Loop Over Items',
  category: 'Logic',
  feature: 'automation',
  description: 'Process each item in an array',
  icon: undefined,
  defaults: {
    batchSize: 1,
    options: 'parallel',
  },
  inspector: {
    fields: [
      { key: 'batchSize', label: 'Batch Size', type: 'number', placeholder: '1' },
      { key: 'options', label: 'Execution', type: 'select', options: ['parallel', 'sequential'] },
    ],
  },
};

const flowWait: ComponentConfig = {
  key: 'flow.wait',
  label: 'Wait / Delay',
  category: 'Logic',
  feature: 'automation',
  description: 'Pause workflow execution',
  icon: undefined,
  defaults: {
    amount: 1,
    unit: 'seconds',
    resumeType: 'afterDelay',
  },
  inspector: {
    fields: [
      { key: 'amount', label: 'Wait Time', type: 'number', placeholder: '5' },
      { key: 'unit', label: 'Unit', type: 'select', options: ['milliseconds', 'seconds', 'minutes', 'hours'] },
      { key: 'resumeType', label: 'Resume On', type: 'select', options: ['afterDelay', 'webhook', 'specificTime'] },
    ],
  },
};

// ============================================================================
// ERROR HANDLING
// ============================================================================

const errorTryCatch: ComponentConfig = {
  key: 'error.tryCatch',
  label: 'Try / Catch',
  category: 'Logic',
  feature: 'automation',
  description: 'Handle errors in workflow execution',
  icon: undefined,
  defaults: {
    continueOnFail: false,
    errorOutput: 'errorBranch',
  },
  inspector: {
    fields: [
      { key: 'continueOnFail', label: 'Continue On Fail', type: 'switch' },
      { key: 'errorOutput', label: 'Error Output', type: 'select', options: ['errorBranch', 'errorWorkflow', 'stop'] },
    ],
  },
};

const errorRetry: ComponentConfig = {
  key: 'error.retry',
  label: 'Retry on Error',
  category: 'Logic',
  feature: 'automation',
  description: 'Retry failed node execution',
  icon: undefined,
  defaults: {
    maxRetries: 3,
    waitBetweenRetries: 1000,
    retryOn: 'allErrors',
  },
  inspector: {
    fields: [
      { key: 'maxRetries', label: 'Max Retries', type: 'number', placeholder: '3' },
      { key: 'waitBetweenRetries', label: 'Wait Between (ms)', type: 'number', placeholder: '1000' },
      { key: 'retryOn', label: 'Retry On', type: 'select', options: ['allErrors', 'specificErrors', 'timeout'] },
    ],
  },
};

const errorTrigger: ComponentConfig = {
  key: 'error.trigger',
  label: 'Error Trigger',
  category: 'Trigger',
  feature: 'automation',
  description: 'Trigger workflow when another workflow fails',
  icon: undefined,
  defaults: {
    sourceWorkflow: '',
    errorTypes: ['all'],
  },
  inspector: {
    fields: [
      { key: 'sourceWorkflow', label: 'Source Workflow', type: 'text', placeholder: 'Select workflow to monitor' },
      { key: 'errorTypes', label: 'Error Types', type: 'select', options: ['all', 'timeout', 'validation', 'http'] },
    ],
  },
};

// ============================================================================
// CREDENTIALS / SECRETS
// ============================================================================

const credentialsNode: ComponentConfig = {
  key: 'credentials.use',
  label: 'Use Credentials',
  category: 'Integration',
  feature: 'automation',
  description: 'Use stored credentials/secrets',
  icon: undefined,
  defaults: {
    credentialType: '',
    credentialName: '',
    outputAs: 'headers',
  },
  inspector: {
    fields: [
      { key: 'credentialType', label: 'Credential Type', type: 'select', options: ['apiKey', 'oauth2', 'basicAuth', 'bearerToken', 'custom'] },
      { key: 'credentialName', label: 'Credential Name', type: 'text', placeholder: 'My API Key' },
      { key: 'outputAs', label: 'Output As', type: 'select', options: ['headers', 'queryParams', 'body', 'raw'] },
    ],
  },
};

// ============================================================================
// LLM / AI NODES
// ============================================================================

const aiOpenAI: ComponentConfig = {
  key: 'ai.openai',
  label: 'OpenAI / GPT',
  category: 'AI',
  feature: 'automation',
  description: 'Use OpenAI GPT models',
  icon: undefined,
  defaults: {
    model: 'gpt-4',
    operation: 'chat',
    systemPrompt: 'You are a helpful assistant.',
    userPrompt: '',
    temperature: 0.7,
    maxTokens: 1000,
  },
  inspector: {
    fields: [
      { key: 'operation', label: 'Operation', type: 'select', options: ['chat', 'complete', 'embedding', 'image'] },
      { key: 'model', label: 'Model', type: 'select', options: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo', 'gpt-4o'] },
      { key: 'systemPrompt', label: 'System Prompt', type: 'textarea', placeholder: 'You are a helpful assistant.' },
      { key: 'userPrompt', label: 'User Prompt', type: 'textarea', placeholder: '{{ $node.prev.data.text }}' },
      { key: 'temperature', label: 'Temperature', type: 'number', placeholder: '0.7' },
      { key: 'maxTokens', label: 'Max Tokens', type: 'number', placeholder: '1000' },
    ],
  },
};

const aiClaude: ComponentConfig = {
  key: 'ai.claude',
  label: 'Anthropic Claude',
  category: 'AI',
  feature: 'automation',
  description: 'Use Anthropic Claude models',
  icon: undefined,
  defaults: {
    model: 'claude-3-sonnet',
    systemPrompt: 'You are a helpful assistant.',
    userPrompt: '',
    maxTokens: 1000,
  },
  inspector: {
    fields: [
      { key: 'model', label: 'Model', type: 'select', options: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku', 'claude-3.5-sonnet'] },
      { key: 'systemPrompt', label: 'System Prompt', type: 'textarea', placeholder: 'You are a helpful assistant.' },
      { key: 'userPrompt', label: 'User Prompt', type: 'textarea', placeholder: '{{ $node.prev.data.text }}' },
      { key: 'maxTokens', label: 'Max Tokens', type: 'number', placeholder: '1000' },
    ],
  },
};

// ============================================================================
// INTEGRATIONS
// ============================================================================

const integrationSlack: ComponentConfig = {
  key: 'integration.slack',
  label: 'Slack',
  category: 'Integration',
  feature: 'automation',
  description: 'Send messages to Slack',
  icon: undefined,
  defaults: {
    operation: 'sendMessage',
    channel: '',
    text: '',
    attachments: '[]',
  },
  inspector: {
    fields: [
      { key: 'operation', label: 'Operation', type: 'select', options: ['sendMessage', 'uploadFile', 'getChannel', 'listChannels'] },
      { key: 'channel', label: 'Channel', type: 'text', placeholder: '#general or channel ID' },
      { key: 'text', label: 'Message Text', type: 'textarea', placeholder: 'Hello from automation!' },
      { key: 'attachments', label: 'Attachments (JSON)', type: 'textarea', placeholder: '[]' },
    ],
  },
};

const integrationEmail: ComponentConfig = {
  key: 'integration.email',
  label: 'Send Email',
  category: 'Integration',
  feature: 'automation',
  description: 'Send emails via SMTP',
  icon: undefined,
  defaults: {
    to: '',
    subject: '',
    body: '',
    bodyType: 'text',
    attachments: '',
  },
  inspector: {
    fields: [
      { key: 'to', label: 'To', type: 'text', placeholder: 'recipient@example.com' },
      { key: 'cc', label: 'CC', type: 'text', placeholder: 'cc@example.com' },
      { key: 'subject', label: 'Subject', type: 'text', placeholder: 'Email Subject' },
      { key: 'bodyType', label: 'Body Type', type: 'select', options: ['text', 'html'] },
      { key: 'body', label: 'Body', type: 'textarea', placeholder: 'Email content...' },
    ],
  },
};

const integrationDatabase: ComponentConfig = {
  key: 'integration.database',
  label: 'Database',
  category: 'Integration',
  feature: 'automation',
  description: 'Query databases (SQL/NoSQL)',
  icon: undefined,
  defaults: {
    operation: 'select',
    table: '',
    query: '',
    parameters: '[]',
  },
  inspector: {
    fields: [
      { key: 'operation', label: 'Operation', type: 'select', options: ['select', 'insert', 'update', 'delete', 'rawQuery'] },
      { key: 'table', label: 'Table/Collection', type: 'text', placeholder: 'users' },
      { key: 'query', label: 'Query / Filter', type: 'textarea', placeholder: 'SELECT * FROM users WHERE id = ?' },
      { key: 'parameters', label: 'Parameters (JSON)', type: 'textarea', placeholder: '["value1", "value2"]' },
    ],
  },
};

// ============================================================================
// EXPORT - Register all components
// ============================================================================

export const registerAutomationComponents = (registerComponent: (config: ComponentConfig) => void) => {
  // Register any modular widgets from registry
  Object.values(automationWidgetRegistry).forEach(registerComponent);

  // Triggers
  registerComponent(triggerManual);
  registerComponent(triggerWebhook);
  registerComponent(triggerSchedule);
  registerComponent(triggerEvent);

  // HTTP
  registerComponent(httpRequest);
  registerComponent(httpRespond);

  // Data Mapping
  registerComponent(dataSet);
  registerComponent(dataCode);
  registerComponent(dataExpression);
  registerComponent(dataExtract);
  registerComponent(dataMerge);

  // Flow Control
  registerComponent(flowIf);
  registerComponent(flowSwitch);
  registerComponent(flowSplit);
  registerComponent(flowLoop);
  registerComponent(flowWait);

  // Error Handling
  registerComponent(errorTryCatch);
  registerComponent(errorRetry);
  registerComponent(errorTrigger);

  // Credentials
  registerComponent(credentialsNode);

  // AI / LLM
  registerComponent(aiOpenAI);
  registerComponent(aiClaude);

  // Integrations
  registerComponent(integrationSlack);
  registerComponent(integrationEmail);
  registerComponent(integrationDatabase);
};
