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
  User
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNotification } from "./NotificationToast";
import type { InvitationCardProps } from "../types";

export function InvitationCard({ invitation }: InvitationCardProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { showNotification } = useNotification();

  const acceptInvitation = useMutation(api.workspace.invitations.acceptInvitation);
  const declineInvitation = useMutation(api.workspace.invitations.declineInvitation);
  const cancelInvitation = useMutation(api.workspace.invitations.cancelInvitation);

  const handleAccept = async () => {
    setIsProcessing(true);
    try {
      await acceptInvitation({ invitationId: invitation._id });
      showNotification("Invitation accepted successfully!", "success");
    } catch (error) {
      console.error("Failed to accept invitation:", error);
      showNotification(error instanceof Error ? error.message : "Failed to accept invitation", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecline = async () => {
    setIsProcessing(true);
    try {
      await declineInvitation({ invitationId: invitation._id });
      showNotification("Invitation declined", "warning");
    } catch (error) {
      console.error("Failed to decline invitation:", error);
      showNotification(error instanceof Error ? error.message : "Failed to decline invitation", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (confirm("Are you sure you want to cancel this invitation?")) {
      setIsProcessing(true);
      try {
        await cancelInvitation({ invitationId: invitation._id });
        showNotification("Invitation cancelled", "info");
      } catch (error) {
        console.error("Failed to cancel invitation:", error);
        showNotification(error instanceof Error ? error.message : "Failed to cancel invitation", "error");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case "accepted":
        return <Check className="w-4 h-4 text-green-600" />;
      case "declined":
        return <X className="w-4 h-4 text-destructive-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "accepted":
        return "bg-green-100 text-green-800 border-green-200";
      case "declined":
        return "bg-red-100 text-destructive-800 border-red-200";
      case "expired":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div 
      className="bg-background border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-200"
      data-status={invitation.status}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4 flex-1">
          {/* Icon */}
          <div className="flex-shrink-0 mt-1">
            {invitation.type === "workspace" ? (
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            ) : (
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-green-600" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-semibold text-gray-900 text-lg">
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

            <div className="space-y-2 text-sm text-gray-600">
              {invitation.direction === "sent" ? (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>Sent to: <span className="font-medium text-gray-900">{invitation.inviteeEmail}</span></span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>From: <span className="font-medium text-gray-900">{invitation.inviter?.name || "Unknown"}</span></span>
                </div>
              )}
              
              {invitation.role && (
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  <span>Role: <span className="font-medium text-gray-900">{invitation.role.name}</span></span>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDistanceToNow(new Date(invitation._creationTime), { addSuffix: true })}</span>
              </div>
            </div>

            {invitation.message && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-start gap-2">
                  <MessageSquare className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700 italic">"{invitation.message}"</p>
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
                className="bg-green-600 hover:bg-green-700 text-primary"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
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
                className="border-gray-300 hover:bg-gray-50"
              >
                <X className="w-4 h-4 mr-1" />
                Decline
              </Button>
            </div>
          )}

          {invitation.direction === "sent" && invitation.status === "pending" && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancel}
              disabled={isProcessing}
              className="border-gray-300 hover:bg-gray-50"
            >
              <X className="w-4 h-4 mr-1" />
              Cancel
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
