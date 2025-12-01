"use client"

import { createFeatureSettingsHook } from "@/frontend/shared/settings/hooks/useSettingsStorage"

/**
 * Chat Settings Schema
 * 
 * Defines all settings for the Chat feature with their default values.
 * This schema is used for localStorage persistence and type safety.
 */
export interface ChatSettingsSchema {
  // General
  enterToSend: boolean
  showTimestamps: boolean
  compactMode: boolean
  showAvatars: boolean
  messageGroupingInterval: number // seconds
  
  // Notifications
  desktopNotifications: boolean
  soundEnabled: boolean
  showPreviews: boolean
  notifyMentions: boolean
  notifyDMs: boolean
  notificationSound: "default" | "subtle" | "none"
  
  // Privacy
  readReceipts: boolean
  typingIndicator: boolean
  onlineStatus: "everyone" | "contacts" | "nobody"
  lastSeen: "everyone" | "contacts" | "nobody"
  
  // AI Features
  aiEnabled: boolean
  autoSuggestions: boolean
  smartReplies: boolean
  languageCorrection: boolean
  
  // Media
  autoDownloadImages: boolean
  autoDownloadVideos: boolean
  autoDownloadDocuments: boolean
  imageQuality: "original" | "high" | "medium" | "low"
  linkPreviews: boolean
}

/**
 * Default Chat Settings
 */
export const DEFAULT_CHAT_SETTINGS: ChatSettingsSchema = {
  // General
  enterToSend: true,
  showTimestamps: true,
  compactMode: false,
  showAvatars: true,
  messageGroupingInterval: 60,
  
  // Notifications
  desktopNotifications: true,
  soundEnabled: true,
  showPreviews: true,
  notifyMentions: true,
  notifyDMs: true,
  notificationSound: "default",
  
  // Privacy
  readReceipts: true,
  typingIndicator: true,
  onlineStatus: "everyone",
  lastSeen: "everyone",
  
  // AI Features
  aiEnabled: true,
  autoSuggestions: true,
  smartReplies: true,
  languageCorrection: false,
  
  // Media
  autoDownloadImages: true,
  autoDownloadVideos: false,
  autoDownloadDocuments: false,
  imageQuality: "high",
  linkPreviews: true,
}

/**
 * Hook for accessing Chat settings with localStorage persistence
 * 
 * @example
 * const { settings, updateSetting, resetSettings } = useChatSettings()
 * 
 * // Read a setting
 * if (settings.enterToSend) { ... }
 * 
 * // Update a setting
 * updateSetting("enterToSend", false)
 */
export const useChatSettingsStorage = createFeatureSettingsHook<ChatSettingsSchema>(
  "chat",
  DEFAULT_CHAT_SETTINGS
)
