/**
 * Registry Tests
 */

import { describe, it, expect, beforeEach, vi } from "vitest"

// Mock the RegistryLoader to avoid fast-glob dependency issues in browser environment
vi.mock("@/frontend/shared/foundation/utils/registry/RegistryLoader", () => ({
  RegistryLoader: class {
    async load() {
      return { loaded: 0, failed: 0, errors: [] }
    }
  }
}))

import { Registry } from "@/frontend/shared/foundation/utils/registry"
import type { ComponentWrapper } from "@/frontend/shared/foundation"

describe("Registry", () => {
  let registry: Registry

  beforeEach(() => {
    registry = new Registry()
  })

  it("should register a component", () => {
    const mockComponent: ComponentWrapper = {
      id: "test-button",
      type: "component",
      name: "TestButton",
      category: "buttons",
      component: () => null,
      defaults: {},
      props: {},
      fromJSON: (json) => json,
      toJSON: (props) => ({ type: "component", component: "test-button", props }),
      toTypeScript: () => "<TestButton />",
      validate: (props) => props,
    }

    registry.register({
      id: mockComponent.id,
      type: "component",
      wrapper: mockComponent,
      metadata: {},
    })

    expect(registry.has("test-button", "component")).toBe(true)
    expect(registry.getComponent("test-button")).toEqual(mockComponent)
  })

  it("should get all components", () => {
    const mockComponent: ComponentWrapper = {
      id: "test-button",
      type: "component",
      name: "TestButton",
      category: "buttons",
      component: () => null,
      defaults: {},
      props: {},
      fromJSON: (json) => json,
      toJSON: (props) => ({ type: "component", component: "test-button", props }),
      toTypeScript: () => "<TestButton />",
      validate: (props) => props,
    }

    registry.register({
      id: mockComponent.id,
      type: "component",
      wrapper: mockComponent,
      metadata: {},
    })

    const all = registry.getAllComponents()
    expect(all.length).toBe(1)
    expect(all[0].id).toBe("test-button")
  })

  it("should unregister a component", () => {
    const mockComponent: ComponentWrapper = {
      id: "test-button",
      type: "component",
      name: "TestButton",
      category: "buttons",
      component: () => null,
      defaults: {},
      props: {},
      fromJSON: (json) => json,
      toJSON: (props) => ({ type: "component", component: "test-button", props }),
      toTypeScript: () => "<TestButton />",
      validate: (props) => props,
    }

    registry.register({
      id: mockComponent.id,
      type: "component",
      wrapper: mockComponent,
      metadata: {},
    })

    expect(registry.has("test-button", "component")).toBe(true)

    registry.unregister("test-button", "component")

    expect(registry.has("test-button", "component")).toBe(false)
  })

  it("should search components", () => {
    const mockComponent: ComponentWrapper = {
      id: "test-button",
      type: "component",
      name: "TestButton",
      category: "buttons",
      component: () => null,
      defaults: {},
      props: {},
      fromJSON: (json) => json,
      toJSON: (props) => ({ type: "component", component: "test-button", props }),
      toTypeScript: () => "<TestButton />",
      validate: (props) => props,
      tags: ["button", "action"],
    }

    registry.register({
      id: mockComponent.id,
      type: "component",
      wrapper: mockComponent,
      metadata: {},
    })

    const results = registry.search("component", "button")
    expect(results.length).toBe(1)
    expect(results[0].id).toBe("test-button")
  })
})
