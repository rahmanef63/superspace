/**
 * Presence Hooks
 * 
 * Hooks for tracking and managing user presence status.
 * 
 * @module features/communications/hooks
 */

"use client"

import * as React from "react"
import { useQuery, useMutation } from "convex/react"
// import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import type { UserPresence, PresenceStatus } from "../shared"

interface UsePresenceOptions {
  workspaceId?: Id<"workspaces">
  channelId?: Id<"channels">
}

/**
 * Fetch presence for users in a workspace or channel
 */
export function usePresence(options: UsePresenceOptions = {}) {
  // TODO: Implement Convex query when backend is ready
  // const presenceData = useQuery(
  //   api.features.communications.presence.list,
  //   options.workspaceId || options.channelId ? {
  //     workspaceId: options.workspaceId,
  //     channelId: options.channelId,
  //   } : "skip"
  // )

  const presenceList: UserPresence[] = []
  const isLoading = false
  const error = null

  return {
    presenceList,
    isLoading,
    error,
    getPresenceByUserId: (userId: Id<"users">) => 
      presenceList.find(p => p.userId === userId),
  }
}

/**
 * Fetch presence for a specific user
 */
export function useUserPresence(userId?: Id<"users">) {
  // TODO: Implement Convex query when backend is ready
  // const presence = useQuery(
  //   api.features.communications.presence.get,
  //   userId ? { userId } : "skip"
  // )

  const presence: UserPresence | null = null
  const isLoading = false
  const error = null

  return {
    presence,
    isLoading,
    error,
  }
}

/**
 * Presence mutation hooks with heartbeat management
 */
export function usePresenceMutations() {
  const heartbeatRef = React.useRef<NodeJS.Timeout | null>(null)
  
  // TODO: Implement Convex mutations when backend is ready
  // const updatePresence = useMutation(api.features.communications.presence.update)
  // const setStatus = useMutation(api.features.communications.presence.setStatus)

  const updatePresence = async (data: {
    status: PresenceStatus
    customStatus?: UserPresence["customStatus"]
    activity?: UserPresence["activity"]
  }) => {
    console.log("Updating presence:", data)
    // return await updatePresence(data)
  }

  const startHeartbeat = React.useCallback((intervalMs = 30000) => {
    // Clear existing heartbeat
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current)
    }
    
    // Start new heartbeat
    heartbeatRef.current = setInterval(() => {
      updatePresence({ status: "online" })
    }, intervalMs)
    
    // Initial presence update
    updatePresence({ status: "online" })
  }, [])

  const stopHeartbeat = React.useCallback(() => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current)
      heartbeatRef.current = null
    }
    updatePresence({ status: "offline" })
  }, [])

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current)
      }
    }
  }, [])

  return {
    updatePresence,
    startHeartbeat,
    stopHeartbeat,
    
    setOnline: () => updatePresence({ status: "online" }),
    setIdle: () => updatePresence({ status: "idle" }),
    setDnd: () => updatePresence({ status: "dnd" }),
    setInvisible: () => updatePresence({ status: "invisible" }),
    setOffline: () => updatePresence({ status: "offline" }),
    
    setStatusMessage: (message: string) => updatePresence({ 
      status: "online", 
      customStatus: { text: message }
    }),
    
    setActivity: (activity: UserPresence["activity"]) => updatePresence({
      status: "online",
      activity,
    }),
  }
}

/**
 * Auto-manage presence based on visibility and activity
 */
export function useAutoPresence() {
  const { startHeartbeat, stopHeartbeat, setIdle, setOnline } = usePresenceMutations()
  const idleTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)
  
  React.useEffect(() => {
    // Start heartbeat when component mounts
    startHeartbeat()
    
    // Handle visibility change
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIdle()
      } else {
        setOnline()
      }
    }
    
    // Handle user activity
    const handleActivity = () => {
      setOnline()
      
      // Reset idle timeout
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current)
      }
      
      // Set idle after 5 minutes of inactivity
      idleTimeoutRef.current = setTimeout(() => {
        setIdle()
      }, 5 * 60 * 1000)
    }
    
    // Add event listeners
    document.addEventListener("visibilitychange", handleVisibilityChange)
    document.addEventListener("mousemove", handleActivity)
    document.addEventListener("keydown", handleActivity)
    
    return () => {
      stopHeartbeat()
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      document.removeEventListener("mousemove", handleActivity)
      document.removeEventListener("keydown", handleActivity)
      
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current)
      }
    }
  }, [startHeartbeat, stopHeartbeat, setIdle, setOnline])
}

export default usePresence
