/**
 * User Management Feature - Backend API
 * 
 * Unified user management that composes existing systems:
 * - Members (workspaceMemberships)
 * - Invitations (invitations)
 * - Friends (friendships)
 * - Teams (userTeams)
 * 
 * @module convex/features/userManagement
 */

// Schema exports
export { userManagementTables } from "./api/schema";

// Re-export queries and mutations for API access
export * from "./api/queries";
export * from "./api/mutations";
