/**
 * Toolbar Registry System
 *
 * Central registry for managing toolbar tools.
 * Similar to variant-registry.ts but for toolbars.
 *
 * @author SuperSpace Team
 * @version 1.0.0
 */

import { z } from "zod";
import type { ToolDef, ToolId, ToolRenderContext } from "./types";

/**
 * Registry for managing toolbar tools
 */
class ToolbarRegistry {
  private map = new Map<ToolId, ToolDef<any>>();

  /**
   * Register a new tool definition
   */
  register<T>(def: ToolDef<T>): void {
    if (this.map.has(def.id)) {
      console.warn(`[ToolbarRegistry] Overriding existing tool: ${def.id}`);
    }
    this.map.set(def.id, def);
  }

  /**
   * Get tool definition by ID
   */
  get(id: ToolId): ToolDef<any> | undefined {
    return this.map.get(id);
  }

  /**
   * Check if tool exists
   */
  has(id: ToolId): boolean {
    return this.map.has(id);
  }

  /**
   * Get all registered tools
   */
  list(): ToolDef<any>[] {
    return [...this.map.values()];
  }

  /**
   * Unregister a tool
   */
  unregister(id: ToolId): boolean {
    return this.map.delete(id);
  }

  /**
   * Clear all tools
   */
  clear(): void {
    this.map.clear();
  }

  /**
   * Validate tool params against schema
   */
  validate<T>(toolId: ToolId, params: unknown): T {
    const def = this.get(toolId);
    if (!def) {
      throw new Error(`[ToolbarRegistry] Tool not found: ${toolId}`);
    }
    return def.paramsSchema.parse(params);
  }
}

/** Global toolbar registry instance */
export const toolbarRegistry = new ToolbarRegistry();

/**
 * Helper function to create a tool with type inference
 */
export function createTool<T>(opts: {
  id: string;
  title?: string;
  description?: string;
  paramsSchema: z.ZodType<T>;
  render: (ctx: ToolRenderContext<T>) => React.ReactNode;
  defaultResponsive?: ToolDef<T>["defaultResponsive"];
}): ToolDef<T> {
  const def: ToolDef<T> = {
    id: opts.id as ToolId,
    title: opts.title,
    description: opts.description,
    paramsSchema: opts.paramsSchema,
    render: opts.render,
    defaultResponsive: opts.defaultResponsive,
  };
  return def;
}

/**
 * Built-in tool IDs (like itemVariant.chat, itemVariant.call)
 */
export const toolType = {
  search: "search" as ToolId,
  sort: "sort" as ToolId,
  filter: "filter" as ToolId,
  view: "view" as ToolId,
  actions: "actions" as ToolId,
  tabs: "tabs" as ToolId,
  breadcrumb: "breadcrumb" as ToolId,
  custom: "custom" as ToolId,
} as const;

/**
 * View mode constants
 */
export const viewMode = {
  grid: "grid",
  list: "list",
  tiles: "tiles",
  detail: "detail",
  thumbnails: "thumbnails",
  content: "content",
  table: "table",
  kanban: "kanban",
  calendar: "calendar",
} as const;

/**
 * Register all built-in tools
 * Call this once at app initialization
 */
export function registerBuiltInTools(): void {
  // Import and register built-in tools
  // This will be implemented in built-in-tools.tsx
  if (typeof window !== "undefined") {
    // Only register once in browser
    if (!(window as any).__TOOLBAR_TOOLS_REGISTERED) {
      (window as any).__TOOLBAR_TOOLS_REGISTERED = true;
      // Built-in tools will self-register when imported
    }
  }
}
