"use client"

import { useTheme } from "next-themes"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SettingsToggle, SettingsSelect, SettingsRadioGroup } from "../primitives"

/**
 * Personalization Settings - UI customization
 * Uses next-themes for theme management
 */
export function PersonalizationSettings() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Theme</CardTitle>
          <CardDescription>
            Customize the look and feel
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingsRadioGroup
            id="color-scheme"
            label="Color Scheme"
            description="Choose your preferred color scheme"
            value={theme || "system"}
            onValueChange={(value) => setTheme(value)}
            options={[
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" },
              { value: "system", label: "System" },
            ]}
          />
          
          <SettingsSelect
            label="Accent Color"
            description="Primary accent color"
            value="blue"
            onValueChange={() => {}}
            options={[
              { value: "blue", label: "Blue" },
              { value: "green", label: "Green" },
              { value: "purple", label: "Purple" },
              { value: "orange", label: "Orange" },
            ]}
            disabled
          />
          <p className="text-xs text-muted-foreground px-3">
            Accent color customization coming soon
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Layout</CardTitle>
          <CardDescription>
            Configure the app layout
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingsToggle
            label="Compact Mode"
            description="Reduce spacing for more content"
            checked={false}
            onCheckedChange={() => {}}
            disabled
          />
          
          <SettingsToggle
            label="Show Sidebar"
            description="Display sidebar navigation"
            checked={true}
            onCheckedChange={() => {}}
            disabled
          />
          
          <SettingsSelect
            label="Sidebar Position"
            description="Position of the sidebar"
            value="left"
            onValueChange={() => {}}
            options={[
              { value: "left", label: "Left" },
              { value: "right", label: "Right" },
            ]}
            disabled
          />
          <p className="text-xs text-muted-foreground px-3">
            Layout customization coming soon
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
