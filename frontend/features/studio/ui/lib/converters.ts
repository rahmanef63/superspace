/**
 * Studio JSON ↔ HTML / TSX Converters
 *
 * Provides:
 *   jsonToHtml(schema)       → static HTML string
 *   jsonToTsx(schema, name?) → React TSX component string
 *   htmlToJson(html)         → Studio Schema (best-effort parse)
 *   tsxToJson(tsx)           → Studio Schema (JSX → JSON best-effort)
 */

import type { Schema, SchemaNode } from '@/frontend/features/studio/ui/types';
export type { Schema, SchemaNode };

// ─── Helpers ─────────────────────────────────────────────────────────────────

const VOID_TAGS = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);

/** Map Studio widget type → HTML tag */
function widgetTypeToTag(type: string): string {
  const map: Record<string, string> = {
    div: 'div',
    section: 'section',
    container: 'div',
    row: 'div',
    column: 'div',
    flex: 'div',
    grid: 'div',
    twoColumn: 'div',
    threeColumn: 'div',
    text: 'span',
    heading: 'h2',
    button: 'button',
    image: 'img',
    link: 'a',
    card: 'div',
    hero: 'section',
    separator: 'hr',
    spacer: 'div',
    navGroup: 'nav',
    badge: 'span',
  };
  return map[type] ?? 'div';
}

/** Convert props record to HTML attribute string */
function propsToHtmlAttrs(type: string, props: Record<string, any>): string {
  const attrs: string[] = [];

  // className → class
  const cls = props.className ?? '';
  if (cls) attrs.push(`class="${escapeAttr(cls)}"`);

  // Image-specific
  if (type === 'image') {
    if (props.src) attrs.push(`src="${escapeAttr(props.src)}"`);
    if (props.alt !== undefined) attrs.push(`alt="${escapeAttr(String(props.alt))}"`);
    if (props.width) attrs.push(`width="${escapeAttr(String(props.width))}"`);
    if (props.height) attrs.push(`height="${escapeAttr(String(props.height))}"`);
    return attrs.join(' ');
  }

  // Link
  if (type === 'link') {
    if (props.href) attrs.push(`href="${escapeAttr(props.href)}"`);
    if (props.target) attrs.push(`target="${escapeAttr(props.target)}"`);
  }

  // data-path for routing containers
  if (props.path) attrs.push(`data-path="${escapeAttr(props.path)}"`);

  // style from inline layout props
  const style = buildInlineStyle(props);
  if (style) attrs.push(`style="${escapeAttr(style)}"`);

  return attrs.join(' ');
}

function buildInlineStyle(props: Record<string, any>): string {
  const parts: string[] = [];
  if (props.backgroundColor) parts.push(`background-color:${props.backgroundColor}`);
  if (props.color) parts.push(`color:${props.color}`);
  if (props.fontSize) parts.push(`font-size:${props.fontSize}`);
  if (props.display && props.display !== 'block') parts.push(`display:${props.display}`);
  if (props.flexDirection) parts.push(`flex-direction:${props.flexDirection}`);
  if (props.justifyContent) parts.push(`justify-content:${props.justifyContent}`);
  if (props.alignItems) parts.push(`align-items:${props.alignItems}`);
  if (props.gap) parts.push(`gap:${props.gap}`);
  return parts.join(';');
}

