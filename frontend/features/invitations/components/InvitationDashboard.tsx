"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { 
  Mail, 
  Users, 
  UserPlus, 
  Send,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Calendar
} from "lucide-react";
import { InvitationModal } from "./InvitationModal";
import { formatDistanceToNow } from "date-fns";
import type { InvitationManagementProps as InvitationDashboardProps } from "../types";

export function InvitationDashboard({ workspaceId }: InvitationDashboardProps) {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteType, setInviteType] = useState<"workspace" | "personal">("workspace");

  const invitations = useQuery(api.workspace.invitations.getUserInvitations, {});
  const workspace = useQuery(
    api.workspace.workspaces.getWorkspace,
    workspaceId ? { workspaceId } : undefined
  );

  const canInviteMembers = workspace?.role?.permissions.includes("invite_members");

  // Calculate comprehensive stats
  const sentInvitations = invitations?.filter((inv: any) => inv.direction === "sent") || [];
  const receivedInvitations = invitations?.filter((inv: any) => inv.direction === "received") || [];
  const pendingReceived = receivedInvitations.filter((inv: any) => inv.status === "pending");
  const acceptedInvitations = invitations?.filter((inv: any) => inv.status === "accepted") || [];
  const recentInvitations = invitations?.slice(0, 5) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <Mail className="w-7 h-7 text-blue-600" />
            Invitation Dashboard
          </h2>
          <p className="text-gray-600">
            Manage workspace invites and friend requests
          </p>
          <div className="mt-2 text-xs text-gray-500 space-y-1">
            <p><span className="font-medium text-gray-700">Workspace members:</span> scoped access to a specific workspace (roles, projects, etc).</p>
            <p><span className="font-medium text-gray-700">Friends:</span> chat + can invite each other into workspaces.</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          {workspaceId && canInviteMembers && (
            <Button
              onClick={() => {
                setInviteType("workspace");
                setShowInviteModal(true);
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Users className="w-4 h-4 mr-2" />
              Invite to Workspace
            </Button>
          )}
          <Button
            onClick={() => {
              setInviteType("personal");
              setShowInviteModal(true);
            }}
            variant="outline"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Send Friend Request
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-background p-6 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Sent</p>
              <p className="text-2xl font-bold text-foreground">{sentInvitations.length}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Send className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-background p-6 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Received</p>
              <p className="text-2xl font-bold text-foreground">{receivedInvitations.length}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Mail className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-background p-6 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-foreground">{pendingReceived.length}</p>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-background p-6 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Accepted</p>
              <p className="text-2xl font-bold text-foreground">{acceptedInvitations.length}</p>
            </div>
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Pending Actions Alert */}
      {pendingReceived.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-yellow-800">
                Action Required
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                You have {pendingReceived.length} pending invitation{pendingReceived.length > 1 ? 's' : ''} waiting for your response.
              </p>
              <div className="mt-3 flex gap-2">
                <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700 text-primary">
                  Review Invitations
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-background rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Recent Activity
          </h3>
        </div>
        
        <div className="p-6">
          {recentInvitations.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No recent activity</h4>
              <p className="text-gray-500 mb-4">
                Start by sending your first invitation
              </p>
              <Button
                onClick={() => {
                  setInviteType("personal");
                  setShowInviteModal(true);
                }}
                variant="outline"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Send Invitation
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentInvitations.map((invitation: any) => (
                <div key={invitation._id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    {invitation.type === "workspace" ? (
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-blue-600" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <UserPlus className="w-4 h-4 text-green-600" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {invitation.direction === "sent" 
                        ? `Invited ${invitation.inviteeEmail}`
                        : `Invitation from ${invitation.inviter?.name || "Unknown"}`
                      }
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDistanceToNow(new Date(invitation._creationTime), { addSuffix: true })}
                    </p>
                  </div>
                  
                  <div className="flex-shrink-0">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      invitation.status === "pending" 
                        ? "bg-yellow-100 text-yellow-800"
                        : invitation.status === "accepted"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-destructive-800"
                    }`}>
                      {invitation.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <InvitationModal
          workspaceId={inviteType === "workspace" ? workspaceId : undefined}
          type={inviteType}
          onClose={() => setShowInviteModal(false)}
        />
      )}
    </div>
  );
}
