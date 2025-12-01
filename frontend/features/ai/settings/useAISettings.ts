"use client"

/**
 * AI Settings Hook
 * Provides persistent storage for AI feature settings
 */

import { createFeatureSettingsHook } from "@/frontend/shared/settings/hooks/useSettingsStorage"

/**
 * Schema for AI Settings
 */
export interface AISettingsSchema {
  // General settings
  aiEnabled: boolean
  defaultModel: "gpt-4" | "gpt-4-turbo" | "gpt-3.5" | "claude-3" | "claude-2" | "llama-3"
  streamResponses: boolean
  saveHistory: boolean
  historyRetentionDays: "7" | "30" | "90" | "365" | "forever"
  
  // Behavior settings
  temperature: number
  maxTokens: "512" | "1024" | "2048" | "4096" | "8192"
  contextWindow: boolean
  contextMessages: number
  topP: number
  
  // Privacy settings
  shareDataForImprovement: boolean
  anonymizeData: boolean
  localProcessingOnly: boolean
  
  // Personalization settings
  usePersonality: boolean
  personalityTone: "professional" | "friendly" | "casual" | "formal"
  autoSuggest: boolean
  suggestFrequency: "always" | "sometimes" | "rarely"
  learnFromHistory: boolean
}

/**
 * Default values for AI settings
 */
export const defaultAISettings: AISettingsSchema = {
  // General settings
  aiEnabled: true,
  defaultModel: "gpt-4",
  streamResponses: true,
  saveHistory: true,
  historyRetentionDays: "30",
  
  // Behavior settings
  temperature: 0.7,
  maxTokens: "2048",
  contextWindow: true,
  contextMessages: 10,
  topP: 1.0,
  
  // Privacy settings
  shareDataForImprovement: false,
  anonymizeData: true,
  localProcessingOnly: false,
  
  // Personalization settings
  usePersonality: true,
  personalityTone: "professional",
  autoSuggest: true,
  suggestFrequency: "sometimes",
  learnFromHistory: true,
}

/**
 * Hook for managing AI settings with persistence
 */
export const useAISettingsStorage = createFeatureSettingsHook<AISettingsSchema>(
  "ai",
  defaultAISettings
)
