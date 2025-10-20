import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";


// Workspaces API hooks
export const useWorkspacesApi = () => {
  // Queries
  const userWorkspaces = useQuery(api.workspace.workspaces.getUserWorkspaces);
  
  // Mutations
  const createWorkspace = useMutation(api.workspace.workspaces.createWorkspace);
  // Note: updateWorkspace, deleteWorkspace, joinWorkspace, leaveWorkspace need to be implemented

  return {
    // Data
    userWorkspaces,
    
    // Actions
    createWorkspace,
  };
};

// Members API hooks - Note: These functions need to be implemented
export const useMembersApi = () => {
  const addMember = useMutation(api.workspace.workspaces.addMember);
  const removeMember = useMutation(api.workspace.workspaces.removeMember);
  const updateMemberRole = useMutation(api.workspace.workspaces.updateMemberRole);

  return {
    addMember,
    removeMember,
    updateMemberRole,
  };
};

// Individual hooks
export const useUserWorkspaces = () => useQuery(api.workspace.workspaces.getUserWorkspaces);
export const useWorkspace = (workspaceId: Id<"workspaces">) => 
  useQuery(api.workspace.workspaces.getWorkspace, { workspaceId });
export const useWorkspaceMembers = (workspaceId: Id<"workspaces">) => 
  useQuery(api.workspace.workspaces.getWorkspaceMembers, { workspaceId });
export const useWorkspaceRoles = (workspaceId: Id<"workspaces">) => 
  useQuery(api.workspace.roles.getAllRoles, { workspaceId });

export const useCreateWorkspace = () => useMutation(api.workspace.workspaces.createWorkspace);
// export const useJoinWorkspace = () => useMutation(api.workspaces.joinWorkspace);

// Convenience member mutation hooks
export const useAddMember = () => useMutation(api.workspace.workspaces.addMember);
export const useRemoveMember = () => useMutation(api.workspace.workspaces.removeMember);
export const useUpdateMemberRole = () => useMutation(api.workspace.workspaces.updateMemberRole);
