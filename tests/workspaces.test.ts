import { describe, test, expect, beforeEach } from "vitest";
import { convexTest } from "convex-test";
import { api } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";

/**
 * Integration tests for Workspace CRUD operations
 * Tests: createWorkspace, updateWorkspace, deleteWorkspace, getUserWorkspaces
 */

describe("Workspace CRUD", () => {
  let t: any;
  let userId: Id<"users">;

  beforeEach(async () => {
    t = convexTest();
    // Create a test user
    userId = await t.run(async (ctx: any) => {
      return await ctx.db.insert("users", {
        name: "Test User",
        email: "test@example.com",
        externalId: "test-external-id",
      });
    });

    // Mock auth
    t.auth = {
      getUserIdentity: async () => ({
        subject: String(userId),
        email: "test@example.com",
      }),
    };
  });

  test("createWorkspace creates default roles and membership", async () => {
    await t.run(async (ctx: any) => {
      const workspaceId = await t.mutation(api.workspace.workspaces.createWorkspace, {
        name: "Test Workspace",
        slug: "test-workspace",
        type: "personal",
        isPublic: false,
      });

      // Verify workspace created
      const workspace = await ctx.db.get(workspaceId);
      expect(workspace).toBeTruthy();
      expect(workspace.name).toBe("Test Workspace");
      expect(workspace.slug).toBe("test-workspace");

      // Verify default roles created (Owner, Admin, Manager, Staff, Client, Guest)
      const roles = await ctx.db
        .query("roles")
        .withIndex("by_workspace", (q: any) => q.eq("workspaceId", workspaceId))
        .collect();
      expect(roles).toHaveLength(6);

      const roleNames = roles.map((r: any) => r.name).sort();
      expect(roleNames).toEqual(["Admin", "Client", "Guest", "Manager", "Owner", "Staff"]);

      // Verify creator membership with Owner role
      const memberships = await ctx.db
        .query("workspaceMemberships")
        .withIndex("by_workspace", (q: any) => q.eq("workspaceId", workspaceId))
        .collect();
      expect(memberships).toHaveLength(1);
      expect(memberships[0].userId).toBe(userId);

      const ownerRole = roles.find((r: any) => r.slug === "owner");
      expect(memberships[0].roleId).toBe(ownerRole._id);
      expect(memberships[0].status).toBe("active");
    });
  });

  test("createWorkspace normalizes slug and prevents duplicates", async () => {
    await t.run(async () => {
      // Create first workspace
      const workspaceId1 = await t.mutation(api.workspace.workspaces.createWorkspace, {
        name: "Workspace 1",
        slug: "my-workspace",
        type: "personal",
        isPublic: false,
      });

      const workspace1 = await t.run(async (ctx: any) => ctx.db.get(workspaceId1));
      expect(workspace1.slug).toBe("my-workspace");

      // Create second workspace with same slug - should auto-increment
      const workspaceId2 = await t.mutation(api.workspace.workspaces.createWorkspace, {
        name: "Workspace 2",
        slug: "my-workspace",
        type: "personal",
        isPublic: false,
      });

      const workspace2 = await t.run(async (ctx: any) => ctx.db.get(workspaceId2));
      expect(workspace2.slug).toBe("my-workspace-2");
    });
  });

  test("updateWorkspace updates fields correctly", async () => {
    await t.run(async (ctx: any) => {
      const workspaceId = await t.mutation(api.workspace.workspaces.createWorkspace, {
        name: "Original Name",
        slug: "original-slug",
        type: "personal",
        isPublic: false,
      });

      // Update workspace
      await t.mutation(api.workspace.workspaces.updateWorkspace, {
        workspaceId,
        name: "Updated Name",
        description: "New description",
        isPublic: true,
      });

      const updated = await ctx.db.get(workspaceId);
      expect(updated.name).toBe("Updated Name");
      expect(updated.description).toBe("New description");
      expect(updated.isPublic).toBe(true);
      expect(updated.slug).toBe("original-slug"); // Slug should not change
    });
  });

  test("deleteWorkspace cascades to related entities", async () => {
    await t.run(async (ctx: any) => {
      const workspaceId = await t.mutation(api.workspace.workspaces.createWorkspace, {
        name: "To Delete",
        slug: "to-delete",
        type: "personal",
        isPublic: false,
      });

      // Create a document in workspace
      const documentId = await ctx.db.insert("documents", {
        title: "Test Doc",
        workspaceId,
        createdBy: userId,
        isPublic: false,
        lastModified: Date.now(),
      });

      // Delete workspace
      await t.mutation(api.workspace.workspaces.deleteWorkspace, {
        workspaceId,
      });

      // Verify workspace deleted
      const workspace = await ctx.db.get(workspaceId);
      expect(workspace).toBeNull();

      // Verify roles deleted
      const roles = await ctx.db
        .query("roles")
        .withIndex("by_workspace", (q: any) => q.eq("workspaceId", workspaceId))
        .collect();
      expect(roles).toHaveLength(0);

      // Verify memberships deleted
      const memberships = await ctx.db
        .query("workspaceMemberships")
        .withIndex("by_workspace", (q: any) => q.eq("workspaceId", workspaceId))
        .collect();
      expect(memberships).toHaveLength(0);

      // Verify documents deleted
      const document = await ctx.db.get(documentId);
      expect(document).toBeNull();
    });
  });

  test("getUserWorkspaces returns user's workspaces", async () => {
    await t.run(async (ctx: any) => {
      // Create multiple workspaces
      const workspace1Id = await t.mutation(api.workspace.workspaces.createWorkspace, {
        name: "Workspace 1",
        slug: "workspace-1",
        type: "personal",
        isPublic: false,
      });

      const workspace2Id = await t.mutation(api.workspace.workspaces.createWorkspace, {
        name: "Workspace 2",
        slug: "workspace-2",
        type: "group",
        isPublic: true,
      });

      // Get user's workspaces
      const workspaces = await t.query(api.workspace.workspaces.getUserWorkspaces);

      expect(workspaces).toHaveLength(2);
      const workspaceIds = workspaces.map((w: any) => w._id);
      expect(workspaceIds).toContain(workspace1Id);
      expect(workspaceIds).toContain(workspace2Id);

      // Each workspace should have membership and role data
      workspaces.forEach((ws: any) => {
        expect(ws.membership).toBeTruthy();
        expect(ws.role).toBeTruthy();
        expect(ws.role.name).toBe("Owner");
      });
    });
  });

  test("addMember adds user to workspace with specified role", async () => {
    await t.run(async (ctx: any) => {
      const workspaceId = await t.mutation(api.workspace.workspaces.createWorkspace, {
        name: "Team Workspace",
        slug: "team-workspace",
        type: "organization",
        isPublic: false,
      });

      // Create another user
      const user2Id = await ctx.db.insert("users", {
        name: "User 2",
        email: "user2@example.com",
        externalId: "user2-external-id",
      });

      // Get client role
      const clientRole = await ctx.db
        .query("roles")
        .withIndex("by_workspace", (q: any) => q.eq("workspaceId", workspaceId))
        .filter((q: any) => q.eq(q.field("slug"), "client"))
        .first();

      // Add member
      await t.mutation(api.workspace.workspaces.addMember, {
        workspaceId,
        userId: user2Id,
        roleId: clientRole._id,
      });

      // Verify membership created
      const membership = await ctx.db
        .query("workspaceMemberships")
        .withIndex("by_user_workspace", (q: any) =>
          q.eq("userId", user2Id).eq("workspaceId", workspaceId)
        )
        .unique();

      expect(membership).toBeTruthy();
      expect(membership.status).toBe("active");
      expect(membership.roleId).toBe(clientRole._id);
      expect(membership.invitedBy).toBe(userId);
    });
  });

  test("removeMember deactivates membership", async () => {
    await t.run(async (ctx: any) => {
      const workspaceId = await t.mutation(api.workspace.workspaces.createWorkspace, {
        name: "Team Workspace",
        slug: "team-workspace-2",
        type: "organization",
        isPublic: false,
      });

      // Create and add another user
      const user2Id = await ctx.db.insert("users", {
        name: "User 2",
        email: "user2@example.com",
      });

      const clientRole = await ctx.db
        .query("roles")
        .withIndex("by_workspace", (q: any) => q.eq("workspaceId", workspaceId))
        .filter((q: any) => q.eq(q.field("slug"), "client"))
        .first();

      await t.mutation(api.workspace.workspaces.addMember, {
        workspaceId,
        userId: user2Id,
        roleId: clientRole._id,
      });

      // Remove member
      await t.mutation(api.workspace.workspaces.removeMember, {
        workspaceId,
        userId: user2Id,
      });

      // Verify membership set to inactive
      const membership = await ctx.db
        .query("workspaceMemberships")
        .withIndex("by_user_workspace", (q: any) =>
          q.eq("userId", user2Id).eq("workspaceId", workspaceId)
        )
        .unique();

      expect(membership.status).toBe("inactive");
    });
  });
});
