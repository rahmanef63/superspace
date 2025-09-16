import type { Id } from "@convex/_generated/dataModel";

export type InvitationDirection = "sent" | "received";
export type InvitationStatus = "pending" | "accepted" | "declined" | "expired";
export type InvitationKind = "workspace" | "personal";

export interface Invitation {
  _id: Id<"invitations">;
  type: InvitationKind;
  status: InvitationStatus;
  inviterId: Id<"users">;
  inviteeEmail: string;
  inviteeId?: Id<"users"> | null;
  roleId?: Id<"roles"> | null;
  workspaceId?: Id<"workspaces"> | null;
  message?: string | null;
  expiresAt?: number | null;
  acceptedAt?: number | null;
  token?: string | null;
  direction: InvitationDirection;
  inviter?: { name?: string | null; image?: string | null } | null;
  workspace?: { name?: string | null } | null;
  role?: { name?: string | null; description?: string | null } | null;
  _creationTime: number;
}

export interface InvitationCardProps {
  invitation: Invitation;
}

export interface InvitationsListProps {
  onInvite?: () => void;
}

export interface InvitationManagementProps {
  workspaceId?: Id<"workspaces">;
  onBack?: () => void;
}

export interface InvitationModalProps {
  workspaceId?: Id<"workspaces">;
  type: InvitationKind;
  onClose: () => void;
}

export interface NotificationToastProps {
  message: string;
  type: "success" | "error" | "warning" | "info";
  onClose: () => void;
  duration?: number;
}
