"use client";

import { Bell, MessageSquare, Bot, Shield, Image as ImageIcon } from "lucide-react";
import { useFeatureSettings } from "@/frontend/shared/settings";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useChatSettingsStorage } from "./useChatSettings";
import {
  SettingsSection,
  SettingsToggle,
  SettingsSelect,
  SettingsSlider,
  SettingsRadioGroup,
} from "@/frontend/shared/settings/primitives";

/**
 * Chat Feature General Settings
 * Persisted to localStorage via useChatSettingsStorage
 */
export function ChatGeneralSettings() {
  const { settings, updateSetting, resetSettings, isLoaded } = useChatSettingsStorage();

  if (!isLoaded) {
    return <div className="p-4 text-center text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Chat Behavior</CardTitle>
              <CardDescription>
                Configure how the chat interface behaves
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={resetSettings}>
              Reset
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingsToggle
            id="enter-send"
            label="Enter to Send"
            description="Press Enter to send messages (Shift+Enter for new line)"
            checked={settings.enterToSend}
            onCheckedChange={(v) => updateSetting("enterToSend", v)}
          />

          <SettingsToggle
            id="timestamps"
            label="Show Timestamps"
            description="Display message timestamps in chat"
            checked={settings.showTimestamps}
            onCheckedChange={(v) => updateSetting("showTimestamps", v)}
          />

          <SettingsToggle
            id="compact"
            label="Compact Mode"
            description="Reduce spacing between messages"
            checked={settings.compactMode}
            onCheckedChange={(v) => updateSetting("compactMode", v)}
          />

          <SettingsToggle
            id="avatars"
            label="Show Avatars"
            description="Display user avatars in chat messages"
            checked={settings.showAvatars}
            onCheckedChange={(v) => updateSetting("showAvatars", v)}
          />

          <SettingsSlider
            id="grouping"
            label="Message Grouping"
            description="Group messages sent within this time interval"
            value={settings.messageGroupingInterval}
            onValueChange={(v) => updateSetting("messageGroupingInterval", v[0])}
            min={0}
            max={300}
            step={30}
            valueFormatter={(v) => v === 0 ? "Off" : `${v}s`}
          />
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Chat Feature Notifications Settings
 */
export function ChatNotificationsSettings() {
  const { settings, updateSetting, isLoaded } = useChatSettingsStorage();

  if (!isLoaded) {
    return <div className="p-4 text-center text-muted-foreground">Loading...</div>;
  }

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
          <SettingsToggle
            id="desktop-notifs"
            label="Desktop Notifications"
            description="Show browser notifications for new messages"
            checked={settings.desktopNotifications}
            onCheckedChange={(v) => updateSetting("desktopNotifications", v)}
          />

          <SettingsToggle
            id="sound"
            label="Sound Alerts"
            description="Play a sound when receiving messages"
            checked={settings.soundEnabled}
            onCheckedChange={(v) => updateSetting("soundEnabled", v)}
          />

          <SettingsSelect
            id="notification-sound"
            label="Notification Sound"
            description="Choose your notification sound"
            value={settings.notificationSound}
            onValueChange={(v) => updateSetting("notificationSound", v as "default" | "subtle" | "none")}
            options={[
              { value: "default", label: "Default" },
              { value: "subtle", label: "Subtle" },
              { value: "none", label: "None" },
            ]}
            disabled={!settings.soundEnabled}
          />

          <SettingsToggle
            id="previews"
            label="Message Previews"
            description="Show message content in notifications"
            checked={settings.showPreviews}
            onCheckedChange={(v) => updateSetting("showPreviews", v)}
          />

          <Separator />

          <SettingsSection title="Notification Triggers" description="Choose what triggers notifications">
            <SettingsToggle
              id="mentions"
              label="Notify on Mentions"
              description="Get notified when someone mentions you"
              checked={settings.notifyMentions}
              onCheckedChange={(v) => updateSetting("notifyMentions", v)}
            />

            <SettingsToggle
              id="dms"
              label="Notify on Direct Messages"
              description="Get notified for direct messages"
              checked={settings.notifyDMs}
              onCheckedChange={(v) => updateSetting("notifyDMs", v)}
            />
          </SettingsSection>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Chat Feature Privacy Settings
 */
export function ChatPrivacySettings() {
  const { settings, updateSetting, isLoaded } = useChatSettingsStorage();

  if (!isLoaded) {
    return <div className="p-4 text-center text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Privacy Settings</CardTitle>
          <CardDescription>
            Control your privacy in conversations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingsToggle
            id="read-receipts"
            label="Read Receipts"
            description="Let others know when you've read their messages"
            checked={settings.readReceipts}
            onCheckedChange={(v) => updateSetting("readReceipts", v)}
          />

          <SettingsToggle
            id="typing-indicator"
            label="Typing Indicator"
            description="Show when you're typing a message"
            checked={settings.typingIndicator}
            onCheckedChange={(v) => updateSetting("typingIndicator", v)}
          />

          <Separator />

          <SettingsRadioGroup
            id="online-status"
            label="Online Status Visibility"
            description="Who can see when you're online"
            value={settings.onlineStatus}
            onValueChange={(v) => updateSetting("onlineStatus", v as "everyone" | "contacts" | "nobody")}
            options={[
              { value: "everyone", label: "Everyone" },
              { value: "contacts", label: "My Contacts Only" },
              { value: "nobody", label: "Nobody" },
            ]}
          />

          <SettingsRadioGroup
            id="last-seen"
            label="Last Seen Visibility"
            description="Who can see your last active time"
            value={settings.lastSeen}
            onValueChange={(v) => updateSetting("lastSeen", v as "everyone" | "contacts" | "nobody")}
            options={[
              { value: "everyone", label: "Everyone" },
              { value: "contacts", label: "My Contacts Only" },
              { value: "nobody", label: "Nobody" },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Chat Feature AI Settings
 */
export function ChatAISettings() {
  const { settings, updateSetting, isLoaded } = useChatSettingsStorage();

  if (!isLoaded) {
    return <div className="p-4 text-center text-muted-foreground">Loading...</div>;
  }

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
          <SettingsToggle
            id="ai-enabled"
            label="Enable AI Assistant"
            description="Use AI to enhance your chat experience"
            checked={settings.aiEnabled}
            onCheckedChange={(v) => updateSetting("aiEnabled", v)}
          />

          <Separator />

          <SettingsSection title="AI Features" description="These require AI to be enabled">
            <SettingsToggle
              id="suggestions"
              label="Auto-Suggestions"
              description="Get AI-powered message suggestions as you type"
              checked={settings.autoSuggestions}
              onCheckedChange={(v) => updateSetting("autoSuggestions", v)}
              disabled={!settings.aiEnabled}
            />

            <SettingsToggle
              id="smart-replies"
              label="Smart Replies"
              description="Quick AI-generated responses to messages"
              checked={settings.smartReplies}
              onCheckedChange={(v) => updateSetting("smartReplies", v)}
              disabled={!settings.aiEnabled}
            />

            <SettingsToggle
              id="language"
              label="Language Correction"
              description="Automatically correct grammar and spelling"
              checked={settings.languageCorrection}
              onCheckedChange={(v) => updateSetting("languageCorrection", v)}
              disabled={!settings.aiEnabled}
            />
          </SettingsSection>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Chat Feature Media Settings
 */
export function ChatMediaSettings() {
  const { settings, updateSetting, isLoaded } = useChatSettingsStorage();

  if (!isLoaded) {
    return <div className="p-4 text-center text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Media & Downloads</CardTitle>
          <CardDescription>
            Configure how media is handled in chats
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingsSection title="Auto-Download" description="Automatically download media when received">
            <SettingsToggle
              id="auto-images"
              label="Images"
              description="Automatically download images"
              checked={settings.autoDownloadImages}
              onCheckedChange={(v) => updateSetting("autoDownloadImages", v)}
            />

            <SettingsToggle
              id="auto-videos"
              label="Videos"
              description="Automatically download videos"
              checked={settings.autoDownloadVideos}
              onCheckedChange={(v) => updateSetting("autoDownloadVideos", v)}
            />

            <SettingsToggle
              id="auto-docs"
              label="Documents"
              description="Automatically download documents"
              checked={settings.autoDownloadDocuments}
              onCheckedChange={(v) => updateSetting("autoDownloadDocuments", v)}
            />
          </SettingsSection>

          <Separator />

          <SettingsSelect
            id="image-quality"
            label="Image Quality"
            description="Quality of uploaded images"
            value={settings.imageQuality}
            onValueChange={(v) => updateSetting("imageQuality", v as "original" | "high" | "medium" | "low")}
            options={[
              { value: "original", label: "Original" },
              { value: "high", label: "High" },
              { value: "medium", label: "Medium" },
              { value: "low", label: "Low (saves data)" },
            ]}
          />

          <SettingsToggle
            id="link-previews"
            label="Link Previews"
            description="Show previews for shared links"
            checked={settings.linkPreviews}
            onCheckedChange={(v) => updateSetting("linkPreviews", v)}
          />
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Auto-register chat settings with workspace settings
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
      id: "chat-privacy",
      label: "Privacy",
      icon: Shield,
      order: 102,
      component: ChatPrivacySettings,
    },
    {
      id: "chat-ai",
      label: "AI Features",
      icon: Bot,
      order: 103,
      component: ChatAISettings,
    },
    {
      id: "chat-media",
      label: "Media",
      icon: ImageIcon,
      order: 104,
      component: ChatMediaSettings,
    },
  ]);
}

/**
 * Default Chat Settings Component
 */
export const ChatSettings = ChatGeneralSettings;
