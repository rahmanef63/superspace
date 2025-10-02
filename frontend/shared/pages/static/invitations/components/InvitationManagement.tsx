"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Mail, 
  Users, 
  UserPlus, 
  Send,
  Plus,
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";
import { InvitationModal } from "./InvitationModal";
import { InvitationsList } from "./InvitationsList";
import { InvitationsView } from "./InvitationsView";
import type { Invitation, InvitationManagementProps } from "../types";

export function InvitationManagement({ workspaceId, onBack }: InvitationManagementProps) {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteType, setInviteType] = useState<"workspace" | "personal">("workspace");

  const workspace = useQuery(
    api.workspace.workspaces.getWorkspace,
    workspaceId ? { workspaceId } : "skip"
  );

  const invitations = useQuery(api.workspace.invitations.getUserInvitations, {});
  const currentUser = useQuery(api.auth.auth.loggedInUser);
  const canInviteMembers = workspace?.role?.permissions.includes("invite_members");

  // Calculate stats
  const sentInvitations = invitations?.filter((inv: Invitation) => inv.direction === "sent") || [];
  const receivedInvitations = invitations?.filter((inv: Invitation) => inv.direction === "received") || [];
  const pendingReceived = receivedInvitations.filter((inv: Invitation) => inv.status === "pending");

  return (
    <div className="container flex-col mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            {onBack && (
              <Button variant="outline" size="sm" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-3">
                <Mail className="w-7 h-7 text-primary" />
                Invitation Management
              </h1>
              <p className="text-muted-foreground">
                {workspaceId 
                  ? `Manage invitations for ${workspace?.name || "workspace"}`
                  : "Manage all your invitations"
                }
              </p>
            </div>
          </div>
          
          <div className="flex gap-2 sm:gap-3">
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
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sent Invitations</p>
                <p className="text-2xl font-bold">{sentInvitations.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-950/40 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Received Invitations</p>
                <p className="text-2xl font-bold">{receivedInvitations.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-950/40 text-yellow-600 dark:text-yellow-400 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Actions</p>
                <p className="text-2xl font-bold">{pendingReceived.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions for Pending Invitations */}
      {pendingReceived.length > 0 && (
        <Alert className="mb-6">
          <Clock className="h-4 w-4" />
          <AlertTitle>
            You have {pendingReceived.length} pending invitation{pendingReceived.length > 1 ? "s" : ""}
          </AlertTitle>
          <AlertDescription className="flex items-center justify-between gap-3">
            <span>Review and respond to your pending invitations below</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const firstPending = document.querySelector('[data-status="pending"]');
                firstPending?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Review Now
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Invitations List */}
      <Card>
        <CardContent className="p-6">
        <InvitationsView
          onInvite={() => {
            setInviteType(workspaceId ? "workspace" : "personal");
            setShowInviteModal(true);
          }}
        />
        </CardContent>
      </Card>

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
