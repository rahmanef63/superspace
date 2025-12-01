"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mail, Check, X, Users, UserPlus, Clock, Send, Inbox, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

type InvitationRow = {
  _id: Id<"invitations">;
  type: "workspace" | "personal";
  status: "pending" | "accepted" | "declined" | "expired";
  direction: "sent" | "received";
  inviteeEmail: string;
  inviter?: { name?: string | null; email?: string | null } | null;
  invitee?: { name?: string | null; email?: string | null } | null;
  workspace?: { name?: string | null } | null;
  role?: { name?: string | null } | null;
  _creationTime: number;
  expiresAt?: number;
};

export function InvitationsView({ onInvite }: { onInvite?: () => void }) {
  const [filter, setFilter] = useState<"all" | "sent" | "received">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "accepted" | "declined" | "expired">("all");
  const [kindFilter, setKindFilter] = useState<"all" | "workspace" | "personal">("all");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const invitations = (useQuery(api.workspace.invitations.getUserInvitations, {
    type: filter === "all" ? undefined : (filter as any),
    status: statusFilter === "all" ? undefined : (statusFilter as any),
    kind: kindFilter === "all" ? undefined : (kindFilter as any),
  }) || []) as InvitationRow[];

  const acceptInvitation = useMutation(api.workspace.invitations.acceptInvitation);
  const declineInvitation = useMutation(api.workspace.invitations.declineInvitation);
  const cancelInvitation = useMutation(api.workspace.invitations.cancelInvitation);
  const resendInvitation = useMutation(api.workspace.invitations.resendInvitation);

  // Pagination
  const totalPages = Math.ceil(invitations.length / rowsPerPage);
  const paginatedInvitations = invitations.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  // Helper to format time ago
  const formatTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days > 0) return `${days}d ago`;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours > 0) return `${hours}h ago`;
    const minutes = Math.floor(diff / (1000 * 60));
    return `${minutes}m ago`;
  };

  // Check if invitation is expiring soon (within 24h)
  const isExpiringSoon = (expiresAt?: number) => {
    if (!expiresAt) return false;
    return expiresAt - Date.now() < 24 * 60 * 60 * 1000 && expiresAt > Date.now();
  };

  const handleAccept = async (invitation: InvitationRow) => {
    try {
      await acceptInvitation({ invitationId: invitation._id });
      toast.success("Invitation accepted!");
    } catch (error) {
      toast.error("Failed to accept invitation");
    }
  };

  const handleDecline = async (invitation: InvitationRow) => {
    try {
      await declineInvitation({ invitationId: invitation._id });
      toast.success("Invitation declined");
    } catch (error) {
      toast.error("Failed to decline invitation");
    }
  };

  const handleCancel = async (invitation: InvitationRow) => {
    try {
      await cancelInvitation({ invitationId: invitation._id });
      toast.success("Invitation cancelled");
    } catch (error) {
      toast.error("Failed to cancel invitation");
    }
  };

  const handleResend = async (invitation: InvitationRow) => {
    try {
      await resendInvitation({ invitationId: invitation._id });
      toast.success("Invitation resent!");
    } catch (error) {
      toast.error("Failed to resend invitation");
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
      accepted: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      declined: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      expired: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[status] || ""}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
        <div className="flex gap-1.5">
          {[
            { key: "all", label: "All", icon: Mail },
            { key: "sent", label: "Sent", icon: Send },
            { key: "received", label: "Received", icon: Inbox },
          ].map(({ key, label, icon: Icon }) => (
            <Button
              key={key}
              size="sm"
              variant={filter === key ? "secondary" : "ghost"}
              onClick={() => { setFilter(key as any); setPage(1); }}
              className="gap-1.5"
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </Button>
          ))}
        </div>
        <div className="flex gap-1.5">
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
              variant={statusFilter === key ? "secondary" : "ghost"}
              onClick={() => { setStatusFilter(key as any); setPage(1); }}
            >
              {label}
            </Button>
          ))}
        </div>
        <div className="flex gap-1.5">
          {[
            { key: "all", label: "All Types" },
            { key: "workspace", label: "Workspace" },
            { key: "personal", label: "Friends" },
          ].map(({ key, label }) => (
            <Button
              key={key}
              size="sm"
              variant={kindFilter === key ? "secondary" : "ghost"}
              onClick={() => { setKindFilter(key as any); setPage(1); }}
            >
              {label}
            </Button>
          ))}
        </div>
        <div className="ml-auto">
          {onInvite && (
            <Button onClick={onInvite} className="bg-blue-600 hover:bg-blue-700">
              Send Invitation
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      {invitations.length === 0 ? (
        <div className="text-center py-12">
          <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No invitations found</h3>
          <p className="text-muted-foreground mb-4">
            {filter === "sent"
              ? "You haven't sent any invitations yet"
              : filter === "received"
              ? "You don't have any pending invitations"
              : "No invitations to display"}
          </p>
          {onInvite && (
            <Button onClick={onInvite} variant="outline">
              <Send className="w-4 h-4 mr-2" />
              Send Your First Invitation
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Direction</TableHead>
                  <TableHead>Party</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedInvitations.map((invitation) => (
                  <TableRow key={invitation._id}>
                    {/* Item */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {invitation.type === "workspace" ? (
                          <Users className="w-4 h-4 text-blue-600" />
                        ) : (
                          <UserPlus className="w-4 h-4 text-green-600" />
                        )}
                        <span className="font-medium">
                          {invitation.type === "workspace"
                            ? `Workspace: ${invitation.workspace?.name || "Unknown"}`
                            : "Friend Request"}
                        </span>
                        {isExpiringSoon(invitation.expiresAt) && invitation.status === "pending" && (
                          <span className="text-xs text-yellow-600 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Expiring soon
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Direction */}
                    <TableCell>
                      <span className="flex items-center gap-1.5">
                        {invitation.direction === "sent" ? (
                          <>
                            <Send className="w-3.5 h-3.5 text-blue-500" />
                            <span>Sent</span>
                          </>
                        ) : (
                          <>
                            <Inbox className="w-3.5 h-3.5 text-green-500" />
                            <span>Received</span>
                          </>
                        )}
                      </span>
                    </TableCell>

                    {/* Party */}
                    <TableCell>
                      {invitation.direction === "sent"
                        ? invitation.invitee?.name || invitation.invitee?.email || invitation.inviteeEmail
                        : invitation.inviter?.name || invitation.inviter?.email || "Unknown"}
                    </TableCell>

                    {/* Status */}
                    <TableCell>{getStatusBadge(invitation.status)}</TableCell>

                    {/* Time */}
                    <TableCell className="text-muted-foreground">
                      {formatTimeAgo(invitation._creationTime)}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {invitation.direction === "received" && invitation.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="default"
                              className="bg-green-600 hover:bg-green-700 h-7 px-2"
                              onClick={() => handleAccept(invitation)}
                            >
                              <Check className="w-3.5 h-3.5 mr-1" />
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2"
                              onClick={() => handleDecline(invitation)}
                            >
                              <X className="w-3.5 h-3.5 mr-1" />
                              Decline
                            </Button>
                          </>
                        )}
                        {invitation.direction === "sent" && invitation.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2"
                              onClick={() => handleResend(invitation)}
                            >
                              <RefreshCw className="w-3.5 h-3.5 mr-1" />
                              Resend
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-destructive hover:text-destructive"
                              onClick={() => handleCancel(invitation)}
                            >
                              <X className="w-3.5 h-3.5 mr-1" />
                              Cancel
                            </Button>
                          </>
                        )}
                        {invitation.direction === "sent" && invitation.status === "expired" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2"
                            onClick={() => handleResend(invitation)}
                          >
                            <RefreshCw className="w-3.5 h-3.5 mr-1" />
                            Resend
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-end gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Rows per page</span>
              <Select
                value={String(rowsPerPage)}
                onValueChange={(value) => {
                  setRowsPerPage(Number(value));
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground">
              Page <strong>{page}</strong> of <strong>{totalPages || 1}</strong>
            </div>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => setPage(1)}
                disabled={page === 1}
              >
                <span className="sr-only">First page</span>
                <ChevronLeft className="w-4 h-4" />
                <ChevronLeft className="w-4 h-4 -ml-2" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                <span className="sr-only">Previous page</span>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages}
              >
                <span className="sr-only">Next page</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => setPage(totalPages)}
                disabled={page >= totalPages}
              >
                <span className="sr-only">Last page</span>
                <ChevronRight className="w-4 h-4" />
                <ChevronRight className="w-4 h-4 -ml-2" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
