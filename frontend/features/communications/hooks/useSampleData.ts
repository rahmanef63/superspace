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
}

export default useSampleData
