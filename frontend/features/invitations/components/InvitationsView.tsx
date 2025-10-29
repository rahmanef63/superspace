"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { ViewSwitcher, type ViewConfig } from "@/frontend/shared/ui/layout/view";
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

  const config: ViewConfig<InvitationRow> = useMemo(() => ({
    getId: (r) => String(r._id),
    columns: [
      {
        id: "what",
        header: "Item",
        cell: (r) => (
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
      { id: "direction", header: "Direction", accessor: (r) => r.direction },
      {
        id: "who",
        header: "Party",
        accessor: (r) => (r.direction === "sent" ? r.inviteeEmail : r.inviter?.name || "Unknown"),
      },
      {
        id: "status",
        header: "Status",
        accessor: (r) => r.status,
      },
    ],
    actions: [
      {
        id: "accept",
        label: "Accept",
        icon: <Check className="w-4 h-4" />,
        visible: (r) => r.direction === "received" && r.status === "pending",
        onClick: async (r) => {
          await acceptInvitation({ invitationId: r._id });
        },
      },
      {
        id: "decline",
        label: "Decline",
        icon: <X className="w-4 h-4" />,
        visible: (r) => r.direction === "received" && r.status === "pending",
        onClick: async (r) => {
          await declineInvitation({ invitationId: r._id });
        },
      },
      {
        id: "cancel",
        label: "Cancel",
        icon: <X className="w-4 h-4" />,
        visible: (r) => r.direction === "sent" && r.status === "pending",
        onClick: async (r) => {
          await cancelInvitation({ invitationId: r._id });
        },
      },
    ],
    card: {
      title: (r) => (r.type === "workspace" ? r.workspace?.name || "Workspace" : "Friend Request"),
      subtitle: (r) => (r.direction === "sent" ? `To: ${r.inviteeEmail}` : `From: ${r.inviter?.name || "Unknown"}`),
      avatar: () => (
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <Mail className="w-4 h-4 text-blue-600" />
        </div>
      ),
      extra: (r) => <span className="text-xs text-gray-500 capitalize">{r.status}</span>,
    },
    details: {
      fields: [
        { label: "Type", value: (r) => r.type },
        { label: "Direction", value: (r) => r.direction },
        { label: "Party", value: (r) => (r.direction === "sent" ? r.inviteeEmail : r.inviter?.name || "Unknown") },
        { label: "Status", value: (r) => r.status },
        { label: "Workspace", value: (r) => r.workspace?.name },
        { label: "Role", value: (r) => r.role?.name },
      ],
    },
    searchFn: (r, q) =>
      (r.workspace?.name || "").toLowerCase().includes(q) ||
      r.inviteeEmail.toLowerCase().includes(q) ||
      (r.inviter?.name || "").toLowerCase().includes(q),
  }), [acceptInvitation, declineInvitation, cancelInvitation]);

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
      <ViewSwitcher
        storageKey={`invitations.view`}
        initialMode="card"
        data={invitations}
        config={config}
        searchable
        emptyState="No invitations found"
      />
    </div>
  );
}
