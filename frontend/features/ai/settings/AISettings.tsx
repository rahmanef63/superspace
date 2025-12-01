"use client"

/**
 * AI Feature Settings
 * All settings with persistence using useAISettingsStorage
 */

import { SettingsSection } from "@/frontend/shared/settings/primitives/SettingsSection"
import { SettingsToggle } from "@/frontend/shared/settings/primitives/SettingsToggle"
import { SettingsSelect } from "@/frontend/shared/settings/primitives/SettingsSelect"
import { SettingsSlider } from "@/frontend/shared/settings/primitives/SettingsSlider"
import { useAISettingsStorage } from "./useAISettings"

/**
 * AI General Settings
 * Core AI assistant configuration
 */
export function AIGeneralSettings() {
  const { settings, updateSetting, isLoading } = useAISettingsStorage()

  if (isLoading) {
    return <div className="animate-pulse h-48 bg-muted rounded-lg" />
  }

  return (
    <div className="space-y-6">
      <SettingsSection
        title="AI Assistant"
        description="Configure your AI assistant preferences"
      >
        <SettingsToggle
          label="Enable AI Assistant"
          description="Use AI to help with tasks and conversations"
          checked={settings.aiEnabled}
          onCheckedChange={(checked) => updateSetting("aiEnabled", checked)}
        />

        <SettingsSelect
          label="Default Model"
          description="Choose which AI model to use"
          value={settings.defaultModel}
          onValueChange={(value) => updateSetting("defaultModel", value as typeof settings.defaultModel)}
          options={[
            { value: "gpt-4", label: "GPT-4" },
            { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
            { value: "gpt-3.5", label: "GPT-3.5 Turbo" },
            { value: "claude-3", label: "Claude 3" },
            { value: "claude-2", label: "Claude 2" },
            { value: "llama-3", label: "Llama 3" },
          ]}
        />

        <SettingsToggle
          label="Stream Responses"
          description="Show AI responses as they are generated"
          checked={settings.streamResponses}
          onCheckedChange={(checked) => updateSetting("streamResponses", checked)}
        />
      </SettingsSection>

      <SettingsSection
        title="Chat History"
        description="Manage AI conversation history"
      >
        <SettingsToggle
          label="Save Chat History"
          description="Keep a record of AI conversations"
          checked={settings.saveHistory}
          onCheckedChange={(checked) => updateSetting("saveHistory", checked)}
        />

        <SettingsSelect
          label="History Retention"
          description="How long to keep AI chat history"
          value={settings.historyRetentionDays}
          onValueChange={(value) => updateSetting("historyRetentionDays", value as typeof settings.historyRetentionDays)}
          options={[
            { value: "7", label: "7 days" },
            { value: "30", label: "30 days" },
            { value: "90", label: "90 days" },
            { value: "365", label: "1 year" },
            { value: "forever", label: "Forever" },
          ]}
        />
      </SettingsSection>
    </div>
  )
}

/**
 * AI Behavior Settings
 * Fine-tune AI response generation
 */
export function AIBehaviorSettings() {
  const { settings, updateSetting, isLoading } = useAISettingsStorage()

  if (isLoading) {
    return <div className="animate-pulse h-48 bg-muted rounded-lg" />
  }

  return (
    <div className="space-y-6">
      <SettingsSection
        title="Response Generation"
        description="Fine-tune how the AI responds"
      >
        <SettingsSlider
          label="Creativity (Temperature)"
          description="Higher values make responses more creative, lower values more focused"
          value={[settings.temperature * 100]}
          onValueChange={(value) => updateSetting("temperature", value[0] / 100)}
          max={100}
          step={5}
          showValue
        />

        <SettingsSelect
          label="Max Response Length"
          description="Maximum tokens in AI responses"
          value={settings.maxTokens}
          onValueChange={(value) => updateSetting("maxTokens", value as typeof settings.maxTokens)}
          options={[
            { value: "512", label: "Short (512)" },
            { value: "1024", label: "Medium (1024)" },
            { value: "2048", label: "Long (2048)" },
            { value: "4096", label: "Very Long (4096)" },
            { value: "8192", label: "Maximum (8192)" },
          ]}
        />
      </SettingsSection>

      <SettingsSection
        title="Context"
        description="How the AI uses conversation context"
      >
        <SettingsToggle
          label="Include Context"
          description="Include previous messages for context"
          checked={settings.contextWindow}
          onCheckedChange={(checked) => updateSetting("contextWindow", checked)}
        />

        <SettingsSlider
          label="Context Messages"
          description="Number of previous messages to include"
          value={[settings.contextMessages]}
          onValueChange={(value) => updateSetting("contextMessages", value[0])}
          max={50}
          min={1}
          step={1}
          showValue
        />
      </SettingsSection>
    </div>
  )
}

/**
 * AI Privacy Settings
 * Control data sharing and privacy
 */
export function AIPrivacySettings() {
  const { settings, updateSetting, isLoading } = useAISettingsStorage()

  if (isLoading) {
    return <div className="animate-pulse h-48 bg-muted rounded-lg" />
  }

  return (
    <div className="space-y-6">
      <SettingsSection
        title="Data Sharing"
        description="Control how your data is used"
      >
        <SettingsToggle
          label="Share Data for Improvement"
          description="Help improve AI by sharing anonymized usage data"
          checked={settings.shareDataForImprovement}
          onCheckedChange={(checked) => updateSetting("shareDataForImprovement", checked)}
        />

        <SettingsToggle
          label="Anonymize Data"
          description="Remove personal identifiers from shared data"
          checked={settings.anonymizeData}
          onCheckedChange={(checked) => updateSetting("anonymizeData", checked)}
        />

        <SettingsToggle
          label="Local Processing Only"
          description="Process AI requests locally when possible"
          checked={settings.localProcessingOnly}
          onCheckedChange={(checked) => updateSetting("localProcessingOnly", checked)}
        />
      </SettingsSection>
    </div>
  )
}

/**
 * AI Personalization Settings
 * Customize AI personality and suggestions
 */
export function AIPersonalizationSettings() {
  const { settings, updateSetting, isLoading } = useAISettingsStorage()

  if (isLoading) {
    return <div className="animate-pulse h-48 bg-muted rounded-lg" />
  }

  return (
    <div className="space-y-6">
      <SettingsSection
        title="Personality"
        description="Customize AI response style"
      >
        <SettingsToggle
          label="Use Custom Personality"
          description="Enable personalized AI response style"
          checked={settings.usePersonality}
          onCheckedChange={(checked) => updateSetting("usePersonality", checked)}
        />

        <SettingsSelect
          label="Response Tone"
          description="How the AI should communicate"
          value={settings.personalityTone}
          onValueChange={(value) => updateSetting("personalityTone", value as typeof settings.personalityTone)}
          options={[
            { value: "professional", label: "Professional" },
            { value: "friendly", label: "Friendly" },
            { value: "casual", label: "Casual" },
            { value: "formal", label: "Formal" },
          ]}
        />
      </SettingsSection>

      <SettingsSection
        title="Smart Suggestions"
        description="AI-powered suggestions and learning"
      >
        <SettingsToggle
          label="Auto Suggestions"
          description="Show AI suggestions while typing"
          checked={settings.autoSuggest}
          onCheckedChange={(checked) => updateSetting("autoSuggest", checked)}
        />

        <SettingsSelect
          label="Suggestion Frequency"
          description="How often to show suggestions"
          value={settings.suggestFrequency}
          onValueChange={(value) => updateSetting("suggestFrequency", value as typeof settings.suggestFrequency)}
          options={[
            { value: "always", label: "Always" },
            { value: "sometimes", label: "Sometimes" },
            { value: "rarely", label: "Rarely" },
          ]}
        />

        <SettingsToggle
          label="Learn from History"
          description="Use past conversations to improve responses"
          checked={settings.learnFromHistory}
          onCheckedChange={(checked) => updateSetting("learnFromHistory", checked)}
        />
      </SettingsSection>
    </div>
  )
}
