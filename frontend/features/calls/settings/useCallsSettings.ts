"use client"

import { createFeatureSettingsHook } from "@/frontend/shared/settings/hooks/useSettingsStorage"

/**
 * Calls Settings Schema
 * 
 * Defines all settings for the Calls feature with their default values.
 */
export interface CallsSettingsSchema {
  // Call Quality
  videoQuality: "auto" | "high" | "medium" | "low"
  audioQuality: "high" | "medium" | "low"
  noiseSuppression: boolean
  echoCancellation: boolean
  autoAdjustQuality: boolean
  
  // Devices
  defaultMicrophone: string
  defaultSpeaker: string
  defaultCamera: string
  
  // Call Behavior
  autoAnswerCalls: boolean
  answerWithVideo: boolean
  ringtone: "default" | "classic" | "digital" | "silent"
  ringDuration: number // seconds
  callWaiting: boolean
  
  // Recording
  allowRecording: boolean
  recordingQuality: "high" | "medium" | "low"
  autoSaveRecordings: boolean
  
  // Bandwidth
  dataSaverMode: boolean
  limitVideoOnMobile: boolean
}

/**
 * Default Calls Settings
 */
export const DEFAULT_CALLS_SETTINGS: CallsSettingsSchema = {
  // Call Quality
  videoQuality: "auto",
  audioQuality: "high",
  noiseSuppression: true,
  echoCancellation: true,
  autoAdjustQuality: true,
  
  // Devices
  defaultMicrophone: "default",
  defaultSpeaker: "default",
  defaultCamera: "default",
  
  // Call Behavior
  autoAnswerCalls: false,
  answerWithVideo: true,
  ringtone: "default",
  ringDuration: 30,
  callWaiting: true,
  
  // Recording
  allowRecording: true,
  recordingQuality: "high",
  autoSaveRecordings: true,
  
  // Bandwidth
  dataSaverMode: false,
  limitVideoOnMobile: true,
}

/**
 * Hook for accessing Calls settings with localStorage persistence
 */
export const useCallsSettingsStorage = createFeatureSettingsHook<CallsSettingsSchema>(
  "calls",
  DEFAULT_CALLS_SETTINGS
)
