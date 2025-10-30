/**
 * Grouping Tests
 */

import { describe, it, expect } from "vitest"
import {
  createGroup,
  explodeGroup,
  addToGroup,
  removeFromGroup,
  lockGroup,
  unlockGroup,
} from "@/frontend/shared/foundation/utils/grouping"
import { EmptyGroupError, InvalidGroupOperationError } from "@/frontend/shared/foundation"

describe("Group Operations", () => {
  it("should create a group", () => {
    const group = createGroup(["node-1", "node-2"])

    expect(group.type).toBe("group")
    expect(group.children).toEqual(["node-1", "node-2"])
    expect(group.locked).toBe(false)
    expect(group.collapsed).toBe(false)
  })

  it("should throw error when creating empty group", () => {
    expect(() => createGroup([])).toThrow(EmptyGroupError)
  })

  it("should explode a group", () => {
    const group = createGroup(["node-1", "node-2"])
    const nodeIds = explodeGroup(group)

    expect(nodeIds).toEqual(["node-1", "node-2"])
  })

  it("should not explode a locked group", () => {
    const group = lockGroup(createGroup(["node-1", "node-2"]))

    expect(() => explodeGroup(group)).toThrow(InvalidGroupOperationError)
  })

  it("should add nodes to group", () => {
    const group = createGroup(["node-1"])
    const updated = addToGroup(group, ["node-2", "node-3"])

    expect(updated.children).toEqual(["node-1", "node-2", "node-3"])
  })

  it("should remove nodes from group", () => {
    const group = createGroup(["node-1", "node-2", "node-3"])
    const updated = removeFromGroup(group, ["node-2"])

    expect(updated.children).toEqual(["node-1", "node-3"])
  })

  it("should throw error when removing all nodes", () => {
    const group = createGroup(["node-1"])

    expect(() => removeFromGroup(group, ["node-1"])).toThrow(EmptyGroupError)
  })

  it("should lock and unlock group", () => {
    const group = createGroup(["node-1"])

    const locked = lockGroup(group)
    expect(locked.locked).toBe(true)

    const unlocked = unlockGroup(locked)
    expect(unlocked.locked).toBe(false)
  })
})
