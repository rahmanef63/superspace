"use client";

import { Phone, Video, Mic, Speaker } from "lucide-react";
import { useFeatureSettings } from "@/frontend/shared/settings/hooks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";

/**
 * Calls Feature Settings
 *
 * Proof-of-concept showing how a feature can have its own settings
 * that auto-register with workspace settings.
 *
 * This demonstrates:
 * - Settings icon integration
 * - Multiple settings categories for one feature
 * - Conditional settings based on feature state
 */
export function CallsQualitySettings() {
  const [settings, setSettings] = useState({
    videoQuality: "auto",
    audioQuality: "high",
    noiseSuppression: true,
    echoCancellation: true,
    autoAdjustQuality: true,
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Call Quality</CardTitle>
          <CardDescription>
            Configure audio and video quality settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="video-quality" className="text-sm font-medium">
              Video Quality
            </Label>
            <Select
              value={settings.videoQuality}
              onValueChange={(value) => setSettings({ ...settings, videoQuality: value })}
            >
              <SelectTrigger id="video-quality" className="max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto (Recommended)</SelectItem>
                <SelectItem value="high">High (720p)</SelectItem>
                <SelectItem value="medium">Medium (480p)</SelectItem>
                <SelectItem value="low">Low (360p)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Higher quality requires more bandwidth
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="audio-quality" className="text-sm font-medium">
              Audio Quality
            </Label>
            <Select
              value={settings.audioQuality}
              onValueChange={(value) => setSettings({ ...settings, audioQuality: value })}
            >
              <SelectTrigger id="audio-quality" className="max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High (HD Voice)</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low (Save Data)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              High quality audio for clearer conversations
            </p>
          </div>

          <Separator />

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="noise" className="text-sm font-medium cursor-pointer">
                Noise Suppression
              </Label>
              <p className="text-sm text-muted-foreground">
                Reduce background noise during calls
              </p>
            </div>
            <Switch
              id="noise"
              checked={settings.noiseSuppression}
              onCheckedChange={(checked) => setSettings({ ...settings, noiseSuppression: checked })}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="echo" className="text-sm font-medium cursor-pointer">
                Echo Cancellation
              </Label>
              <p className="text-sm text-muted-foreground">
                Eliminate echo and feedback
              </p>
            </div>
            <Switch
              id="echo"
              checked={settings.echoCancellation}
              onCheckedChange={(checked) => setSettings({ ...settings, echoCancellation: checked })}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="auto-adjust" className="text-sm font-medium cursor-pointer">
                Auto-Adjust Quality
              </Label>
              <p className="text-sm text-muted-foreground">
                Automatically adjust quality based on connection
              </p>
            </div>
            <Switch
              id="auto-adjust"
              checked={settings.autoAdjustQuality}
              onCheckedChange={(checked) => setSettings({ ...settings, autoAdjustQuality: checked })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Calls Device Settings
 */
export function CallsDeviceSettings() {
  const [settings, setSettings] = useState({
    defaultMicrophone: "default",
    defaultSpeaker: "default",
    defaultCamera: "default",
    testInProgress: false,
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Audio & Video Devices</CardTitle>
          <CardDescription>
            Select your preferred devices for calls
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="microphone" className="text-sm font-medium flex items-center gap-2">
              <Mic className="w-4 h-4" />
              Microphone
            </Label>
            <Select
              value={settings.defaultMicrophone}
              onValueChange={(value) => setSettings({ ...settings, defaultMicrophone: value })}
            >
              <SelectTrigger id="microphone">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default Microphone</SelectItem>
                <SelectItem value="built-in">Built-in Microphone</SelectItem>
                <SelectItem value="headset">Headset Microphone</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="speaker" className="text-sm font-medium flex items-center gap-2">
              <Speaker className="w-4 h-4" />
              Speaker
            </Label>
            <Select
              value={settings.defaultSpeaker}
              onValueChange={(value) => setSettings({ ...settings, defaultSpeaker: value })}
            >
              <SelectTrigger id="speaker">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default Speaker</SelectItem>
                <SelectItem value="built-in">Built-in Speaker</SelectItem>
                <SelectItem value="headset">Headset</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="camera" className="text-sm font-medium flex items-center gap-2">
              <Video className="w-4 h-4" />
              Camera
            </Label>
            <Select
              value={settings.defaultCamera}
              onValueChange={(value) => setSettings({ ...settings, defaultCamera: value })}
            >
              <SelectTrigger id="camera">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default Camera</SelectItem>
                <SelectItem value="built-in">Built-in Camera</SelectItem>
                <SelectItem value="external">External Camera</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Auto-register calls settings with workspace settings
 *
 * This is the key hook that makes the magic happen!
 * When this is called, the calls settings automatically appear in workspace settings.
 */
export function useCallsSettings() {
  useFeatureSettings("wa-calls", [
    {
      id: "calls-quality",
      label: "Call Quality",
      icon: Phone,
      order: 200,
      component: CallsQualitySettings,
    },
    {
      id: "calls-devices",
      label: "Devices",
      icon: Mic,
      order: 201,
      component: CallsDeviceSettings,
    },
  ]);
}
