import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";

// Invitations API hooks
export const useInvitationsApi = () => {
  // Queries
  const receivedInvitations = useQuery(api.workspace.invitations.getUserInvitations, { type: "received" });
  const sentInvitations = useQuery(api.workspace.invitations.getUserInvitations, { type: "sent" });
  
  // Mutations
  const sendInvitation = useMutation(api.workspace.invitations.sendWorkspaceInvitation);
  const acceptInvitation = useMutation(api.workspace.invitations.acceptInvitation);
  const declineInvitation = useMutation(api.workspace.invitations.declineInvitation);
  const cancelInvitation = useMutation(api.workspace.invitations.cancelInvitation);
  const resendInvitation = useMutation(api.workspace.invitations.resendInvitation);
  const sendBulkInvitations = useMutation(api.workspace.invitations.sendBulkInvitations);
  const cleanupExpiredInvitations = useMutation(api.workspace.invitations.cleanupExpiredInvitations);

  return {
    // Data
    receivedInvitations,
    sentInvitations,
    
    // Actions
    sendInvitation,
    acceptInvitation,
    declineInvitation,
    cancelInvitation,
    resendInvitation,
    sendBulkInvitations,
    cleanupExpiredInvitations,
  };
};

// Individual hooks
export const useReceivedInvitations = () => useQuery(api.workspace.invitations.getUserInvitations, { type: "received" });
export const useSentInvitations = () => useQuery(api.workspace.invitations.getUserInvitations, { type: "sent" });

export const useSendInvitation = () => useMutation(api.workspace.invitations.sendWorkspaceInvitation);
export const useAcceptInvitation = () => useMutation(api.workspace.invitations.acceptInvitation);
export const useDeclineInvitation = () => useMutation(api.workspace.invitations.declineInvitation);
export const useCancelInvitation = () => useMutation(api.workspace.invitations.cancelInvitation);
export const useResendInvitation = () => useMutation(api.workspace.invitations.resendInvitation);
export const useSendBulkInvitations = () => useMutation(api.workspace.invitations.sendBulkInvitations);
export const useCleanupExpiredInvitations = () => useMutation(api.workspace.invitations.cleanupExpiredInvitations);

// Workspace-specific invitation hooks
export const useWorkspaceInvitations = (
  workspaceId: Id<"workspaces">,
  status?: "pending" | "accepted" | "declined" | "expired"
) => useQuery(api.workspace.invitations.getWorkspaceInvitations, { workspaceId, status });

export const useInvitationStats = (workspaceId: Id<"workspaces">) =>
  useQuery(api.workspace.invitations.getInvitationStats, { workspaceId });

export const useSearchInvitations = (
  workspaceId: Id<"workspaces">,
  query: string,
  status?: "pending" | "accepted" | "declined" | "expired",
  limit?: number
) => useQuery(api.workspace.invitations.searchInvitations, { workspaceId, query, status, limit });
