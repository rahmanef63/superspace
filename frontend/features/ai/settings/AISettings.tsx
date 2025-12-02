"use client"

/**
 * AI Feature Settings
 * All settings with persistence using useAISettingsStorage
 */

import { useState, useMemo } from "react"
import { SettingsSection } from "@/frontend/shared/settings/primitives/SettingsSection"
import { SettingsToggle } from "@/frontend/shared/settings/primitives/SettingsToggle"
import { SettingsSelect } from "@/frontend/shared/settings/primitives/SettingsSelect"
import { SettingsSlider } from "@/frontend/shared/settings/primitives/SettingsSlider"
import { 
  useAISettingsStorage, 
  AI_PROVIDERS, 
  getAIProvider, 
  getProviderModels,
  type AIApiKeyConfig 
} from "./useAISettings"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Eye, 
  EyeOff, 
  Check, 
  X, 
  ExternalLink, 
  Key, 
  Trash2,
  Plus,
  Crown,
  Sparkles,
  Building2,
  Server,
  AlertCircle,
  CheckCircle2
} from "lucide-react"
import {
  Accordion,
  type AccordionItem as AccordionItemType,
} from "@/components/ui/accordion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"

/**
 * Get tier badge for provider
 */
function ProviderTierBadge({ tier }: { tier: "premium" | "opensource" | "enterprise" }) {
  const config = {
    premium: { label: "Premium", icon: Crown, variant: "default" as const, className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
    enterprise: { label: "Enterprise", icon: Building2, variant: "secondary" as const, className: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
    opensource: { label: "Open Source", icon: Sparkles, variant: "outline" as const, className: "bg-green-500/10 text-green-600 border-green-500/20" },
  }
  
  const { label, icon: Icon, className } = config[tier]
  
  return (
    <Badge variant="outline" className={className}>
      <Icon className="h-3 w-3 mr-1" />
      {label}
    </Badge>
  )
}

/**
 * API Key Input Component with show/hide toggle
 */
function ApiKeyInput({
  value,
  onChange,
  placeholder,
  disabled,
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
}) {
  const [showKey, setShowKey] = useState(false)

  return (
    <div className="relative">
      <Input
        type={showKey ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "sk-..."}
        disabled={disabled}
        className="pr-10 font-mono text-sm"
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
        onClick={() => setShowKey(!showKey)}
        disabled={disabled}
      >
        {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </Button>
    </div>
  )
}

/**
 * AI API Keys Settings
 * Configure API keys for different AI providers
 */
export function AIApiKeysSettings() {
  const { settings, updateSetting, isLoading } = useAISettingsStorage()
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<string>("")
  const [newApiKey, setNewApiKey] = useState("")
  const [newBaseUrl, setNewBaseUrl] = useState("")

  if (isLoading) {
    return <div className="animate-pulse h-48 bg-muted rounded-lg" />
  }

  const configuredProviders = settings.apiKeys || []

  const handleAddApiKey = () => {
    if (!selectedProvider || !newApiKey.trim()) {
      toast.error("Please select a provider and enter an API key")
      return
    }

    const newConfig: AIApiKeyConfig = {
      providerId: selectedProvider,
      apiKey: newApiKey.trim(),
      baseUrl: newBaseUrl.trim() || undefined,
      isEnabled: true,
    }

    // Remove existing config for this provider if exists
    const filtered = configuredProviders.filter(k => k.providerId !== selectedProvider)
    updateSetting("apiKeys", [...filtered, newConfig])

    toast.success(`API key added for ${getAIProvider(selectedProvider)?.name}`)
    setAddDialogOpen(false)
    setSelectedProvider("")
    setNewApiKey("")
    setNewBaseUrl("")
  }

  const handleRemoveApiKey = (providerId: string) => {
    const filtered = configuredProviders.filter(k => k.providerId !== providerId)
    updateSetting("apiKeys", filtered)
    toast.success("API key removed")
  }

  const handleToggleApiKey = (providerId: string, enabled: boolean) => {
    const updated = configuredProviders.map(k => 
      k.providerId === providerId ? { ...k, isEnabled: enabled } : k
    )
    updateSetting("apiKeys", updated)
  }

  const handleUpdateApiKey = (providerId: string, apiKey: string) => {
    const updated = configuredProviders.map(k => 
      k.providerId === providerId ? { ...k, apiKey } : k
    )
    updateSetting("apiKeys", updated)
  }

  const handleUpdateBaseUrl = (providerId: string, baseUrl: string) => {
    const updated = configuredProviders.map(k => 
      k.providerId === providerId ? { ...k, baseUrl: baseUrl || undefined } : k
    )
    updateSetting("apiKeys", updated)
  }

  // Group providers by tier
  const premiumProviders = AI_PROVIDERS.filter(p => p.tier === "premium")
  const enterpriseProviders = AI_PROVIDERS.filter(p => p.tier === "enterprise")
  const opensourceProviders = AI_PROVIDERS.filter(p => p.tier === "opensource")

  const unconfiguredProviders = AI_PROVIDERS.filter(
    p => !configuredProviders.some(k => k.providerId === p.id)
  )

  return (
    <div className="space-y-6">
      {/* Configured API Keys */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              API Keys
            </CardTitle>
            <CardDescription>
              Configure API keys to use AI models from different providers
            </CardDescription>
          </div>
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Provider
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add AI Provider</DialogTitle>
                <DialogDescription>
                  Configure an API key to use models from this provider
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Provider</Label>
                  <select
                    value={selectedProvider}
                    onChange={(e) => setSelectedProvider(e.target.value)}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="">Select a provider...</option>
                    <optgroup label="Premium">
                      {premiumProviders.filter(p => !configuredProviders.some(k => k.providerId === p.id)).map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Enterprise">
                      {enterpriseProviders.filter(p => !configuredProviders.some(k => k.providerId === p.id)).map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Open Source">
                      {opensourceProviders.filter(p => !configuredProviders.some(k => k.providerId === p.id)).map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                {selectedProvider && (
                  <>
                    <div className="rounded-lg border p-3 bg-muted/50">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium">{getAIProvider(selectedProvider)?.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {getAIProvider(selectedProvider)?.description}
                          </p>
                        </div>
                        <ProviderTierBadge tier={getAIProvider(selectedProvider)?.tier || "opensource"} />
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                          {getAIProvider(selectedProvider)?.sdkPackage}
                        </code>
                        <a 
                          href={getAIProvider(selectedProvider)?.docsUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline flex items-center gap-1"
                        >
                          Docs <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>API Key</Label>
                      <ApiKeyInput
                        value={newApiKey}
                        onChange={setNewApiKey}
                        placeholder={selectedProvider === "openai" ? "sk-..." : "Enter API key"}
                      />
                    </div>

                    {(selectedProvider === "ollama" || selectedProvider === "fireworks") && (
                      <div className="space-y-2">
                        <Label>Base URL (Optional)</Label>
                        <Input
                          value={newBaseUrl}
                          onChange={(e) => setNewBaseUrl(e.target.value)}
                          placeholder={selectedProvider === "ollama" ? "http://localhost:11434" : "https://api.fireworks.ai/inference/v1"}
                        />
                        <p className="text-xs text-muted-foreground">
                          Custom endpoint URL for self-hosted or proxy setups
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddApiKey} disabled={!selectedProvider || !newApiKey}>
                  Add API Key
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {configuredProviders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">No API keys configured</p>
              <p className="text-sm mt-1">Add an API key to start using AI models</p>
            </div>
          ) : (
            <div className="space-y-4">
              {configuredProviders.map((config) => {
                const provider = getAIProvider(config.providerId)
                if (!provider) return null

                return (
                  <div 
                    key={config.providerId}
                    className="rounded-lg border p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          config.isEnabled ? "bg-primary/10" : "bg-muted"
                        }`}>
                          {config.isEnabled ? (
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{provider.name}</span>
                            <ProviderTierBadge tier={provider.tier} />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {provider.models.length} models available
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <SettingsToggle
                          label=""
                          checked={config.isEnabled}
                          onCheckedChange={(checked) => handleToggleApiKey(config.providerId, checked)}
                        />
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleRemoveApiKey(config.providerId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">API Key</Label>
                      <ApiKeyInput
                        value={config.apiKey}
                        onChange={(value) => handleUpdateApiKey(config.providerId, value)}
                        disabled={!config.isEnabled}
                      />
                    </div>

                    {(config.providerId === "ollama" || config.baseUrl) && (
                      <div className="space-y-2">
                        <Label className="text-xs">Base URL</Label>
                        <Input
                          value={config.baseUrl || ""}
                          onChange={(e) => handleUpdateBaseUrl(config.providerId, e.target.value)}
                          placeholder="http://localhost:11434"
                          disabled={!config.isEnabled}
                          className="text-sm"
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-2">
                      <a 
                        href={provider.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                      >
                        Website <ExternalLink className="h-3 w-3" />
                      </a>
                      <span className="text-muted-foreground">•</span>
                      <a 
                        href={provider.docsUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                      >
                        Documentation <ExternalLink className="h-3 w-3" />
                      </a>
                      <span className="text-muted-foreground">•</span>
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                        {provider.sdkPackage}
                      </code>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Providers Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Available Providers</CardTitle>
          <CardDescription>
            Reference guide for supported AI providers and their SDKs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion 
            type="single" 
            className="w-full"
            items={[
              {
                value: "premium",
                title: (
                  <div className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-amber-500" />
                    Premium Providers ({premiumProviders.length})
                  </div>
                ),
                content: (
                  <div className="space-y-3 pt-2">
                    {premiumProviders.map(provider => (
                      <div key={provider.id} className="flex items-start justify-between p-3 rounded-lg bg-muted/50">
                        <div>
                          <p className="font-medium text-sm">{provider.name}</p>
                          <p className="text-xs text-muted-foreground">{provider.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <code className="text-xs bg-background px-1.5 py-0.5 rounded border">
                              {provider.sdkPackage}
                            </code>
                            <span className="text-xs text-muted-foreground">
                              {provider.models.length} models
                            </span>
                          </div>
                        </div>
                        <a 
                          href={provider.docsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline flex items-center gap-1"
                        >
                          Docs <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    ))}
                  </div>
                ),
              },
              {
                value: "enterprise",
                title: (
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-purple-500" />
                    Enterprise Providers ({enterpriseProviders.length})
                  </div>
                ),
                content: (
                  <div className="space-y-3 pt-2">
                    {enterpriseProviders.map(provider => (
                      <div key={provider.id} className="flex items-start justify-between p-3 rounded-lg bg-muted/50">
                        <div>
                          <p className="font-medium text-sm">{provider.name}</p>
                          <p className="text-xs text-muted-foreground">{provider.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <code className="text-xs bg-background px-1.5 py-0.5 rounded border">
                              {provider.sdkPackage}
                            </code>
                            <span className="text-xs text-muted-foreground">
                              {provider.models.length} models
                            </span>
                          </div>
                        </div>
                        <a 
                          href={provider.docsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline flex items-center gap-1"
                        >
                          Docs <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    ))}
                  </div>
                ),
              },
              {
                value: "opensource",
                title: (
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-green-500" />
                    Open Source Providers ({opensourceProviders.length})
                  </div>
                ),
                content: (
                  <div className="space-y-3 pt-2">
                    {opensourceProviders.map(provider => (
                      <div key={provider.id} className="flex items-start justify-between p-3 rounded-lg bg-muted/50">
                        <div>
                          <p className="font-medium text-sm">{provider.name}</p>
                          <p className="text-xs text-muted-foreground">{provider.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <code className="text-xs bg-background px-1.5 py-0.5 rounded border">
                              {provider.sdkPackage}
                            </code>
                            <span className="text-xs text-muted-foreground">
                              {provider.models.length} models
                            </span>
                          </div>
                        </div>
                        <a 
                          href={provider.docsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline flex items-center gap-1"
                        >
                          Docs <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    ))}
                  </div>
                ),
              },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * AI General Settings
 * Core AI assistant configuration
 */
export function AIGeneralSettings() {
  const { settings, updateSetting, isLoading } = useAISettingsStorage()

  // Get available providers (those with API keys configured)
  const configuredProviders = useMemo(() => {
    const keys = settings.apiKeys || []
    return keys.filter(k => k.isEnabled).map(k => getAIProvider(k.providerId)).filter(Boolean)
  }, [settings.apiKeys])

  // Get models for selected provider
  const availableModels = useMemo(() => {
    return getProviderModels(settings.defaultProvider)
  }, [settings.defaultProvider])

  if (isLoading) {
    return <div className="animate-pulse h-48 bg-muted rounded-lg" />
  }

  // Build provider options
  const providerOptions = configuredProviders.length > 0
    ? configuredProviders.map(p => ({ value: p!.id, label: p!.name }))
    : AI_PROVIDERS.slice(0, 6).map(p => ({ value: p.id, label: p.name }))

  // Build model options
  const modelOptions = availableModels.length > 0
    ? availableModels.map(m => ({ value: m.id, label: m.name }))
    : [
        { value: "gpt-4o", label: "GPT-4o" },
        { value: "gpt-4o-mini", label: "GPT-4o Mini" },
        { value: "claude-3-5-sonnet", label: "Claude 3.5 Sonnet" },
      ]

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

        {configuredProviders.length === 0 && (
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-sm">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
              <div>
                <p className="font-medium text-amber-600">No API keys configured</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Go to the <strong>API Keys</strong> section to add your provider API keys
                </p>
              </div>
            </div>
          </div>
        )}

        <SettingsSelect
          label="Default Provider"
          description="Choose which AI provider to use"
          value={settings.defaultProvider}
          onValueChange={(value) => {
            updateSetting("defaultProvider", value)
            // Reset model when provider changes
            const models = getProviderModels(value)
            if (models.length > 0) {
              updateSetting("defaultModel", models[0].id)
            }
          }}
          options={providerOptions}
        />

        <SettingsSelect
          label="Default Model"
          description="Choose which AI model to use"
          value={settings.defaultModel}
          onValueChange={(value) => updateSetting("defaultModel", value)}
          options={modelOptions}
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
