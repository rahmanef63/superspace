"use client"

import { Button } from "@/components/ui/button"
import { SettingsToggle } from "../components/SettingsToggle"
import { SettingsDropdown } from "../components/SettingsDropdown"
import { useState } from "react"

export function GeneralSettings() {
  const [startAtLogin, setStartAtLogin] = useState(false)
  const [language, setLanguage] = useState("system-default")
  const [replaceTextWithEmoji, setReplaceTextWithEmoji] = useState(true)

  const languageOptions = [
    { value: "system-default", label: "System default" },
    { value: "en", label: "English" },
    { value: "id", label: "Bahasa Indonesia" },
    { value: "es", label: "Español" },
    { value: "fr", label: "Français" },
    { value: "de", label: "Deutsch" },
  ]

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold text-foreground mb-6">General</h1>

      <div className="space-y-6">
        {/* Login Section */}
        <section>
          <h2 className="text-lg font-medium text-foreground mb-4">Login</h2>
          <div className="bg-card rounded-lg border p-4">
            <SettingsToggle
              id="start-at-login"
              label="Start Chats at login"
              checked={startAtLogin}
              onChange={setStartAtLogin}
            />
          </div>
        </section>

        {/* Language Section */}
        <section>
          <h2 className="text-lg font-medium text-foreground mb-4">Language</h2>
          <div className="bg-card rounded-lg border p-4">
            <SettingsDropdown
              id="language"
              label="App language"
              value={language}
              onValueChange={setLanguage}
              options={languageOptions}
            />
          </div>
        </section>

        {/* Typing Section */}
        <section>
          <h2 className="text-lg font-medium text-foreground mb-4">Typing</h2>
          <div className="bg-card rounded-lg border p-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              Change typing settings for <strong>autocorrect</strong> and <strong>misspelled highlight</strong> from{" "}
              <Button variant="link" className="p-0 h-auto text-primary text-sm">
                Windows Settings
              </Button>
              .
            </p>

            <SettingsToggle
              id="replace-emoji"
              label="Replace text with emoji"
              description="Emoji will replace specific text as you type."
              checked={replaceTextWithEmoji}
              onChange={setReplaceTextWithEmoji}
            />

            <Button variant="link" className="p-0 h-auto text-primary text-sm">
              See list of text
            </Button>
          </div>
        </section>

        {/* Logout Section */}
        <section className="pt-6 border-t">
          <p className="text-sm text-muted-foreground">
            To <strong>log out</strong> of Chats on this computer go to your{" "}
            <Button variant="link" className="p-0 h-auto text-primary text-sm">
              Profile
            </Button>
            .
          </p>
        </section>
      </div>
    </div>
  )
}
