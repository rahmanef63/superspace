"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { SettingsToggle } from "../components/SettingsToggle"

/**
 * Chats Settings
 * Temporary container for chat-related preferences until feature-specific
 * settings are fully integrated.
 */
export function ChatsSettings() {
  const [enterToSend, setEnterToSend] = useState(true)
  const [showPreviews, setShowPreviews] = useState(true)

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-foreground">Chats</h1>
        <p className="text-sm text-muted-foreground">
          Manage chat behavior and quick preferences. Additional options will appear as chat features expand.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Message Behavior</CardTitle>
          <CardDescription>Control how messages behave when composing and sending.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="enter-to-send" className="text-sm font-medium cursor-pointer">
                Press Enter to send
              </Label>
              <p className="text-sm text-muted-foreground">
                Use Shift + Enter to insert a new line while composing messages.
              </p>
            </div>
            <Switch
              id="enter-to-send"
              checked={enterToSend}
              onCheckedChange={setEnterToSend}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="show-previews" className="text-sm font-medium cursor-pointer">
                Show message previews
              </Label>
              <p className="text-sm text-muted-foreground">
                Display a short preview of incoming messages in the conversation list.
              </p>
            </div>
            <Switch
              id="show-previews"
              checked={showPreviews}
              onCheckedChange={setShowPreviews}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Typing Indicators</CardTitle>
          <CardDescription>Toggle optional typing indicators for your account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingsToggle
            id="typing-indicators"
            label="Show typing indicators"
            description="Let others know when you are typing a reply."
            checked={true}
            onChange={() => void 0}
          />
        </CardContent>
      </Card>
    </div>
  )
}
