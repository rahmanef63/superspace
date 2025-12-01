import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";

export const useMembers = (
  workspaceId: Id<"workspaces">,
  options?: { includeInactive?: boolean }
) => useQuery(api.workspace.workspaces.getWorkspaceMembers, { workspaceId, includeInactive: options?.includeInactive });

export const useSearchMembers = (
  workspaceId: Id<"workspaces">,
  query: string,
  options?: {
    status?: "active" | "inactive" | "pending";
    roleId?: Id<"roles">;
    limit?: number;
  }
) => useQuery(api.workspace.workspaces.searchWorkspaceMembers, {
  workspaceId,
  query,
  status: options?.status,
  roleId: options?.roleId,
  limit: options?.limit,
});

export const useMember = (
  workspaceId: Id<"workspaces">,
  userId: Id<"users">
) => useQuery(api.workspace.workspaces.getWorkspaceMember, { workspaceId, userId });

export const useRoles = (workspaceId: Id<"workspaces">) =>
  useQuery(api.workspace.roles.getAllRoles, { workspaceId });

export const useAddMember = () => useMutation(api.workspace.workspaces.addMember);
export const useRemoveMember = () => useMutation(api.workspace.workspaces.removeMember);
export const useUpdateMemberRole = () => useMutation(api.workspace.workspaces.updateMemberRole);
export const useCreateRole = () => useMutation(api.workspace.roles.createRole);

export const useHasPermission = (
  workspaceId: Id<"workspaces">,
  permission: string
) => useQuery(api.workspace.roles.hasPermission, { workspaceId, permission });

// Invitations management (workspace scope)
export const useWorkspaceInvitations = (
  workspaceId: Id<"workspaces">,
  status?: "pending" | "accepted" | "declined" | "expired"
) => useQuery(api.workspace.invitations.getWorkspaceInvitations, { workspaceId, status });

export const useCancelInvitation = () => useMutation(api.workspace.invitations.cancelInvitation);
export const useResendInvitation = () => useMutation(api.workspace.invitations.resendInvitation);
export const useSendBulkInvitations = () => useMutation(api.workspace.invitations.sendBulkInvitations);
export const useInvitationStats = (workspaceId: Id<"workspaces">) =>
  useQuery(api.workspace.invitations.getInvitationStats, { workspaceId });
export const useSearchInvitations = (
  workspaceId: Id<"workspaces">,
  query: string,
  status?: "pending" | "accepted" | "declined" | "expired"
) => useQuery(api.workspace.invitations.searchInvitations, { workspaceId, query, status });
export const useCleanupExpiredInvitations = () => useMutation(api.workspace.invitations.cleanupExpiredInvitations);
