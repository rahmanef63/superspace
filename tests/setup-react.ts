/**
 * Vitest Setup for React Component Tests
 * 
 * Configures jsdom environment and testing-library extensions
 */

import React from 'react';
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Make React available globally for JSX
globalThis.React = React;

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia (required for some UI components)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {}, // deprecated
    removeListener: () => {}, // deprecated
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Mock IntersectionObserver (required for some UI components)
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as any;

// Mock ResizeObserver (required for some UI components)
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as any;

// Mock scrollIntoView (required for cmdk Command component)
Element.prototype.scrollIntoView = function() {};

// Mock getComputedStyle for Radix UI components
const originalGetComputedStyle = window.getComputedStyle;
window.getComputedStyle = (element: Element, pseudoElt?: string | null) => {
  const style = originalGetComputedStyle(element, pseudoElt);
  return {
    ...style,
    getPropertyValue: (prop: string) => {
      // Return default values for animation properties
      if (prop === '--radix-popper-available-width') return '300px';
      if (prop === '--radix-popper-available-height') return '400px';
      return style.getPropertyValue(prop);
    },
  } as CSSStyleDeclaration;
};
