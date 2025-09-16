import type { Id } from "@convex/_generated/dataModel";

export interface FriendsListProps {
  workspaceId?: Id<"workspaces">;
}

export interface Friendship {
  _id: Id<"friendships">;
  user1Id: Id<"users">;
  user2Id: Id<"users">;
  status: "active" | "blocked" | "removed" | string;
  createdAt: number;
  friend?: { name?: string | null; email?: string | null; image?: string | null } | null;
}

export interface FriendRequest {
  _id: Id<"friendRequests">;
  senderId: Id<"users">;
  receiverId: Id<"users">;
  status: "pending" | "accepted" | "declined" | string;
  message?: string | null;
  sentAt: number;
  respondedAt?: number | null;
  sender?: { name?: string | null; email?: string | null; image?: string | null } | null;
  receiver?: { name?: string | null; email?: string | null; image?: string | null } | null;
}

export interface WorkspaceMemberSummary {
  userId: Id<"users">;
  name?: string;
  email?: string;
  image?: string;
  role?: { name?: string } | null;
}

export interface AddFriendModalProps {
  workspaceId?: Id<"workspaces">;
  onClose: () => void;
}
