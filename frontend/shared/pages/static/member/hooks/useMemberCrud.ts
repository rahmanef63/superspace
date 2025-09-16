import type { Id } from "@convex/_generated/dataModel";
import { useAddMember, useRemoveMember, useUpdateMemberRole, useCreateRole } from "../api";

export function useMemberCrud(workspaceId: Id<"workspaces">) {
  const addMember = useAddMember();
  const removeMember = useRemoveMember();
  const updateMemberRole = useUpdateMemberRole();
  const createRole = useCreateRole();

  return {
    add: (userId: Id<"users">, roleId?: Id<"roles">) =>
      addMember({ workspaceId, userId, roleId }),
    remove: (userId: Id<"users">) => removeMember({ workspaceId, userId }),
    updateRole: (userId: Id<"users">, roleId: Id<"roles">) =>
      updateMemberRole({ workspaceId, userId, roleId }),
    createRole: (name: string, level: number) => createRole({ workspaceId, name, level }),
  };
}
