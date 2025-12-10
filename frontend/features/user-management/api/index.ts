/**
 * User Management API Hooks
 * 
 * Composes hooks from existing features + new user-management queries/mutations
 */

import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";

// ============================================================================
// Re-export existing feature hooks for composition
// ============================================================================

// Members API
export {
  useMembers,
  useRoles,
  useAddMember,
  useRemoveMember,
  useUpdateMemberRole,
  useHasPermission,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
} from "@/frontend/features/members/api";

import {
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
} from "@/frontend/features/members/api";

// Contacts API
export {
  useContacts,
  usePendingContactRequests,
  useSentContactRequests,
  useSendContactRequest,
  useAcceptContactRequest,
  useDeclineContactRequest,
  useRemoveContact,
} from "@/frontend/features/contact/api";

// Invitations API
export {
  useReceivedInvitations,
  useSentInvitations,
  useSendInvitation,
  useAcceptInvitation,
  useDeclineInvitation,
  useCancelInvitation,
  useSendBulkInvitations,
  useWorkspaceInvitations,
  useInvitationStats,
} from "@/frontend/features/invitations/api";

// ============================================================================
// New User Management Queries
// ============================================================================

/**
 * Get user→workspace access matrix for a workspace hierarchy
 */
export const useUserWorkspaceMatrix = (
  workspaceId: Id<"workspaces"> | undefined,
  maxDepth?: number
) => {
  return useQuery(
    (api as any)["features/userManagement/api/queries"].getUserWorkspaceMatrix,
    workspaceId ? { workspaceId, maxDepth } : "skip"
  );
};

/**
 * Get hierarchy member overview for a workspace
 */
export const useHierarchyMemberOverview = (
  workspaceId: Id<"workspaces"> | undefined
) => {
  return useQuery(
    (api as any)["features/userManagement/api/queries"].getHierarchyMemberOverview,
    workspaceId ? { workspaceId } : "skip"
  );
};

/**
 * Get Contacts available for quick invite to workspace
 */
export const useContactsForQuickInvite = (
  workspaceId: Id<"workspaces"> | undefined
) => {
  return useQuery(
    (api as any)["features/userManagement/api/queries"].getContactsForQuickInvite,
    workspaceId ? { workspaceId } : "skip"
  );
};

/**
 * Get teams for a workspace
 */
export const useWorkspaceTeams = (
  workspaceId: Id<"workspaces"> | undefined
) => {
  return useQuery(
    (api as any)["features/userManagement/api/queries"].getWorkspaceTeams,
    workspaceId ? { workspaceId } : "skip"
  );
};

/**
 * Get team members
 */
export const useTeamMembers = (
  teamId: Id<"userTeams"> | undefined
) => {
  return useQuery(
    (api as any)["features/userManagement/api/queries"].getTeamMembers,
    teamId ? { teamId } : "skip"
  );
};

/**
 * Get role hierarchy for ReactFlow canvas
 */
export const useRoleHierarchy = (
  workspaceId: Id<"workspaces"> | undefined
) => {
  return useQuery(
    (api as any)["features/userManagement/api/queries"].getRoleHierarchy,
    workspaceId ? { workspaceId } : "skip"
  );
};

// ============================================================================
// New User Management Mutations
// ============================================================================

/**
 * Invite user to workspace hierarchy
 */
export const useInviteToHierarchy = () => {
  return useMutation(
    (api as any)["features/userManagement/api/mutations"].inviteToHierarchy
  );
};

/**
 * Bulk invite Contacts to workspace
 */
export const useBulkInviteContacts = () => {
  return useMutation(
    (api as any)["features/userManagement/api/mutations"].bulkInviteContacts
  );
};

/**
 * Create a user team
 */
export const useCreateTeam = () => {
  return useMutation(
    (api as any)["features/userManagement/api/mutations"].createTeam
  );
};

/**
 * Add member to team
 */
export const useAddTeamMember = () => {
  return useMutation(
    (api as any)["features/userManagement/api/mutations"].addTeamMember
  );
};

/**
 * Remove member from team
 */
export const useRemoveTeamMember = () => {
  return useMutation(
    (api as any)["features/userManagement/api/mutations"].removeTeamMember
  );
};

/**
 * Invite entire team to workspace(s)
 */
export const useInviteTeamToWorkspaces = () => {
  return useMutation(
    (api as any)["features/userManagement/api/mutations"].inviteTeamToWorkspaces
  );
};

/**
 * Create role hierarchy link
 */
export const useCreateRoleHierarchyLink = () => {
  return useMutation(
    (api as any)["features/userManagement/api/mutations"].createRoleHierarchyLink
  );
};

/**
 * Delete role hierarchy link
 */
export const useDeleteRoleHierarchyLink = () => {
  return useMutation(
    (api as any)["features/userManagement/api/mutations"].deleteRoleHierarchyLink
  );
};

// ============================================================================
// Composite Hook - Full User Management API
// ============================================================================

/**
 * Unified hook for all user management operations
 */
export const useUserManagementApi = (workspaceId: Id<"workspaces"> | undefined) => {
  // Queries
  const matrix = useUserWorkspaceMatrix(workspaceId);
  const overview = useHierarchyMemberOverview(workspaceId);
  const ContactsForInvite = useContactsForQuickInvite(workspaceId);
  const teams = useWorkspaceTeams(workspaceId);
  const roleHierarchy = useRoleHierarchy(workspaceId);

  // Mutations
  const inviteToHierarchy = useInviteToHierarchy();
  const bulkInviteContacts = useBulkInviteContacts();
  const createTeam = useCreateTeam();
  const addTeamMember = useAddTeamMember();
  const removeTeamMember = useRemoveTeamMember();
  const inviteTeamToWorkspaces = useInviteTeamToWorkspaces();
  const createRoleHierarchyLink = useCreateRoleHierarchyLink();
  const deleteRoleHierarchyLink = useDeleteRoleHierarchyLink();
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  const deleteRole = useDeleteRole();

  return {
    // Data
    matrix,
    overview,
    ContactsForInvite,
    teams,
    roleHierarchy,

    // Actions
    inviteToHierarchy,
    bulkInviteContacts,
    createTeam,
    addTeamMember,
    removeTeamMember,
    inviteTeamToWorkspaces,
    createRoleHierarchyLink,
    deleteRoleHierarchyLink,
    createRole,
    updateRole,
    deleteRole,
  };
};
