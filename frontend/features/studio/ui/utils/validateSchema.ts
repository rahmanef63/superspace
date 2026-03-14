/**
 * Studio Schema Validator
 *
 * Validates a Studio JSON schema object and returns a list of structured errors.
 * Used by ImportJsonDialog before applying a schema to the canvas.
 */

export interface SchemaError {
  id: string;           // node ID, 'root', or 'schema'
  message: string;
  severity: 'error' | 'warning';
}

/** All widget types recognised by the renderer */
const KNOWN_TYPES = new Set([
  // Layout
  'div', 'section', 'row', 'column', 'grid', 'flex', 'twoColumn', 'threeColumn',
  // Content
  'text', 'card',
  // Media
  'image',
  // Action
  'button', 'iconButton',
  // Navigation
  'navGroup', 'link',
  // Templates
  'hero', 'heroComposite',
  // UI components (shadcn)
  'accordion', 'alert', 'aspectRatio', 'avatar', 'badge', 'checkbox', 'progress',
  'radioGroup', 'scrollArea', 'skeleton', 'table', 'textarea', 'toggleGroup',
  'tabs', 'separator', 'tooltip', 'collapsible', 'carousel', 'breadcrumb',
  'dialog', 'hoverCard', 'input', 'select', 'switch', 'divider', 'spacer', 'heading',
  // Smart blocks
  'chartBlock', 'kanbanBlock', 'tableBlock', 'calendarBlock', 'filterBlock',
  'fileBlock', 'commentBlock', 'richTextBlock', 'formBlock', 'mediaBlock',
  'profileBlock', 'metricCardBlock', 'activityBlock', 'listBlock', 'eventsBlock',
  'statsBlock', 'agentBlock', 'teamBlock', 'timeRangeBlock',
]);

export function validateSchema(raw: unknown): SchemaError[] {
  const errors: SchemaError[] = [];

  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return [{ id: 'schema', message: 'Expected a JSON object at the top level', severity: 'error' }];
  }

  const schema = raw as Record<string, any>;

  if (!schema.nodes || typeof schema.nodes !== 'object' || Array.isArray(schema.nodes)) {
    errors.push({ id: 'schema', message: 'Missing required field "nodes" (must be an object)', severity: 'error' });
    return errors;
  }

  if (!schema.root || !Array.isArray(schema.root)) {
    errors.push({ id: 'schema', message: 'Missing required field "root" (must be a string array)', severity: 'error' });
  }

  const nodeIds = new Set(Object.keys(schema.nodes));

  // Check root IDs exist
  for (const id of (schema.root ?? [])) {
    if (typeof id !== 'string') {
      errors.push({ id: 'root', message: `Root entry is not a string: ${JSON.stringify(id)}`, severity: 'error' });
    } else if (!nodeIds.has(id)) {
      errors.push({ id: 'root', message: `Root references unknown node: "${id}"`, severity: 'error' });
    }
  }

  // Validate each node
  for (const [id, node] of Object.entries(schema.nodes) as [string, any][]) {
    if (!node || typeof node !== 'object' || Array.isArray(node)) {
      errors.push({ id, message: 'Node value must be an object', severity: 'error' });
      continue;
    }

    if (!node.type || typeof node.type !== 'string') {
      errors.push({ id, message: 'Missing "type" field', severity: 'error' });
    } else if (!KNOWN_TYPES.has(node.type)) {
      errors.push({ id, message: `Unknown widget type: "${node.type}" — may not render correctly`, severity: 'warning' });
    }

    if (!Array.isArray(node.children)) {
      errors.push({ id, message: '"children" should be an array (use [] if none)', severity: 'warning' });
    } else {
      for (const childId of node.children) {
        if (typeof childId !== 'string') {
          errors.push({ id, message: `Children must be strings, got: ${JSON.stringify(childId)}`, severity: 'error' });
        } else if (!nodeIds.has(childId)) {
          errors.push({ id, message: `References unknown child node: "${childId}"`, severity: 'error' });
        }
      }
    }

    if (node.props !== undefined && (typeof node.props !== 'object' || Array.isArray(node.props))) {
      errors.push({ id, message: '"props" must be an object', severity: 'error' });
    }
  }

  // Detect circular references
  const visited = new Set<string>();
  const inStack = new Set<string>();

  const hasCycle = (id: string, path: string[]): boolean => {
    if (inStack.has(id)) {
      errors.push({
        id,
        message: `Circular reference: ${path.concat(id).join(' → ')}`,
        severity: 'error',
      });
      return true;
    }
    if (visited.has(id)) return false;
    visited.add(id);
    inStack.add(id);
    const node = schema.nodes[id];
    for (const childId of (node?.children ?? [])) {
      if (nodeIds.has(childId) && hasCycle(childId, path.concat(id))) return true;
    }
    inStack.delete(id);
    return false;
  };

  for (const rootId of (schema.root ?? [])) {
    if (nodeIds.has(rootId)) hasCycle(rootId, []);
  }

  return errors;
}

/** Returns true if there are no 'error' level issues (warnings alone are fine to import) */
export function isSchemaValid(errors: SchemaError[]): boolean {
  return !errors.some(e => e.severity === 'error');
}
