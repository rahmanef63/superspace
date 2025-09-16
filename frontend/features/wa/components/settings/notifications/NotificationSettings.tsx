"use client"

import { SettingsToggle, SettingsDropdown } from "../components/index"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { AlertCircle, Play } from "lucide-react"

export function NotificationSettings() {
  const [messages, setMessages] = useState(true)
  const [calls, setCalls] = useState(true)
  const [reactions, setReactions] = useState(true)
  const [statusReactions, setStatusReactions] = useState(true)
  const [textPreview, setTextPreview] = useState(true)
  const [mediaPreview, setMediaPreview] = useState(false)
  const [bannerNotifications, setBannerNotifications] = useState("always")
  const [taskbarBadge, setTaskbarBadge] = useState("always")
  const [messageSound, setMessageSound] = useState("default")
  const [groupSound, setGroupSound] = useState("default")

  const bannerOptions = [
    { value: "always", label: "Always" },
    { value: "when-app-closed", label: "When app is closed" },
    { value: "never", label: "Never" },
  ]

  const soundOptions = [
    { value: "default", label: "Default" },
    { value: "none", label: "None" },
    { value: "pop", label: "Pop" },
    { value: "ding", label: "Ding" },
  ]

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold text-foreground mb-6">Notifications</h1>

      {/* Windows Settings Alert */}
      <div className="flex items-start gap-3 p-4 bg-card rounded-lg mb-6 border border-primary/20">
        <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
        <div className="min-w-0 flex-1">
          <h3 className="font-medium text-foreground mb-1">Windows Settings</h3>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Notifications are turned off in Windows Settings. Turn on notifications at system level.
          </p>
          <Button variant="link" className="p-0 h-auto text-primary text-sm">
            Windows Settings: Notifications
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Basic Notifications */}
        <section>
          <div className="bg-card rounded-lg border p-4 space-y-4">
            <SettingsToggle id="messages" label="Messages" checked={messages} onChange={setMessages} />

            <SettingsToggle id="calls" label="Calls" checked={calls} onChange={setCalls} />

            <SettingsToggle
              id="reactions"
              label="Reactions"
              description="Show notifications for reactions to messages you send"
              checked={reactions}
              onChange={setReactions}
            />

            <SettingsToggle
              id="status-reactions"
              label="Status reactions"
              description="Show notifications when you get likes on a status"
              checked={statusReactions}
              onChange={setStatusReactions}
            />
          </div>
        </section>

        {/* Preview Settings */}
        <section>
          <div className="bg-card rounded-lg border p-4 space-y-4">
            <SettingsToggle
              id="text-preview"
              label="Text preview"
              description="Show message preview text inside new message notifications"
              checked={textPreview}
              onChange={setTextPreview}
            />

            <SettingsToggle
              id="media-preview"
              label="Media preview"
              description="Show media preview images inside new message notifications"
              checked={mediaPreview}
              onChange={setMediaPreview}
            />
          </div>
        </section>

        {/* Display Settings */}
        <section>
          <div className="bg-card rounded-lg border p-4 space-y-4">
            <SettingsDropdown
              id="banner-notifications"
              label="Show banner notifications"
              value={bannerNotifications}
              onValueChange={setBannerNotifications}
              options={bannerOptions}
            />

            <SettingsDropdown
              id="taskbar-badge"
              label="Show taskbar notification badge"
              value={taskbarBadge}
              onValueChange={setTaskbarBadge}
              options={bannerOptions}
            />
          </div>
        </section>

        {/* Notification Tones */}
        <section>
          <h2 className="text-lg font-medium text-foreground mb-4">Notification tones</h2>
          <div className="bg-card rounded-lg border p-4 space-y-4">
            <div>
              <SettingsDropdown
                id="message-sound"
                label="Messages"
                value={messageSound}
                onValueChange={setMessageSound}
                options={soundOptions}
              />
              <Button variant="ghost" size="sm" className="mt-2 text-primary hover:text-primary/90">
                <Play className="h-4 w-4 mr-2" />
                Test sound
              </Button>
            </div>

            <div>
              <SettingsDropdown
                id="group-sound"
                label="Groups"
                value={groupSound}
                onValueChange={setGroupSound}
                options={soundOptions}
              />
              <Button variant="ghost" size="sm" className="mt-2 text-primary hover:text-primary/90">
                <Play className="h-4 w-4 mr-2" />
                Test sound
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
