/**
 * Shared System Entry Point
 *
 * Expose domain-specific facades via namespaced exports to avoid symbol collisions.
 *
 * Usage:
 *   import { builder, ui } from "@/frontend/shared"
 *   builder.SharedCanvasProvider(...)
 */

// export * as types from "./types"; // DELETED - Use foundation/types
export * as builder from "./builder";
export * as foundation from "./foundation";
export * as communications from "./communications";
export * as settings from "./settings";
export * as ui from "./ui";
export * as context from "./context";
