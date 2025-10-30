/**
 * Converters Tests
 */

import { describe, it, expect } from "vitest"
import {
  convertCMSSchemaToV1,
  convertV1ToCMSSchema,
} from "@/frontend/shared/foundation/utils/converters"
import type { CMSLegacySchemaV04Type, ExportSchemaV1Type } from "@/frontend/shared/foundation"

describe("CMS Converter", () => {
  it("should convert CMS v0.4 schema to v1.0", () => {
    const cmsSchema: CMSLegacySchemaV04Type = {
      version: "0.4",
      root: ["node-1"],
      nodes: {
        "node-1": {
          type: "button",
          props: { text: "Click me" },
          children: [],
        },
      },
    }

    const result = convertCMSSchemaToV1(cmsSchema)

    expect(result.success).toBe(true)
    expect(result.data).toBeDefined()
    expect(result.data?.version).toBe("1.0.0")
    expect(result.data?.nodes["node-1"].type).toBe("component")
    expect(result.data?.nodes["node-1"].component).toBe("button")
  })

  it("should convert v1.0 schema back to CMS v0.4", () => {
    const v1Schema: ExportSchemaV1Type = {
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
        "node-1": {
          type: "component",
          component: "button",
          props: { text: "Click me" },
        },
      },
      root: ["node-1"],
      layout: {},
    }

    const result = convertV1ToCMSSchema(v1Schema)

    expect(result.success).toBe(true)
    expect(result.data).toBeDefined()
    expect(result.data?.version).toBe("0.4")
    expect(result.data?.nodes["node-1"].type).toBe("button")
  })
})
