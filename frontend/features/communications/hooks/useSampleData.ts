/**
 * Sample Data Initialization Hook
 * 
 * Initializes the store with sample data for development/demo.
 * In production, this will be replaced with Convex data fetching.
 * 
 * @module features/communications/hooks/useSampleData
 */

"use client"

import * as React from "react"
import { useCommunicationsStore } from "../shared/stores"
import {
  SAMPLE_CATEGORIES,
  SAMPLE_CHANNELS,
  SAMPLE_MESSAGES,
  SAMPLE_DM_CONVERSATIONS,
  SAMPLE_AI_BOTS,
  SAMPLE_PRESENCE,
} from "../shared/stores/sampleData"

/**
 * Initialize store with sample data for development
 * 
 * Usage:
 * ```tsx
 * function CommunicationsPage() {
 *   useSampleData() // Call once at top level
 *   return <CommunicationsView />
 * }
 * ```
 */
export function useSampleData() {
  const initialized = React.useRef(false)

  React.useEffect(() => {
    // Only initialize once
    if (initialized.current) return
    initialized.current = true
    
    // Get store state directly (non-reactive)
    const store = useCommunicationsStore.getState()
    
    // Check if already has data (don't overwrite)
    if (store.channel.channels.length > 0) {
      return
    }

    // Initialize with sample data
    store.setCategories(SAMPLE_CATEGORIES)
    store.setChannels(SAMPLE_CHANNELS)
    
    Object.entries(SAMPLE_MESSAGES).forEach(([channelId, messages]) => {
      store.setChannelMessages(channelId, messages)
    })

    store.setDirectConversations(SAMPLE_DM_CONVERSATIONS)
    store.setBots(SAMPLE_AI_BOTS)
    
    Object.values(SAMPLE_PRESENCE).forEach(presence => {
      store.updatePresence(presence.userId, presence)
    })
  }, [])
}

export default useSampleData
