"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { 
  Users, 
  UserPlus, 
  Check, 
  X, 
  Clock,
  Calendar,
  MessageSquare,
  Mail,
  Building,
  User,
  RefreshCw
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import type { InvitationCardProps } from "../types";

export function InvitationCard({ invitation }: InvitationCardProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const acceptInvitation = useMutation(api.workspace.invitations.acceptInvitation);
  const declineInvitation = useMutation(api.workspace.invitations.declineInvitation);
  const cancelInvitation = useMutation(api.workspace.invitations.cancelInvitation);
  const resendInvitation = useMutation(api.workspace.invitations.resendInvitation);

  const handleAccept = async () => {
    setIsProcessing(true);
    try {
      await acceptInvitation({ invitationId: invitation._id });
      toast.success("Invitation accepted successfully!");
    } catch (error) {
      console.error("Failed to accept invitation:", error);
      toast.error(error instanceof Error ? error.message : "Failed to accept invitation");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecline = async () => {
    setIsProcessing(true);
    try {
      await declineInvitation({ invitationId: invitation._id });
      toast.warning("Invitation declined");
    } catch (error) {
      console.error("Failed to decline invitation:", error);
      toast.error(error instanceof Error ? error.message : "Failed to decline invitation");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (confirm("Are you sure you want to cancel this invitation?")) {
      setIsProcessing(true);
      try {
        await cancelInvitation({ invitationId: invitation._id });
        toast.info("Invitation cancelled");
      } catch (error) {
        console.error("Failed to cancel invitation:", error);
        toast.error(error instanceof Error ? error.message : "Failed to cancel invitation");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleResend = async () => {
    setIsProcessing(true);
    try {
      await resendInvitation({ invitationId: invitation._id });
      toast.success("Invitation resent!");
    } catch (error) {
      console.error("Failed to resend invitation:", error);
      toast.error(error instanceof Error ? error.message : "Failed to resend invitation");
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-accent-foreground" />;
      case "accepted":
        return <Check className="w-4 h-4 text-accent-foreground" />;
      case "declined":
        return <X className="w-4 h-4 text-destructive" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-accent text-accent-foreground border-border";
      case "accepted":
        return "bg-accent text-accent-foreground border-border";
      case "declined":
        return "bg-destructive/10 text-destructive border-destructive/30";
      case "expired":
        return "bg-muted text-muted-foreground border-border";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div
      className="bg-background border border-border rounded-lg p-6 hover:shadow-md transition-all duration-200"
      data-status={invitation.status}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4 flex-1">
          {/* Icon */}
          <div className="flex-shrink-0 mt-1">
            {invitation.type === "workspace" ? (
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
            ) : (
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-accent-foreground" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-semibold text-foreground text-lg">
                {invitation.type === "workspace"
                  ? `Workspace: ${invitation.workspace?.name || "Unknown"}`
                  : "Friend Request"
                }
              </h3>
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(invitation.status)}`}>
                {getStatusIcon(invitation.status)}
                {invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1)}
              </span>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">
              {invitation.direction === "sent" ? (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>Sent to: <span className="font-medium text-foreground">{invitation.inviteeEmail}</span></span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>From: <span className="font-medium text-foreground">{invitation.inviter?.name || "Unknown"}</span></span>
                </div>
              )}

              {invitation.role && (
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  <span>Role: <span className="font-medium text-foreground">{invitation.role.name}</span></span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDistanceToNow(new Date(invitation._creationTime), { addSuffix: true })}</span>
              </div>
            </div>

            {invitation.message && (
              <div className="mt-3 p-3 bg-muted rounded-lg border border-border">
                <div className="flex items-start gap-2">
                  <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-foreground italic">"{invitation.message}"</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex-shrink-0 ml-6">
          {invitation.direction === "received" && invitation.status === "pending" && (
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleAccept}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                <span className="ml-1">Accept</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDecline}
                disabled={isProcessing}
                className="border-border hover:bg-muted"
              >
                <X className="w-4 h-4 mr-1" />
                Decline
              </Button>
            </div>
          )}

          {invitation.direction === "sent" && invitation.status === "pending" && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleResend}
                disabled={isProcessing}
                className="border-border hover:bg-muted"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Resend
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancel}
                disabled={isProcessing}
                className="border-border hover:bg-muted text-destructive hover:text-destructive"
              >
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
            </div>
          )}

          {invitation.direction === "sent" && invitation.status === "expired" && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleResend}
              disabled={isProcessing}
              className="border-border hover:bg-muted"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Resend
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
