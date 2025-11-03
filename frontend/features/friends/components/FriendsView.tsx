"use client";

import { useMemo } from "react";
import type { Id } from "@convex/_generated/dataModel";
import { ViewSwitcher, type LegacyViewConfig } from "@/frontend/shared/ui/layout/view-system";
import { useFriends, useRemoveFriend } from "../api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, UserMinus } from "lucide-react";

type FriendRow = {
  _id: Id<"friendships">;
  friend?: {
    _id: Id<"users">;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
  createdAt?: number | null;
};

const initials = (name?: string | null, email?: string | null) => {
  const source = (name && name.trim()) || email || "U";
  const parts = source.split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.substring(0, 2).toUpperCase();
};

export function FriendsView({ workspaceId }: { workspaceId?: Id<"workspaces"> }) {
  const rows = (useFriends() || []) as any as FriendRow[];
  const removeFriend = useRemoveFriend();

  const config: LegacyViewConfig<FriendRow> = useMemo(() => ({
    getId: (r) => String(r._id),
    columns: [
      {
        id: "user",
        header: "User",
        cell: (r) => (
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={r.friend?.image || undefined} alt={r.friend?.name || "User"} />
              <AvatarFallback>{initials(r.friend?.name, r.friend?.email)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="font-medium truncate">{r.friend?.name || initials(undefined, r.friend?.email)}</div>
              <div className="text-xs text-gray-500 truncate">{r.friend?.email}</div>
            </div>
          </div>
        ),
      },
      {
        id: "since",
        header: "Since",
        accessor: (r) => (r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""),
        hideOnCard: true,
      },
    ],
    actions: [
      {
        id: "message",
        label: "Message",
        icon: <MessageSquare className="w-4 h-4" />,
        onClick: (r) => {
          // Integrate to chat route if needed
          console.debug("message", r.friend?._id);
        },
      },
      {
        id: "remove",
        label: "Remove",
        icon: <UserMinus className="w-4 h-4" />,
        onClick: async (r) => {
          if (!r.friend?._id) return;
          if (!confirm("Remove this friend?")) return;
          await removeFriend({ friendId: r.friend._id });
        },
      },
    ],
    card: {
      title: (r) => r.friend?.name || initials(undefined, r.friend?.email),
      subtitle: (r) => r.friend?.email,
      avatar: (r) => (
        <Avatar className="w-8 h-8">
          <AvatarImage src={r.friend?.image || undefined} alt={r.friend?.name || "User"} />
          <AvatarFallback>{initials(r.friend?.name, r.friend?.email)}</AvatarFallback>
        </Avatar>
      ),
      extra: (r) => (
        <span className="text-xs text-gray-500">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""}</span>
      ),
    },
    details: {
      fields: [
        { label: "Name", value: (r) => r.friend?.name },
        { label: "Email", value: (r) => r.friend?.email },
        { label: "Since", value: (r) => (r.createdAt ? new Date(r.createdAt).toLocaleString() : "") },
      ],
    },
    searchFn: (r, q) =>
      Boolean(r.friend?.name?.toLowerCase().includes(q) || r.friend?.email?.toLowerCase().includes(q)),
  }), [removeFriend]);

  return (
    <ViewSwitcher
      storageKey={`friends.view.${workspaceId ?? "default"}`}
      initialMode="card"
      data={rows}
      config={config}
      searchable
      emptyState="No friends"
    />
  );
}
