"use client"

import { SettingsToggle } from "../components/SettingsToggle"
import { ImageIcon, Music, Video, FileText } from "lucide-react"
import { useState } from "react"

export function StorageSettings() {
  const [autoDownloadPhotos, setAutoDownloadPhotos] = useState(true)
  const [autoDownloadAudio, setAutoDownloadAudio] = useState(true)
  const [autoDownloadVideos, setAutoDownloadVideos] = useState(true)
  const [autoDownloadDocuments, setAutoDownloadDocuments] = useState(true)

  const mediaTypes = [
    {
      icon: ImageIcon,
      label: "Photos",
      checked: autoDownloadPhotos,
      onChange: setAutoDownloadPhotos,
    },
    {
      icon: Music,
      label: "Audio",
      checked: autoDownloadAudio,
      onChange: setAutoDownloadAudio,
    },
    {
      icon: Video,
      label: "Videos",
      checked: autoDownloadVideos,
      onChange: setAutoDownloadVideos,
    },
    {
      icon: FileText,
      label: "Documents",
      checked: autoDownloadDocuments,
      onChange: setAutoDownloadDocuments,
    },
  ]

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold text-foreground mb-6">Storage</h1>

      <div className="space-y-6">
        {/* Automatic Downloads Section */}
        <section>
          <h2 className="text-lg font-medium text-foreground mb-4">Automatic downloads</h2>
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
            Choose which media will be automatically downloaded from the messages you receive
          </p>

          <div className="bg-card rounded-lg border divide-y">
            {mediaTypes.map((mediaType) => (
              <div key={mediaType.label} className="p-4">
                <div className="flex items-center gap-3">
                  <mediaType.icon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1">
                    <SettingsToggle
                      id={`auto-download-${mediaType.label.toLowerCase()}`}
                      label={mediaType.label}
                      checked={mediaType.checked}
                      onChange={mediaType.onChange}
                      className="py-0"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
