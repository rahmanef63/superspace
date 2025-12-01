import type { Id } from "@convex/_generated/dataModel";
import { useCanInviteMembers, useCanManageMembers, useCanManageRoles } from "../hooks/useMemberPermissions";

export function useMemberGuards(workspaceId: Id<"workspaces">) {
  const canInvite = useCanInviteMembers(workspaceId);
  const canManageMembers = useCanManageMembers(workspaceId);
  const canManageRoles = useCanManageRoles(workspaceId);
  return { canInvite, canManage: canManageMembers, canManageMembers, canManageRoles };
}
