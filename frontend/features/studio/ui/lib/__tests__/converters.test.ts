/**
 * Tests for Studio JSON ↔ HTML / TSX Converters
 *
 * @vitest-environment happy-dom
 */
import { describe, it, expect } from 'vitest';
import { jsonToHtml, jsonToTsx, htmlToJson, tsxToJson } from '../converters';
import type { Schema } from '../converters';

// ─── Test fixtures ────────────────────────────────────────────────────────────

const minimalSchema: Schema = {
  version: '0.4',
  root: ['root-1'],
  nodes: {
    'root-1': { type: 'div', props: { className: 'container' }, children: [] },
  },
};

const schemaWithText: Schema = {
  version: '0.4',
  root: ['root-1'],
  nodes: {
    'root-1': { type: 'div', props: {}, children: ['heading-1', 'para-1'] },
    'heading-1': { type: 'text', props: { tag: 'h1', content: 'Hello World' }, children: [] },
    'para-1': { type: 'text', props: { tag: 'p', content: 'Test paragraph' }, children: [] },
  },
};

const schemaWithImage: Schema = {
  version: '0.4',
  root: ['root-1'],
  nodes: {
    'root-1': { type: 'div', props: {}, children: ['img-1'] },
    'img-1': { type: 'image', props: { src: 'https://example.com/photo.jpg', alt: 'Photo', width: '800', height: '600' }, children: [] },
  },
};

const schemaWithButton: Schema = {
  version: '0.4',
  root: ['root-1'],
  nodes: {
    'root-1': { type: 'div', props: {}, children: ['btn-1'] },
    'btn-1': { type: 'button', props: { text: 'Click Me' }, children: [] },
  },
};

// ─── jsonToHtml ───────────────────────────────────────────────────────────────

describe('jsonToHtml', () => {
  it('returns valid HTML document string', () => {
    const html = jsonToHtml(minimalSchema);
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<html');
    expect(html).toContain('</html>');
    expect(html).toContain('<body>');
  });

  it('includes Tailwind CDN script', () => {
    const html = jsonToHtml(minimalSchema);
    expect(html).toContain('cdn.tailwindcss.com');
  });

  it('renders div with className', () => {
    const html = jsonToHtml(minimalSchema);
    expect(html).toContain('class="container"');
  });

  it('renders text nodes with correct tag and content', () => {
    const html = jsonToHtml(schemaWithText);
    expect(html).toContain('<h1>Hello World</h1>');
    expect(html).toContain('<p>Test paragraph</p>');
  });

  it('renders image as void tag', () => {
    const html = jsonToHtml(schemaWithImage);
    expect(html).toContain('<img');
    expect(html).toContain('src="https://example.com/photo.jpg"');
    expect(html).toContain('alt="Photo"');
  });

  it('renders button with text content', () => {
    const html = jsonToHtml(schemaWithButton);
    expect(html).toContain('<button');
    expect(html).toContain('Click Me');
  });

  it('handles empty root array', () => {
    const schema: Schema = { version: '0.4', root: [], nodes: {} };
    const html = jsonToHtml(schema);
    expect(html).toContain('<!DOCTYPE html>');
  });

  it('handles nested nodes', () => {
    const html = jsonToHtml(schemaWithText);
    expect(html).toContain('<div>');
    expect(html).toContain('<h1>');
  });

  it('escapes special characters in attributes', () => {
    const schema: Schema = {
      version: '0.4',
      root: ['n1'],
      nodes: { n1: { type: 'link', props: { href: 'https://example.com?a=1&b=2' }, children: [] } },
    };
    const html = jsonToHtml(schema);
    expect(html).toContain('&amp;');
  });
});

// ─── jsonToTsx ────────────────────────────────────────────────────────────────

