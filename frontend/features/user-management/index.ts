/**
 * User Management Feature
 * 
 * Unified user management that composes existing systems:
 * - Members (workspaceMemberships)
 * - Invitations (invitations)
 * - Contacts (contacts)
 * - Teams (userTeams)
 * - Role Hierarchy (roleHierarchyLinks)
 * 
 * @module frontend/features/user-management
 */

// Components
export {
  UserManagementPanel,
  TeamListPanel,
  AccessMatrixView,
  QuickInvitePanel,
  RoleHierarchyCanvas,
} from "./components";

// API Hooks
export {
  // New user-management hooks
  useUserManagementApi,
  useUserWorkspaceMatrix,
  useHierarchyMemberOverview,
  useContactsForQuickInvite,
  useWorkspaceTeams,
  useTeamMembers,
  useRoleHierarchy,
  useInviteToHierarchy,
  useBulkInviteContacts,
  useCreateTeam,
  useAddTeamMember,
  useRemoveTeamMember,
  useInviteTeamToWorkspaces,
  useCreateRoleHierarchyLink,
  useDeleteRoleHierarchyLink,
  // Re-exported from existing features
  useMembers,
  useRoles,
  useContacts,
  useReceivedInvitations,
  useSentInvitations,
} from "./api";

// Types
export type {
  UserInfo,
  MemberWithRole,
  RoleInfo,
  RoleNode,
  RoleLink,
  RoleHierarchy,
  Team,
  TeamMember,
  HierarchyInvitation,
  PropagationStrategy,
  InviteToHierarchyParams,
  BulkInviteContactsParams,
  WorkspaceInfo,
  AccessMatrixEntry,
  AccessMatrix,
  RoleBreakdown,
  HierarchyMemberOverview,
  ContactForQuickInvite,
  UserManagementTab,
  UserManagementState,
  UserManagementFilters,
} from "./types";

// Config
export { default as userManagementConfig, USER_MANAGEMENT_UI_CONFIG } from "./config";
