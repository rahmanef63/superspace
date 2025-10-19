/// <reference types="vite/client" />

// Augment ImportMeta to include Vite's glob feature
// This is needed because Vitest uses Vite but doesn't expose all client types
interface ImportMeta {
  glob<T = any>(
    pattern: string | string[],
    options?: {
      eager?: boolean;
      import?: string;
      as?: string;
    }
  ): Record<string, T>;
}
