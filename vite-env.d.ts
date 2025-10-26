/// <reference types="vite/client" />

// Augment ImportMeta to include Vite's env + glob features
// This is needed because Vitest uses Vite but doesn't expose all client types
interface ImportMeta {
  readonly env: ImportMetaEnv;
  glob<T = any>(
    pattern: string | string[],
    options?: {
      eager?: boolean;
      import?: string;
      as?: string;
      query?: Record<string, string | number | boolean>;
    }
  ): Record<string, T>;
  globEager: ImportMeta['glob'];
}
