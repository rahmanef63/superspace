"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { ViewProvider, ViewRenderer, ViewType, type ViewConfig, type ViewColumn, type ViewAction } from "@/frontend/shared/ui/layout/view-system";
import { Button } from "@/components/ui/button";
import { Mail, Check, X, Users, UserPlus } from "lucide-react";

type InvitationRow = {
  _id: Id<"invitations">;
  type: "workspace" | "personal";
  status: "pending" | "accepted" | "declined" | "expired";
  direction: "sent" | "received";
  inviteeEmail: string;
  inviter?: { name?: string | null } | null;
  workspace?: { name?: string | null } | null;
  role?: { name?: string | null } | null;
  _creationTime: number;
};

export function InvitationsView({ onInvite }: { onInvite?: () => void }) {
  const [filter, setFilter] = useState<"all" | "sent" | "received">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "accepted" | "declined" | "expired">("all");
  const [kindFilter, setKindFilter] = useState<"all" | "workspace" | "personal">("all");

  const invitations = (useQuery(api.workspace.invitations.getUserInvitations, {
    type: filter === "all" ? undefined : (filter as any),
    status: statusFilter === "all" ? undefined : (statusFilter as any),
    kind: kindFilter === "all" ? undefined : (kindFilter as any),
  }) || []) as InvitationRow[];

  const acceptInvitation = useMutation(api.workspace.invitations.acceptInvitation);
  const declineInvitation = useMutation(api.workspace.invitations.declineInvitation);
  const cancelInvitation = useMutation(api.workspace.invitations.cancelInvitation);

  const columns: ViewColumn<InvitationRow>[] = useMemo(() => [
    {
      id: "what",
      key: "what",
      label: "Item",
      render: (r: InvitationRow) => (
        <div className="flex items-center gap-2">
          {r.type === "workspace" ? (
            <Users className="w-4 h-4 text-blue-600" />
          ) : (
            <UserPlus className="w-4 h-4 text-green-600" />
          )}
          <span className="font-medium">
            {r.type === "workspace" ? `Workspace: ${r.workspace?.name || "Unknown"}` : "Friend Request"}
          </span>
        </div>
      ),
    },
    { id: "direction", key: "direction", label: "Direction", accessor: (r: InvitationRow) => r.direction },
    {
      id: "who",
      key: "who",
      label: "Party",
      accessor: (r: InvitationRow) => (r.direction === "sent" ? r.inviteeEmail : r.inviter?.name || "Unknown"),
    },
    {
      id: "status",
      key: "status",
      label: "Status",
      accessor: (r: InvitationRow) => r.status,
    },
  ], []);

  const actions: ViewAction<InvitationRow>[] = useMemo(() => [
    {
      id: "accept",
      label: "Accept",
      icon: Check,
      hidden: (r: InvitationRow) => r.direction !== "received" || r.status !== "pending",
      onClick: async (r: InvitationRow) => {
        await acceptInvitation({ invitationId: r._id });
      },
    },
    {
      id: "decline",
      label: "Decline",
      icon: X,
      hidden: (r: InvitationRow) => r.direction !== "received" || r.status !== "pending",
      onClick: async (r: InvitationRow) => {
        await declineInvitation({ invitationId: r._id });
      },
    },
    {
      id: "cancel",
      label: "Cancel",
      icon: X,
      hidden: (r: InvitationRow) => r.direction !== "sent" || r.status !== "pending",
      onClick: async (r: InvitationRow) => {
        await cancelInvitation({ invitationId: r._id });
      },
    },
  ], [acceptInvitation, declineInvitation, cancelInvitation]);

  const config: ViewConfig<InvitationRow> = useMemo(() => ({
    id: "invitations-view",
    type: ViewType.TABLE,
    label: "Invitations",
    columns,
    rowActions: actions,
    settings: {
      showSearch: true,
      showFilters: true,
      selectable: false,
    },
    renderCard: (r: InvitationRow) => (
      <div className="p-4 border rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <Mail className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="font-medium">{r.type === "workspace" ? r.workspace?.name || "Workspace" : "Friend Request"}</div>
            <div className="text-sm text-muted-foreground">
              {r.direction === "sent" ? `To: ${r.inviteeEmail}` : `From: ${r.inviter?.name || "Unknown"}`}
            </div>
          </div>
          <span className="text-xs text-gray-500 capitalize">{r.status}</span>
        </div>
      </div>
    ),
    onSearch: (query: string) => {
      // Search handled by local filter below
    },
  }), [columns, actions]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
        <div className="flex gap-2">
          {[
            { key: "all", label: "All" },
            { key: "sent", label: "Sent" },
            { key: "received", label: "Received" },
          ].map(({ key, label }) => (
            <Button
              key={key}
              size="sm"
              variant={filter === (key as any) ? "secondary" : "ghost"}
              onClick={() => setFilter(key as any)}
            >
              {label}
            </Button>
          ))}
        </div>
        <div className="flex gap-2">
          {[
            { key: "all", label: "All Status" },
            { key: "pending", label: "Pending" },
            { key: "accepted", label: "Accepted" },
            { key: "declined", label: "Declined" },
            { key: "expired", label: "Expired" },
          ].map(({ key, label }) => (
            <Button
              key={key}
              size="sm"
              variant={statusFilter === (key as any) ? "secondary" : "ghost"}
              onClick={() => setStatusFilter(key as any)}
            >
              {label}
            </Button>
          ))}
        </div>
        <div className="flex gap-2">
          {[
            { key: "all", label: "All Types" },
            { key: "workspace", label: "Workspace" },
            { key: "personal", label: "Friends" },
          ].map(({ key, label }) => (
            <Button
              key={key}
              size="sm"
              variant={kindFilter === (key as any) ? "secondary" : "ghost"}
              onClick={() => setKindFilter(key as any)}
            >
              {label}
            </Button>
          ))}
        </div>
        <div className="ml-auto">
          {onInvite && (
            <Button onClick={onInvite} className="bg-blue-600 hover:bg-blue-700">Send Invitation</Button>
          )}
        </div>
      </div>
      <ViewProvider
        config={config}
        data={invitations}
      >
        <ViewRenderer />
      </ViewProvider>
    </div>
  );
}
