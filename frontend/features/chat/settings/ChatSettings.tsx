"use client";

import { Bell, MessageSquare, Bot } from "lucide-react";
import { useFeatureSettings } from "@/frontend/shared/settings/hooks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";

/**
 * Chat Feature General Settings
 *
 * This component demonstrates how to create settings for a feature.
 * It auto-registers with the workspace settings when the chat feature is active.
 */
export function ChatGeneralSettings() {
  const [settings, setSettings] = useState({
    enterToSend: true,
    showTimestamps: true,
    compactMode: false,
    showAvatars: true,
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Chat Behavior</CardTitle>
          <CardDescription>
            Configure how the chat interface behaves
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="enter-send" className="text-sm font-medium cursor-pointer">
                Enter to Send
              </Label>
              <p className="text-sm text-muted-foreground">
                Press Enter to send messages (Shift+Enter for new line)
              </p>
            </div>
            <Switch
              id="enter-send"
              checked={settings.enterToSend}
              onCheckedChange={(checked) => setSettings({ ...settings, enterToSend: checked })}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="timestamps" className="text-sm font-medium cursor-pointer">
                Show Timestamps
              </Label>
              <p className="text-sm text-muted-foreground">
                Display message timestamps in chat
              </p>
            </div>
            <Switch
              id="timestamps"
              checked={settings.showTimestamps}
              onCheckedChange={(checked) => setSettings({ ...settings, showTimestamps: checked })}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="compact" className="text-sm font-medium cursor-pointer">
                Compact Mode
              </Label>
              <p className="text-sm text-muted-foreground">
                Reduce spacing between messages
              </p>
            </div>
            <Switch
              id="compact"
              checked={settings.compactMode}
              onCheckedChange={(checked) => setSettings({ ...settings, compactMode: checked })}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="avatars" className="text-sm font-medium cursor-pointer">
                Show Avatars
              </Label>
              <p className="text-sm text-muted-foreground">
                Display user avatars in chat messages
              </p>
            </div>
            <Switch
              id="avatars"
              checked={settings.showAvatars}
              onCheckedChange={(checked) => setSettings({ ...settings, showAvatars: checked })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Chat Feature Notifications Settings
 */
export function ChatNotificationsSettings() {
  const [settings, setSettings] = useState({
    desktopNotifications: true,
    soundEnabled: true,
    showPreviews: true,
    notifyMentions: true,
    notifyDMs: true,
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>
            Control how you receive chat notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="desktop-notifs" className="text-sm font-medium cursor-pointer">
                Desktop Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Show browser notifications for new messages
              </p>
            </div>
            <Switch
              id="desktop-notifs"
              checked={settings.desktopNotifications}
              onCheckedChange={(checked) => setSettings({ ...settings, desktopNotifications: checked })}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="sound" className="text-sm font-medium cursor-pointer">
                Sound Alerts
              </Label>
              <p className="text-sm text-muted-foreground">
                Play a sound when receiving messages
              </p>
            </div>
            <Switch
              id="sound"
              checked={settings.soundEnabled}
              onCheckedChange={(checked) => setSettings({ ...settings, soundEnabled: checked })}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="previews" className="text-sm font-medium cursor-pointer">
                Message Previews
              </Label>
              <p className="text-sm text-muted-foreground">
                Show message content in notifications
              </p>
            </div>
            <Switch
              id="previews"
              checked={settings.showPreviews}
              onCheckedChange={(checked) => setSettings({ ...settings, showPreviews: checked })}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="mentions" className="text-sm font-medium cursor-pointer">
                Notify on Mentions
              </Label>
              <p className="text-sm text-muted-foreground">
                Get notified when someone mentions you
              </p>
            </div>
            <Switch
              id="mentions"
              checked={settings.notifyMentions}
              onCheckedChange={(checked) => setSettings({ ...settings, notifyMentions: checked })}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="dms" className="text-sm font-medium cursor-pointer">
                Notify on Direct Messages
              </Label>
              <p className="text-sm text-muted-foreground">
                Get notified for direct messages
              </p>
            </div>
            <Switch
              id="dms"
              checked={settings.notifyDMs}
              onCheckedChange={(checked) => setSettings({ ...settings, notifyDMs: checked })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Chat Feature AI Settings
 */
export function ChatAISettings() {
  const [settings, setSettings] = useState({
    aiEnabled: true,
    autoSuggestions: true,
    smartReplies: true,
    languageCorrection: false,
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Features</CardTitle>
          <CardDescription>
            Configure AI-powered chat features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="ai-enabled" className="text-sm font-medium cursor-pointer">
                Enable AI Assistant
              </Label>
              <p className="text-sm text-muted-foreground">
                Use AI to enhance your chat experience
              </p>
            </div>
            <Switch
              id="ai-enabled"
              checked={settings.aiEnabled}
              onCheckedChange={(checked) => setSettings({ ...settings, aiEnabled: checked })}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="suggestions" className="text-sm font-medium cursor-pointer">
                Auto-Suggestions
              </Label>
              <p className="text-sm text-muted-foreground">
                Get AI-powered message suggestions as you type
              </p>
            </div>
            <Switch
              id="suggestions"
              checked={settings.autoSuggestions}
              onCheckedChange={(checked) => setSettings({ ...settings, autoSuggestions: checked })}
              disabled={!settings.aiEnabled}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="smart-replies" className="text-sm font-medium cursor-pointer">
                Smart Replies
              </Label>
              <p className="text-sm text-muted-foreground">
                Quick AI-generated responses to messages
              </p>
            </div>
            <Switch
              id="smart-replies"
              checked={settings.smartReplies}
              onCheckedChange={(checked) => setSettings({ ...settings, smartReplies: checked })}
              disabled={!settings.aiEnabled}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="language" className="text-sm font-medium cursor-pointer">
                Language Correction
              </Label>
              <p className="text-sm text-muted-foreground">
                Automatically correct grammar and spelling
              </p>
            </div>
            <Switch
              id="language"
              checked={settings.languageCorrection}
              onCheckedChange={(checked) => setSettings({ ...settings, languageCorrection: checked })}
              disabled={!settings.aiEnabled}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Auto-register chat settings with workspace settings
 *
 * This hook is called when the chat feature component mounts,
 * automatically adding chat settings to the workspace settings UI.
 */
export function useChatSettings() {
  useFeatureSettings("chat", [
    {
      id: "chat-general",
      label: "Chat",
      icon: MessageSquare,
      order: 100,
      component: ChatGeneralSettings,
    },
    {
      id: "chat-notifications",
      label: "Notifications",
      icon: Bell,
      order: 101,
      component: ChatNotificationsSettings,
    },
    {
      id: "chat-ai",
      label: "AI Features",
      icon: Bot,
      order: 102,
      component: ChatAISettings,
    },
  ]);
}
