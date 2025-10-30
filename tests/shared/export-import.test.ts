/**
 * Export/Import Tests
 */

import { describe, it, expect } from "vitest"
import { exportToJSON, exportToJSONString } from "@/frontend/shared/foundation/utils/export"
import { importFromJSON, importFromJSONString } from "@/frontend/shared/foundation/utils/import"
import type { ComponentNode } from "@/frontend/shared/foundation"

describe("Export/Import", () => {
  it("should export nodes to JSON", () => {
    const nodes: ComponentNode[] = [
      {
        id: "button-1",
        type: "component",
        name: "Button",
        component: "button",
        props: { text: "Click me" },
      },
    ]

    const result = exportToJSON(nodes, { validate: false })

    expect(result.success).toBe(true)
    expect(result.data).toBeDefined()
    expect(result.data?.version).toBe("1.0.0")
    expect(result.data?.nodes["button-1"]).toBeDefined()
  })

  it("should export nodes to JSON string", () => {
    const nodes: ComponentNode[] = [
      {
        id: "button-1",
        type: "component",
        name: "Button",
        component: "button",
        props: { text: "Click me" },
      },
    ]

    const result = exportToJSONString(nodes, { validate: false })

    expect(result.success).toBe(true)
    expect(typeof result.data).toBe("string")
    expect(result.data).toContain('"version": "1.0.0"')  // Pretty-printed format
  })

  it("should import nodes from JSON", () => {
    const schema = {
      version: "1.0.0",
      format: "superspace-v1",
      type: "component",
      metadata: {
        id: "test",
        name: "Test",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      nodes: {
        "button-1": {
          type: "component",
          component: "button",
          props: { text: "Click me" },
        },
      },
      root: ["button-1"],
      layout: {},
    }

    const result = importFromJSON(schema, { validate: false })

    expect(result.success).toBe(true)
    expect(result.data).toBeDefined()
    expect(result.data?.length).toBe(1)
    expect(result.data?.[0].id).toBe("button-1")
  })

  it("should import nodes from JSON string", () => {
    const jsonString = JSON.stringify({
      version: "1.0.0",
      format: "superspace-v1",
      type: "component",
      metadata: {
        id: "test",
        name: "Test",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      nodes: {
        "button-1": {
          type: "component",
          component: "button",
          props: { text: "Click me" },
        },
      },
      root: ["button-1"],
      layout: {},
    })

    const result = importFromJSONString(jsonString, { validate: false })

    expect(result.success).toBe(true)
    expect(result.data?.length).toBe(1)
  })

  it("should handle invalid JSON string", () => {
    const result = importFromJSONString("invalid json")

    expect(result.success).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
  })
})
