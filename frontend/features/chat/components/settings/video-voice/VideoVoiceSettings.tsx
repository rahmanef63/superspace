"use client"

import { SettingsDropdown } from "../components/index"
import { Button } from "@/components/ui/button"
import { Play, Video, Mic, Volume2 } from "lucide-react"
import { useState } from "react"

export function VideoVoiceSettings() {
  const [videoDevice, setVideoDevice] = useState("usb2-hd-uvc-webcam")
  const [micDevice, setMicDevice] = useState("default")
  const [speakerDevice, setSpeakerDevice] = useState("default")

  const videoOptions = [
    { value: "usb2-hd-uvc-webcam", label: "USB2.0 HD UVC WebCam" },
    { value: "integrated-webcam", label: "Integrated Webcam" },
  ]

  const audioOptions = [
    { value: "default", label: "Default Device" },
    { value: "headphones", label: "Headphones" },
    { value: "speakers", label: "Speakers" },
  ]

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold text-foreground mb-6">Video & voice</h1>

      <div className="space-y-6">
        {/* Video Section */}
        <section>
          <h2 className="text-lg font-medium text-foreground mb-4">Video</h2>
          <div className="bg-card rounded-lg border p-4 space-y-4">
            <div className="flex items-center gap-3">
              <Video className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <SettingsDropdown
                id="video-device"
                value={videoDevice}
                onValueChange={setVideoDevice}
                options={videoOptions}
                className="flex-1"
              />
            </div>

            {/* Video Preview */}
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center border">
              <div className="text-center">
                <Video className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Camera preview</p>
              </div>
            </div>
          </div>
        </section>

        {/* Microphone Section */}
        <section>
          <h2 className="text-lg font-medium text-foreground mb-4">Microphone</h2>
          <div className="bg-card rounded-lg border p-4 space-y-4">
            <div className="flex items-center gap-3">
              <Mic className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <SettingsDropdown
                id="mic-device"
                value={micDevice}
                onValueChange={setMicDevice}
                options={audioOptions}
                className="flex-1"
              />
            </div>

            <div>
              <h3 className="text-sm font-medium text-card-foreground mb-2">Test</h3>
              <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
                <Play className="h-4 w-4" />
                Record from your mic
              </Button>
            </div>
          </div>
        </section>

        {/* Speakers Section */}
        <section>
          <h2 className="text-lg font-medium text-foreground mb-4">Speakers</h2>
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <Volume2 className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <SettingsDropdown
                id="speaker-device"
                value={speakerDevice}
                onValueChange={setSpeakerDevice}
                options={audioOptions}
                className="flex-1"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
