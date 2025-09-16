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

  return {
    // Data
    receivedInvitations,
    sentInvitations,
    
    // Actions
    sendInvitation,
    acceptInvitation,
    declineInvitation,
    cancelInvitation,
  };
};

// Individual hooks
export const useReceivedInvitations = () => useQuery(api.workspace.invitations.getUserInvitations, { type: "received" });
export const useSentInvitations = () => useQuery(api.workspace.invitations.getUserInvitations, { type: "sent" });

export const useSendInvitation = () => useMutation(api.workspace.invitations.sendWorkspaceInvitation);
export const useAcceptInvitation = () => useMutation(api.workspace.invitations.acceptInvitation);
