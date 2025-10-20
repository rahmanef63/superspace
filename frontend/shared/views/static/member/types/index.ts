import type { Id } from "@convex/_generated/dataModel";

export type Member = {
  _id: Id<"workspaceMemberships">;
  workspaceId: Id<"workspaces">;
  userId: Id<"users">;
  roleId: Id<"roles">;
  status: "active" | "inactive" | "pending";
  joinedAt: number;
  invitedBy?: Id<"users">;
  user?: { name?: string | null; email?: string | null } | null;
  role?: { name?: string | null; level?: number | null } | null;
};

export type Role = {
  _id: Id<"roles">;
  workspaceId?: Id<"workspaces"> | null;
  name: string;
  slug?: string | null;
  level?: number | null;
  permissions: string[];
};
