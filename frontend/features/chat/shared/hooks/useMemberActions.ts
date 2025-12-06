"use client";

/**
 * Member Actions Hooks
 * 
 * React hooks for member-related actions in the Chat feature:
 * - Add/remove from favorites
 * - Block/unblock member
 * - Get member profile and shared data
 */

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { useCallback } from "react";

/**
 * Hook to get member profile
 */
export function useMemberProfile(memberId: Id<"users"> | string | undefined) {
  // Skip if no valid memberId
  const validId = memberId && memberId.length > 0 ? memberId as Id<"users"> : undefined;
  return useQuery(
    api.user.memberActions.getMemberProfile,
    validId ? { userId: validId } : "skip"
  );
}

/**
 * Hook to check if member is favorite
 */
export function useIsMemberFavorite(memberId: Id<"users"> | string | undefined) {
  const validId = memberId && memberId.length > 0 ? memberId as Id<"users"> : undefined;
  return useQuery(
    api.user.memberActions.isMemberFavorite,
    validId ? { memberId: validId } : "skip"
  );
}

/**
 * Hook to check if member is blocked
 */
export function useIsMemberBlocked(memberId: Id<"users"> | string | undefined) {
  const validId = memberId && memberId.length > 0 ? memberId as Id<"users"> : undefined;
  return useQuery(
    api.user.memberActions.isMemberBlocked,
    validId ? { memberId: validId } : "skip"
  );
}

/**
 * Hook for shared media with member
 */
export function useSharedMedia(memberId: string | undefined, limit?: number) {
  return useQuery(
    api.user.memberActions.getSharedMedia,
    memberId ? { memberId, limit } : "skip"
  );
}

/**
 * Hook for shared files with member
 */
export function useSharedFiles(memberId: string | undefined, limit?: number) {
  return useQuery(
    api.user.memberActions.getSharedFiles,
    memberId ? { memberId, limit } : "skip"
  );
}

/**
 * Hook for shared links with member
 */
export function useSharedLinks(memberId: string | undefined, limit?: number) {
  return useQuery(
    api.user.memberActions.getSharedLinks,
    memberId ? { memberId, limit } : "skip"
  );
}

/**
 * Hook for common groups with member
 */
export function useCommonGroups(memberId: string | undefined) {
  return useQuery(
    api.user.memberActions.getCommonGroups,
    memberId ? { memberId } : "skip"
  );
}

/**
 * Hook for member actions (mutations)
 */
export function useMemberActions() {
  const addToFavoritesMutation = useMutation(api.user.memberActions.addToFavorites);
  const removeFromFavoritesMutation = useMutation(api.user.memberActions.removeFromFavorites);
  const blockMemberMutation = useMutation(api.user.memberActions.blockMember);
  const unblockMemberMutation = useMutation(api.user.memberActions.unblockMember);
  const reportMemberMutation = useMutation(api.user.memberActions.reportMember);

  const addToFavorites = useCallback(async (
    memberId: string,
    workspaceId: Id<"workspaces">,
  ) => {
    try {
      await addToFavoritesMutation({ memberId, workspaceId });
      toast.success("Added to favorites");
    } catch (error) {
      console.error("Failed to add to favorites:", error);
      toast.error("Failed to add to favorites");
      throw error;
    }
  }, [addToFavoritesMutation]);

  const removeFromFavorites = useCallback(async (
    memberId: string,
    workspaceId: Id<"workspaces">,
  ) => {
    try {
      await removeFromFavoritesMutation({ memberId, workspaceId });
      toast.success("Removed from favorites");
    } catch (error) {
      console.error("Failed to remove from favorites:", error);
      toast.error("Failed to remove from favorites");
      throw error;
    }
  }, [removeFromFavoritesMutation]);

  const blockMember = useCallback(async (memberId: string) => {
    try {
      await blockMemberMutation({ memberId });
      toast.success("Member blocked");
    } catch (error) {
      console.error("Failed to block member:", error);
      toast.error("Failed to block member");
      throw error;
    }
  }, [blockMemberMutation]);

  const unblockMember = useCallback(async (memberId: string) => {
    try {
      await unblockMemberMutation({ memberId });
      toast.success("Member unblocked");
    } catch (error) {
      console.error("Failed to unblock member:", error);
      toast.error("Failed to unblock member");
      throw error;
    }
  }, [unblockMemberMutation]);

  const reportMember = useCallback(async (
    memberId: string,
    reason: string,
    details?: string,
  ) => {
    try {
      await reportMemberMutation({ memberId, reason, details });
      toast.success("Report submitted");
    } catch (error) {
      console.error("Failed to submit report:", error);
      toast.error("Failed to submit report");
      throw error;
    }
  }, [reportMemberMutation]);

  return {
    addToFavorites,
    removeFromFavorites,
    blockMember,
    unblockMember,
    reportMember,
  };
}

/**
 * Combined hook for member info with all data and actions
 */
export function useMemberInfo(memberId: string | undefined) {
  const profile = useMemberProfile(memberId);
  const isFavorite = useIsMemberFavorite(memberId);
  const isBlocked = useIsMemberBlocked(memberId);
  const sharedMedia = useSharedMedia(memberId);
  const sharedFiles = useSharedFiles(memberId);
  const sharedLinks = useSharedLinks(memberId);
  const commonGroups = useCommonGroups(memberId);
  const actions = useMemberActions();

  return {
    profile,
    isFavorite,
    isBlocked,
    sharedMedia,
    sharedFiles,
    sharedLinks,
    commonGroups,
    ...actions,
  };
}
