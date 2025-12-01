"use client";

import { Phone, Video, Mic, Speaker, PhoneCall, Circle } from "lucide-react";
import { useFeatureSettings } from "@/frontend/shared/settings";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCallsSettingsStorage } from "./useCallsSettings";
import {
  SettingsSection,
  SettingsToggle,
  SettingsSelect,
  SettingsSlider,
} from "@/frontend/shared/settings/primitives";

/**
 * Calls Quality Settings - Audio/Video quality controls
 */
export function CallsQualitySettings() {
  const { settings, updateSetting, resetSettings, isLoaded } = useCallsSettingsStorage();

  if (!isLoaded) {
    return <div className="p-4 text-center text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Call Quality</CardTitle>
              <CardDescription>
                Configure audio and video quality settings
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={resetSettings}>
              Reset
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingsSelect
            id="video-quality"
            label="Video Quality"
            description="Higher quality requires more bandwidth"
            value={settings.videoQuality}
            onValueChange={(v) => updateSetting("videoQuality", v as "auto" | "high" | "medium" | "low")}
            options={[
              { value: "auto", label: "Auto (Recommended)" },
              { value: "high", label: "High (720p)" },
              { value: "medium", label: "Medium (480p)" },
              { value: "low", label: "Low (360p)" },
            ]}
          />

          <SettingsSelect
            id="audio-quality"
            label="Audio Quality"
            description="High quality audio for clearer conversations"
            value={settings.audioQuality}
            onValueChange={(v) => updateSetting("audioQuality", v as "high" | "medium" | "low")}
            options={[
              { value: "high", label: "High (HD Voice)" },
              { value: "medium", label: "Medium" },
              { value: "low", label: "Low (Save Data)" },
            ]}
          />

          <Separator />

          <SettingsSection title="Audio Processing" description="Improve call audio quality">
            <SettingsToggle
              id="noise-suppression"
              label="Noise Suppression"
              description="Reduce background noise during calls"
              checked={settings.noiseSuppression}
              onCheckedChange={(v) => updateSetting("noiseSuppression", v)}
            />

            <SettingsToggle
              id="echo-cancellation"
              label="Echo Cancellation"
              description="Eliminate echo and feedback"
              checked={settings.echoCancellation}
              onCheckedChange={(v) => updateSetting("echoCancellation", v)}
            />

            <SettingsToggle
              id="auto-adjust"
              label="Auto-Adjust Quality"
              description="Automatically adjust quality based on connection"
              checked={settings.autoAdjustQuality}
              onCheckedChange={(v) => updateSetting("autoAdjustQuality", v)}
            />
          </SettingsSection>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Calls Device Settings - Input/Output device selection
 */
export function CallsDeviceSettings() {
  const { settings, updateSetting, isLoaded } = useCallsSettingsStorage();

  if (!isLoaded) {
    return <div className="p-4 text-center text-muted-foreground">Loading...</div>;
  }

  // In a real implementation, these would be populated from navigator.mediaDevices.enumerateDevices()
  const microphoneOptions = [
    { value: "default", label: "Default Microphone" },
    { value: "built-in", label: "Built-in Microphone" },
    { value: "headset", label: "Headset Microphone" },
  ];

  const speakerOptions = [
    { value: "default", label: "Default Speaker" },
    { value: "built-in", label: "Built-in Speaker" },
    { value: "headset", label: "Headset" },
  ];

  const cameraOptions = [
    { value: "default", label: "Default Camera" },
    { value: "built-in", label: "Built-in Camera" },
    { value: "external", label: "External Camera" },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Audio & Video Devices</CardTitle>
          <CardDescription>
            Select your preferred devices for calls
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingsSelect
            id="microphone"
            label="Microphone"
            description="Select your preferred microphone"
            value={settings.defaultMicrophone}
            onValueChange={(v) => updateSetting("defaultMicrophone", v)}
            options={microphoneOptions}
          />

          <SettingsSelect
            id="speaker"
            label="Speaker"
            description="Select your preferred speaker"
            value={settings.defaultSpeaker}
            onValueChange={(v) => updateSetting("defaultSpeaker", v)}
            options={speakerOptions}
          />

          <SettingsSelect
            id="camera"
            label="Camera"
            description="Select your preferred camera"
            value={settings.defaultCamera}
            onValueChange={(v) => updateSetting("defaultCamera", v)}
            options={cameraOptions}
          />
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Calls Behavior Settings - Call handling preferences
 */
export function CallsBehaviorSettings() {
  const { settings, updateSetting, isLoaded } = useCallsSettingsStorage();

  if (!isLoaded) {
    return <div className="p-4 text-center text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Call Behavior</CardTitle>
          <CardDescription>
            Configure how calls are handled
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingsToggle
            id="auto-answer"
            label="Auto-Answer Calls"
            description="Automatically answer incoming calls"
            checked={settings.autoAnswerCalls}
            onCheckedChange={(v) => updateSetting("autoAnswerCalls", v)}
          />

          <SettingsToggle
            id="answer-video"
            label="Answer with Video"
            description="Start video when answering calls"
            checked={settings.answerWithVideo}
            onCheckedChange={(v) => updateSetting("answerWithVideo", v)}
          />

          <SettingsToggle
            id="call-waiting"
            label="Call Waiting"
            description="Allow incoming calls while on another call"
            checked={settings.callWaiting}
            onCheckedChange={(v) => updateSetting("callWaiting", v)}
          />

          <Separator />

          <SettingsSelect
            id="ringtone"
            label="Ringtone"
            description="Choose your ringtone"
            value={settings.ringtone}
            onValueChange={(v) => updateSetting("ringtone", v as "default" | "classic" | "digital" | "silent")}
            options={[
              { value: "default", label: "Default" },
              { value: "classic", label: "Classic" },
              { value: "digital", label: "Digital" },
              { value: "silent", label: "Silent" },
            ]}
          />

          <SettingsSlider
            id="ring-duration"
            label="Ring Duration"
            description="How long to ring before declining"
            value={settings.ringDuration}
            onValueChange={(v) => updateSetting("ringDuration", v[0])}
            min={10}
            max={60}
            step={5}
            valueFormatter={(v) => `${v}s`}
          />
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Calls Recording Settings
 */
export function CallsRecordingSettings() {
  const { settings, updateSetting, isLoaded } = useCallsSettingsStorage();

  if (!isLoaded) {
    return <div className="p-4 text-center text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Recording</CardTitle>
          <CardDescription>
            Configure call recording options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingsToggle
            id="allow-recording"
            label="Allow Recording"
            description="Enable call recording feature"
            checked={settings.allowRecording}
            onCheckedChange={(v) => updateSetting("allowRecording", v)}
          />

          <SettingsSelect
            id="recording-quality"
            label="Recording Quality"
            description="Quality of recorded calls"
            value={settings.recordingQuality}
            onValueChange={(v) => updateSetting("recordingQuality", v as "high" | "medium" | "low")}
            options={[
              { value: "high", label: "High" },
              { value: "medium", label: "Medium" },
              { value: "low", label: "Low (smaller files)" },
            ]}
            disabled={!settings.allowRecording}
          />

          <SettingsToggle
            id="auto-save"
            label="Auto-Save Recordings"
            description="Automatically save call recordings"
            checked={settings.autoSaveRecordings}
            onCheckedChange={(v) => updateSetting("autoSaveRecordings", v)}
            disabled={!settings.allowRecording}
          />

          <Separator />

          <SettingsSection title="Bandwidth" description="Data usage settings">
            <SettingsToggle
              id="data-saver"
              label="Data Saver Mode"
              description="Reduce data usage during calls"
              checked={settings.dataSaverMode}
              onCheckedChange={(v) => updateSetting("dataSaverMode", v)}
            />

            <SettingsToggle
              id="limit-mobile"
              label="Limit Video on Mobile"
              description="Reduce video quality when on mobile data"
              checked={settings.limitVideoOnMobile}
              onCheckedChange={(v) => updateSetting("limitVideoOnMobile", v)}
            />
          </SettingsSection>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Auto-register calls settings with workspace settings
 */
export function useCallsSettings() {
  useFeatureSettings("calls", [
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
    {
      id: "calls-behavior",
      label: "Behavior",
      icon: PhoneCall,
      order: 202,
      component: CallsBehaviorSettings,
    },
    {
      id: "calls-recording",
      label: "Recording",
      icon: Circle,
      order: 203,
      component: CallsRecordingSettings,
    },
  ]);
}
