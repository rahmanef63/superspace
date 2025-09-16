"use client"

import type { Id } from "@convex/_generated/dataModel";
import { FriendsList } from "./components/FriendsList";

export interface FriendsPageProps {
  workspaceId?: Id<"workspaces"> | null;
}

export default function FriendsPage({ workspaceId }: FriendsPageProps) {
  return <FriendsList 
  workspaceId={workspaceId as Id<"workspaces">} />;
}
