"use client"

import { SettingsDropdown, SettingsToggle } from "../components/index"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { cn } from "@/lib/utils"

export function PersonalizationSettings() {
  const [appTheme, setAppTheme] = useState("system-default")
  const [selectedWallpaper, setSelectedWallpaper] = useState("default")
  const [whatsappDoodle, setWhatsappDoodle] = useState(true)
  const [textSize, setTextSize] = useState("90")

  const themeOptions = [
    { value: "system-default", label: "System default" },
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
  ]

  const textSizeOptions = [
    { value: "75", label: "75%" },
    { value: "90", label: "90%" },
    { value: "100", label: "100%" },
    { value: "110", label: "110%" },
    { value: "125", label: "125%" },
  ]

  const wallpapers = [
    { id: "default", color: "bg-gradient-to-br from-primary/80 to-primary" },
    { id: "gray", color: "bg-gradient-to-br from-slate-600 to-slate-800" },
    { id: "green", color: "bg-gradient-to-br from-green-600 to-green-800" },
    { id: "teal", color: "bg-gradient-to-br from-teal-600 to-teal-800" },
    { id: "slate", color: "bg-gradient-to-br from-slate-500 to-slate-700" },
    { id: "rose", color: "bg-gradient-to-br from-rose-600 to-rose-800" },
    { id: "red", color: "bg-gradient-to-br from-red-600 to-red-800" },
    { id: "brown", color: "bg-gradient-to-br from-amber-700 to-amber-900" },
    { id: "yellow", color: "bg-gradient-to-br from-yellow-600 to-yellow-800" },
    { id: "olive", color: "bg-gradient-to-br from-lime-700 to-lime-900" },
    { id: "forest", color: "bg-gradient-to-br from-emerald-700 to-emerald-900" },
    { id: "ocean", color: "bg-gradient-to-br from-blue-600 to-blue-800" },
    { id: "sky", color: "bg-gradient-to-br from-sky-600 to-sky-800" },
    { id: "purple", color: "bg-gradient-to-br from-purple-600 to-purple-800" },
    { id: "rainbow", color: "bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500" },
  ]

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold text-foreground mb-6">Personalization</h1>

      <div className="space-y-6">
        {/* Theme Section */}
        <section>
          <h2 className="text-lg font-medium text-foreground mb-4">Theme</h2>
          <div className="bg-card rounded-lg border p-4">
            <SettingsDropdown
              id="app-theme"
              label="App color theme"
              value={appTheme}
              onValueChange={setAppTheme}
              options={themeOptions}
            />
          </div>
        </section>

        {/* Chat Wallpaper Section */}
        <section>
          <h2 className="text-lg font-medium text-foreground mb-4">Chat wallpaper</h2>
          <div className="bg-card rounded-lg border p-4">
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-4">
              {wallpapers.map((wallpaper) => (
                <button
                  key={wallpaper.id}
                  onClick={() => setSelectedWallpaper(wallpaper.id)}
                  className={cn(
                    "aspect-square rounded-lg transition-all",
                    wallpaper.color,
                    selectedWallpaper === wallpaper.id ? "ring-2 ring-primary scale-95" : "hover:scale-95",
                  )}
                />
              ))}
            </div>

            <SettingsToggle
              id="whatsapp-doodle"
              label="WhatsApp doodle"
              checked={whatsappDoodle}
              onChange={setWhatsappDoodle}
            />

            <Button variant="outline" className="w-full mt-4 bg-transparent">
              Reset
            </Button>
          </div>
        </section>

        {/* Text Size Section */}
        <section>
          <h2 className="text-lg font-medium text-foreground mb-4">Text size</h2>
          <div className="bg-card rounded-lg border p-4">
            <SettingsDropdown id="text-size" value={textSize} onValueChange={setTextSize} options={textSizeOptions} />
          </div>
        </section>
      </div>
    </div>
  )
}
