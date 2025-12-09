"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Button } from "@/components/ui/button";
import { 
  Mail, 
  Send,
  Inbox,
  Users,
  UserPlus
} from "lucide-react";
import { InvitationCard } from "./InvitationCard";
import type { InvitationsListProps } from "../types";

export function InvitationsList({ onInvite }: InvitationsListProps) {
  const [filter, setFilter] = useState<"all" | "sent" | "received">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "accepted" | "declined" | "expired">("all");
  const [kindFilter, setKindFilter] = useState<"all" | "workspace" | "personal">("all");

  const invitations = useQuery(api.workspace.invitations.getUserInvitations, {
    type: filter === "all" ? undefined : filter,
    status: statusFilter === "all" ? undefined : statusFilter,
    kind: kindFilter === "all" ? undefined : kindFilter,
  });

  if (!invitations) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Mail className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold">Invitations</h2>
        </div>
        {onInvite && (
          <Button onClick={onInvite} className="bg-blue-600 hover:bg-blue-700">
            <Send className="w-4 h-4 mr-2" />
            Send Invitation
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex gap-1">
          {[
            { key: "all", label: "All", icon: Mail },
            { key: "sent", label: "Sent", icon: Send },
            { key: "received", label: "Received", icon: Inbox },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setFilter(key as any)}
              className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                filter === key
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <Icon className="w-3 h-3" />
              {label}
            </button>
          ))}
        </div>

        <div className="flex gap-1">
          {[
            { key: "all", label: "All Status" },
            { key: "pending", label: "Pending" },
            { key: "accepted", label: "Accepted" },
            { key: "declined", label: "Declined" },
            { key: "expired", label: "Expired" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setStatusFilter(key as any)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                statusFilter === key
                  ? "bg-gray-100 text-gray-700"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex gap-1">
          {[
            { key: "all", label: "All Types", icon: Mail },
            { key: "workspace", label: "Workspace", icon: Users },
            { key: "personal", label: "Contacts", icon: UserPlus },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setKindFilter(key as any)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                kindFilter === key
                  ? "bg-gray-100 text-gray-700"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <Icon className="w-3 h-3" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Invitations List */}
      {invitations.length === 0 ? (
        <div className="text-center py-12">
          <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No invitations found</h3>
          <p className="text-gray-500 mb-4">
            {filter === "sent" 
              ? "You haven't sent any invitations yet"
              : filter === "received"
              ? "You don't have any pending invitations"
              : "No invitations to display"
            }
          </p>
          {onInvite && (
            <Button onClick={onInvite} variant="outline">
              <Send className="w-4 h-4 mr-2" />
              Send Your First Invitation
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {invitations.map((invitation: any) => (
            <InvitationCard key={invitation._id} invitation={invitation} />
          ))}
        </div>
      )}
    </div>
  );
}
