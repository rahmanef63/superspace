import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";

// Friends API hooks
export const useFriendsApi = () => {
  // Queries
  const friends = useQuery(api.user.friends.getUserFriends);
  const pendingRequests = useQuery(api.user.friends.getPendingFriendRequests);
  const sentRequests = useQuery(api.user.friends.getSentFriendRequests);

  // Mutations
  const sendFriendRequest = useMutation(api.user.friends.sendFriendRequest);
  const acceptFriendRequest = useMutation(api.user.friends.acceptFriendRequest);
  const declineFriendRequest = useMutation(api.user.friends.declineFriendRequest);
  const removeFriend = useMutation(api.user.friends.removeFriend);
  // Note: blockUser and unblockUser functions need to be implemented in convex/friends.ts

  return {
    // Data
    friends,
    pendingRequests,
    sentRequests,
    
    // Actions
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriend,
  };
};

// Individual hooks for specific use cases
export const useFriends = () => useQuery(api.user.friends.getUserFriends);
export const usePendingFriendRequests = () => useQuery(api.user.friends.getPendingFriendRequests);
export const useSentFriendRequests = () => useQuery(api.user.friends.getSentFriendRequests);

export const useSendFriendRequest = () => useMutation(api.user.friends.sendFriendRequest);
export const useAcceptFriendRequest = () => useMutation(api.user.friends.acceptFriendRequest);
export const useDeclineFriendRequest = () => useMutation(api.user.friends.declineFriendRequest);
export const useRemoveFriend = () => useMutation(api.user.friends.removeFriend);
