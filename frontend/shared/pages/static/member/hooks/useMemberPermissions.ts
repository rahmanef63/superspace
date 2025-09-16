import type { Id } from "@convex/_generated/dataModel";
import { useHasPermission } from "../api";

export function useCanManageMembers(workspaceId: Id<"workspaces">) {
  const can = useHasPermission(workspaceId, "manage_members");
  return Boolean(can);
}

export function useCanInviteMembers(workspaceId: Id<"workspaces">) {
  const can = useHasPermission(workspaceId, "invite_members");
  return Boolean(can);
}

export function useCanManageRoles(workspaceId: Id<"workspaces">) {
  const can = useHasPermission(workspaceId, "manage_roles");
  return Boolean(can);
}