function escapeAttr(v: string): string {
  return v.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeHtml(v: string): string {
  return v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Get the inner text content for a node */
function nodeInnerText(type: string, props: Record<string, any>): string | null {
  if (type === 'text' || type === 'heading') return escapeHtml(String(props.content ?? ''));
  if (type === 'button') return escapeHtml(String(props.text ?? props.label ?? 'Button'));
  if (type === 'link') return escapeHtml(String(props.text ?? props.label ?? props.children ?? ''));
  if (type === 'badge') return escapeHtml(String(props.text ?? props.label ?? ''));
  return null;
}

// ─── JSON → HTML ──────────────────────────────────────────────────────────────

function renderNodeHtml(schema: Schema, id: string, indent = 0, visited = new Set<string>()): string {
  if (visited.has(id)) return `<!-- cycle: ${id} -->`;
  visited.add(id);

  const node = schema.nodes[id];
  if (!node) return '';

  const type = node.type;
  const props = node.props ?? {};
  const tag = props.tag ?? widgetTypeToTag(type);
  const attrs = propsToHtmlAttrs(type, props);
  const pad = '  '.repeat(indent);
  const childPad = '  '.repeat(indent + 1);

  if (VOID_TAGS.has(tag)) {
    return `${pad}<${tag}${attrs ? ' ' + attrs : ''} />`;
  }

  const innerText = nodeInnerText(type, props);
  const childIds = node.children ?? [];

  if (innerText !== null && childIds.length === 0) {
    return `${pad}<${tag}${attrs ? ' ' + attrs : ''}>${innerText}</${tag}>`;
  }

  const childrenHtml = childIds
    .map((cid) => renderNodeHtml(schema, cid, indent + 1, new Set(visited)))
    .filter(Boolean)
    .join('\n');

  if (!childrenHtml && innerText === null) {
    return `${pad}<${tag}${attrs ? ' ' + attrs : ''}></${tag}>`;
  }

  const inner = [innerText ?? '', childrenHtml].filter(Boolean).join('\n');
  return `${pad}<${tag}${attrs ? ' ' + attrs : ''}>\n${inner}\n${pad}</${tag}>`;
}

/** Convert Studio JSON schema to a static HTML string */
export function jsonToHtml(schema: Schema): string {
  const roots = schema.root ?? [];
  const body = roots
    .map((id) => renderNodeHtml(schema, id, 1))
    .filter(Boolean)
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Studio Export</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
${body}
</body>
</html>`;
}

// ─── JSON → TSX ───────────────────────────────────────────────────────────────

function propsToJsxAttrs(type: string, props: Record<string, any>): string {
  const attrs: string[] = [];

  if (props.className) attrs.push(`className="${props.className}"`);

  if (type === 'image') {
    if (props.src) attrs.push(`src="${props.src}"`);
    if (props.alt !== undefined) attrs.push(`alt="${String(props.alt)}"`);
    const w = Number(props.width) || 640;
    const h = Number(props.height) || 420;
    attrs.push(`width={${w}}`);
    attrs.push(`height={${h}}`);
    if (props.objectFit) attrs.push(`style={{ objectFit: '${props.objectFit}' }}`);
  }

  if (type === 'link') {
    if (props.href) attrs.push(`href="${props.href}"`);
    if (props.target) attrs.push(`target="${props.target}"`);
  }

  if (props.path) attrs.push(`data-path="${props.path}"`);

  // inline style from layout props
  const styleParts: string[] = [];
  if (props.backgroundColor) styleParts.push(`backgroundColor: '${props.backgroundColor}'`);
  if (props.color) styleParts.push(`color: '${props.color}'`);
  if (props.display && props.display !== 'block') styleParts.push(`display: '${props.display}'`);
  if (props.flexDirection) styleParts.push(`flexDirection: '${props.flexDirection}'`);
  if (props.justifyContent) styleParts.push(`justifyContent: '${props.justifyContent}'`);
  if (props.alignItems) styleParts.push(`alignItems: '${props.alignItems}'`);
  if (props.gap) styleParts.push(`gap: '${props.gap}'`);
  if (styleParts.length > 0) attrs.push(`style={{ ${styleParts.join(', ')} }}`);

  return attrs.length > 0 ? ' ' + attrs.join(' ') : '';
}

function renderNodeTsx(schema: Schema, id: string, indent = 1, visited = new Set<string>()): string {
  if (visited.has(id)) return `${' '.repeat(indent * 2)}{/* cycle: ${id} */}`;
  visited.add(id);

  const node = schema.nodes[id];
  if (!node) return '';

  const type = node.type;
  const props = node.props ?? {};
  const childIds = node.children ?? [];
  const pad = ' '.repeat(indent * 2);

  // Special: Next.js Image for img nodes
  if (type === 'image') {
    const src = props.src ?? 'https://picsum.photos/640/420';
    const alt = props.alt ?? '';
    const w = Number(props.width) || 640;
    const h = Number(props.height) || 420;
    const cls = props.className ? ` className="${props.className}"` : '';
    return `${pad}<Image src="${src}" alt="${alt}" width={${w}} height={${h}}${cls} />`;
  }

  const tag = props.tag ?? widgetTypeToTag(type);
  const attrs = propsToJsxAttrs(type, props);
  const innerText = nodeInnerText(type, props);

  if (VOID_TAGS.has(tag)) {
    return `${pad}<${tag}${attrs} />`;
  }

  const childrenTsx = childIds
    .map((cid) => renderNodeTsx(schema, cid, indent + 1, new Set(visited)))
    .filter(Boolean)
    .join('\n');

  if (innerText !== null && !childrenTsx) {
    return `${pad}<${tag}${attrs}>${innerText}</${tag}>`;
  }

  if (!childrenTsx && innerText === null) {
    return `${pad}<${tag}${attrs} />`;
  }

  const inner = [innerText ? `${pad}  ${innerText}` : '', childrenTsx].filter(Boolean).join('\n');
  return `${pad}<${tag}${attrs}>\n${inner}\n${pad}</${tag}>`;
}

/** Convert Studio JSON schema to a React TSX component string */
export function jsonToTsx(schema: Schema, componentName = 'StudioPage'): string {
  const roots = schema.root ?? [];
  const hasImages = Object.values(schema.nodes).some((n) => n.type === 'image');

  const body = roots
    .map((id) => renderNodeTsx(schema, id, 2))
    .filter(Boolean)
    .join('\n');

  const imageImport = hasImages ? "import Image from 'next/image';\n" : '';

  return `import React from 'react';
${imageImport}
export default function ${componentName}() {
  return (
    <>
${body}
    </>
  );
}
`;
}

// ─── HTML → JSON ──────────────────────────────────────────────────────────────

let _nodeCounter = 0;
function genId(prefix: string): string {
  return `${prefix}-${++_nodeCounter}`;
}

/** Best-effort: parse static HTML into Studio Schema nodes */
export function htmlToJson(html: string): Schema {
  _nodeCounter = 0;
  const nodes: Record<string, SchemaNode> = {};

  // We use a simple recursive DOM-like parse via DOMParser in browser environments
  // or a regex-based fallback
  if (typeof window !== 'undefined' && typeof DOMParser !== 'undefined') {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const body = doc.body;
    const rootIds: string[] = [];
    for (const child of Array.from(body.children)) {
      const id = domNodeToStudio(child as Element, nodes);
      if (id) rootIds.push(id);
    }
    return { version: '0.5', root: rootIds, nodes };
  }

  // Server-side fallback: wrap entire HTML in a custom block
  const id = genId('html-block');
  nodes[id] = { type: 'customHtml', props: { html, className: '' }, children: [] };
  return { version: '0.5', root: [id], nodes };
}

function domNodeToStudio(el: Element, nodes: Record<string, SchemaNode>): string {
  const tag = el.tagName.toLowerCase();
  const className = el.getAttribute('class') ?? '';
  const id = genId(tag);

  // Map common tags to Studio widget types
  const typeMap: Record<string, string> = {
    img: 'image',
    a: 'link',
    button: 'button',
    h1: 'text', h2: 'text', h3: 'text', h4: 'text', h5: 'text', h6: 'text',
    p: 'text', span: 'text', strong: 'text', em: 'text',
    section: 'section', article: 'div', nav: 'div',
    header: 'div', footer: 'div', main: 'div', aside: 'div',
    ul: 'div', ol: 'div', li: 'div',
  };

  const type = typeMap[tag] ?? 'div';
  const props: Record<string, any> = {};

  if (className) props.className = className;

  if (type === 'text') {
    props.tag = tag;
    props.content = el.textContent ?? '';
  } else if (type === 'image') {
    props.src = el.getAttribute('src') ?? '';
    props.alt = el.getAttribute('alt') ?? '';
    const w = el.getAttribute('width');
    const h = el.getAttribute('height');
    if (w) props.width = w;
    if (h) props.height = h;
  } else if (type === 'link') {
    props.href = el.getAttribute('href') ?? '';
    props.text = el.textContent ?? '';
  } else if (type === 'button') {
    props.text = el.textContent ?? 'Button';
  }

  const childIds: string[] = [];
  if (type !== 'text' && type !== 'image' && type !== 'link' && type !== 'button') {
    for (const child of Array.from(el.children)) {
      const cid = domNodeToStudio(child as Element, nodes);
      if (cid) childIds.push(cid);
    }
  }

  nodes[id] = { type, props, children: childIds };
  return id;
}

// ─── TSX → JSON ───────────────────────────────────────────────────────────────

/**
 * Best-effort TSX → Studio JSON.
 * Strips React boilerplate, then passes the JSX body through htmlToJson
 * after converting JSX attribute syntax to HTML attributes.
 */
export function tsxToJson(tsx: string): Schema {
  // Extract JSX return body
  const returnMatch = tsx.match(/return\s*\(([\s\S]*?)\);?\s*(?:}|$)/);
  const jsxBody = returnMatch ? returnMatch[1].trim() : tsx;

  // JSX → HTML attribute conversions
  const html = jsxBody
    .replace(/className=/g, 'class=')
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '') // strip JSX comments
    .replace(/\{[^{}]+\}/g, (m) => {
      // Replace JSX expressions with string values where possible
      const inner = m.slice(1, -1).trim();
      if (inner.startsWith('"') || inner.startsWith("'")) return inner.slice(1, -1);
      return inner;
    })
    .replace(/<Image\b/g, '<img')
    .replace(/<>/g, '<div>')
    .replace(/<\/>/g, '</div>');

  return htmlToJson(html);
}
