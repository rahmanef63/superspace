import { beforeEach, describe, expect, it } from "vitest"
import { convexTest } from "convex-test"
import { api } from "../../convex/_generated/api"
import type { Id } from "../../convex/_generated/dataModel"
import schema from "../../convex/schema"

describe("Golden Path (GP1 + GP2 + GP3)", () => {
  let t: any
  let userId: Id<"users">
  let identity: any

  beforeEach(async () => {
    t = convexTest(schema, import.meta.glob([
      "../../convex/auth/auth.ts",
      "../../convex/auth/helpers.ts",
      "../../convex/components/**/*.ts",
      "../../convex/dev/**/*.ts",
      "../../convex/features/**/*.ts",
      "../../convex/lib/**/*.ts",
      "../../convex/menu/**/!(menu_manifest_data|optional_features_catalog|utils|*[Tt]ypes|helpers).ts",
      "../../convex/payment/**/!(utils|*[Tt]ypes|helpers).ts",
      "../../convex/user/**/*.ts",
      "../../convex/workspace/**/*.ts",
      "../../convex/_generated/**/*.js",
    ]))

    userId = await t.run(async (ctx: any) => {
      return await ctx.db.insert("users", {
        name: "Golden Path User",
        email: "golden-path@example.com",
        clerkId: "golden-path-clerk-id",
        status: "active",
      })
    })

    identity = {
      subject: String(userId),
      email: "golden-path@example.com",
    }
  })

  it("GP1: create workspace → create database → add first row", async () => {
    const workspaceId = await t.withIdentity(identity).mutation(api.workspace.workspaces.createWorkspace, {
      name: "Golden Path Workspace",
      slug: "golden-path-workspace",
      type: "personal",
      isPublic: false,
    })

    const tableId = await t.withIdentity(identity).mutation(api.features.database.mutations.createTable, {
      workspaceId,
      name: "Tasks",
      description: "Golden path table",
    })

    const fields = await t.withIdentity(identity).query(api.features.database.queries.listFields, { tableId })
    expect(fields.length).toBeGreaterThan(0)

    const nameField = fields.find((f: any) => f.name === "Name")
    expect(nameField).toBeTruthy()

    const rowId = await t.withIdentity(identity).mutation(api.features.database.mutations.createRow, {
      tableId,
      data: {
        [String(nameField._id)]: "First task",
      },
    })

    await t.run(async (ctx: any) => {
      const row = await ctx.db.get(rowId)
      expect(row).toBeTruthy()
      expect(row.tableId).toBe(tableId)
      expect(row.workspaceId).toBe(workspaceId)
      expect(row.data[String(nameField._id)]).toBe("First task")
    })
  })

  it("GP2: create view → apply filter → list filtered rows", async () => {
    const workspaceId = await t.withIdentity(identity).mutation(api.workspace.workspaces.createWorkspace, {
      name: "Golden Path Workspace 2",
      slug: "golden-path-workspace-2",
      type: "personal",
      isPublic: false,
    })

    const tableId = await t.withIdentity(identity).mutation(api.features.database.mutations.createTable, {
      workspaceId,
      name: "Contacts",
      description: "Golden path table for filtering",
    })

    const fields = await t.withIdentity(identity).query(api.features.database.queries.listFields, { tableId })
    const nameField = fields.find((f: any) => f.name === "Name")
    expect(nameField).toBeTruthy()

    await t.withIdentity(identity).mutation(api.features.database.mutations.createRow, {
      tableId,
      data: { [String(nameField._id)]: "Alpha" },
    })
    await t.withIdentity(identity).mutation(api.features.database.mutations.createRow, {
      tableId,
      data: { [String(nameField._id)]: "Beta" },
    })

    const viewId = await t.withIdentity(identity).mutation(api.features.database.mutations.createView, {
      tableId,
      name: "Filtered",
      type: "table",
    })

    await t.withIdentity(identity).mutation(api.features.database.mutations.updateView, {
      id: viewId,
      settings: {
        filters: [
          {
            fieldId: String(nameField._id),
            operator: "contains",
            value: "alp",
          },
        ],
        sorts: [],
        visibleFields: fields.map((f: any) => f._id),
        fieldWidths: {},
      },
    })

    const filteredRows = await t.withIdentity(identity).query(api.features.database.rows.list, {
      tableId,
      viewId,
    })

    expect(filteredRows).toHaveLength(1)
    expect(filteredRows[0].data[String(nameField._id)]).toBe("Alpha")
  })

  it("GP3: create doc -> link to db row -> see backlinks", async () => {
    const workspaceId = await t.withIdentity(identity).mutation(api.workspace.workspaces.createWorkspace, {
      name: "Golden Path Workspace 3",
      slug: "golden-path-workspace-3",
      type: "personal",
      isPublic: false,
    })

    const tableId = await t.withIdentity(identity).mutation(api.features.database.mutations.createTable, {
      workspaceId,
      name: "Docs Linking",
      description: "Golden path doc-db link table",
    })

    const fields = await t.withIdentity(identity).query(api.features.database.queries.listFields, { tableId })
    const nameField = fields.find((f: any) => f.name === "Name")
    expect(nameField).toBeTruthy()

    const rowId = await t.withIdentity(identity).mutation(api.features.database.mutations.createRow, {
      tableId,
      data: { [String(nameField._id)]: "Linked row" },
    })

    const docId = await t.withIdentity(identity).mutation((api as any)["features/docs/documents"].create, {
      title: "Linked doc",
      isPublic: false,
      workspaceId,
    })

    await t.withIdentity(identity).mutation(api.features.database.mutations.linkDocToRow, {
      rowId,
      docId,
    })

    const backlinks = await t.withIdentity(identity).query(api.features.database.queries.getRowsLinkedToDoc, {
      docId,
    })

    expect(backlinks).toHaveLength(1)
    expect(backlinks[0].rowId).toBe(rowId)
    expect(backlinks[0].tableId).toBe(tableId)

    await t.withIdentity(identity).mutation(api.features.database.mutations.unlinkDocFromRow, {
      rowId,
      docId,
    })

    const afterUnlink = await t.withIdentity(identity).query(api.features.database.queries.getRowsLinkedToDoc, {
      docId,
    })

    expect(afterUnlink).toHaveLength(0)
  })
})