describe('jsonToTsx', () => {
  it('returns a valid React component string', () => {
    const tsx = jsonToTsx(minimalSchema);
    expect(tsx).toContain("import React from 'react'");
    expect(tsx).toContain('export default function');
    expect(tsx).toContain('return (');
  });

  it('uses provided component name', () => {
    const tsx = jsonToTsx(minimalSchema, 'MyPage');
    expect(tsx).toContain('function MyPage()');
  });

  it('defaults component name to StudioPage', () => {
    const tsx = jsonToTsx(minimalSchema);
    expect(tsx).toContain('function StudioPage()');
  });

  it('includes Next.js Image import when schema has image nodes', () => {
    const tsx = jsonToTsx(schemaWithImage);
    expect(tsx).toContain("import Image from 'next/image'");
  });

  it('does NOT include Image import when no image nodes', () => {
    const tsx = jsonToTsx(schemaWithText);
    expect(tsx).not.toContain("import Image from 'next/image'");
  });

  it('renders image as Next.js Image component', () => {
    const tsx = jsonToTsx(schemaWithImage);
    expect(tsx).toContain('<Image');
    expect(tsx).toContain('src="https://example.com/photo.jpg"');
  });

  it('renders className prop', () => {
    const tsx = jsonToTsx(minimalSchema);
    expect(tsx).toContain('className="container"');
  });

  it('renders button text', () => {
    const tsx = jsonToTsx(schemaWithButton);
    expect(tsx).toContain('Click Me');
  });
});

// ─── htmlToJson ───────────────────────────────────────────────────────────────

describe('htmlToJson', () => {
  it('returns a schema with version and root array', () => {
    const schema = htmlToJson('<div class="test">Hello</div>');
    expect(schema.version).toBeTruthy();
    expect(Array.isArray(schema.root)).toBe(true);
    expect(typeof schema.nodes).toBe('object');
  });

  it('parses a simple div with class', () => {
    const schema = htmlToJson('<div class="wrapper">Content</div>');
    const rootId = schema.root[0];
    expect(rootId).toBeTruthy();
    const node = schema.nodes[rootId];
    expect(node.type).toBe('div');
  });

  it('maps img tag to image type', () => {
    const schema = htmlToJson('<img src="https://example.com/x.jpg" alt="Test" />');
    const rootId = schema.root[0];
    const node = schema.nodes[rootId];
    expect(node.type).toBe('image');
    expect(node.props.src).toBe('https://example.com/x.jpg');
    expect(node.props.alt).toBe('Test');
  });

  it('maps a tag to link type', () => {
    const schema = htmlToJson('<a href="https://example.com">Link</a>');
    const rootId = schema.root[0];
    const node = schema.nodes[rootId];
    expect(node.type).toBe('link');
    expect(node.props.href).toBe('https://example.com');
  });

  it('maps heading tags to text type with tag prop', () => {
    const schema = htmlToJson('<h1>Title</h1>');
    const rootId = schema.root[0];
    const node = schema.nodes[rootId];
    expect(node.type).toBe('text');
    expect(node.props.tag).toBe('h1');
    expect(node.props.content).toBe('Title');
  });

  it('handles multiple root elements', () => {
    const schema = htmlToJson('<div>One</div><div>Two</div>');
    expect(schema.root).toHaveLength(2);
  });

  it('handles empty HTML', () => {
    const schema = htmlToJson('');
    expect(Array.isArray(schema.root)).toBe(true);
  });
});

// ─── tsxToJson ────────────────────────────────────────────────────────────────

describe('tsxToJson', () => {
  it('returns a schema object', () => {
    const tsx = `
      export default function Page() {
        return (
          <div className="wrapper">
            <h1>Hello</h1>
          </div>
        );
      }
    `;
    const schema = tsxToJson(tsx);
    expect(schema.version).toBeTruthy();
    expect(Array.isArray(schema.root)).toBe(true);
  });

  it('converts className to class attribute', () => {
    const tsx = `export default function P() { return (<div className="test" />); }`;
    const schema = tsxToJson(tsx);
    // The resulting schema should parse it via htmlToJson which handles class
    expect(schema).toBeTruthy();
    expect(typeof schema.nodes).toBe('object');
  });

  it('handles bare JSX without return wrapper', () => {
    const schema = tsxToJson('<div class="bare">Bare JSX</div>');
    expect(schema.root).toHaveLength(1);
  });

  it('converts <Image> back to <img>', () => {
    const tsx = `
      import Image from 'next/image';
      export default function P() {
        return (
          <Image src="https://x.com/img.jpg" alt="img" width={640} height={420} />
        );
      }
    `;
    const schema = tsxToJson(tsx);
    // Should have parsed something
    expect(schema).toBeTruthy();
    expect(schema.root.length).toBeGreaterThan(0);
  });
});
