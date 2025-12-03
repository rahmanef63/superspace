/**
 * User Settings Feature Preview
 * 
 * Mock preview showing user profile and settings interface
 */

"use client"

import * as React from 'react'
import { User, Bell, Shield, Palette, Globe, Key, Mail, Camera, Save } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { defineFeaturePreview } from '@/frontend/shared/features/preview'
import type { FeaturePreviewProps } from '@/frontend/shared/features/preview'

interface UserProfile {
  name: string
  email: string
  avatar?: string
  role: string
  timezone: string
}

interface UserSettingsMockData {
  profile: UserProfile
  preferences: {
    id: string
    label: string
    enabled: boolean
    description: string
  }[]
  theme: 'light' | 'dark' | 'system'
}

function UserSettingsPreview({ mockData, compact, interactive }: FeaturePreviewProps) {
  const data = mockData.data as unknown as UserSettingsMockData

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={data.profile.avatar} />
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {data.profile.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{data.profile.name}</p>
            <p className="text-[10px] text-muted-foreground truncate">{data.profile.email}</p>
          </div>
        </div>
        <div className="flex gap-1">
          <div className="p-1.5 bg-muted/30 rounded"><Bell className="h-3 w-3" /></div>
          <div className="p-1.5 bg-muted/30 rounded"><Shield className="h-3 w-3" /></div>
          <div className="p-1.5 bg-muted/30 rounded"><Palette className="h-3 w-3" /></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <User className="h-5 w-5" />
          <h3 className="font-semibold">Profile Settings</h3>
        </div>
        <Button size="sm" className="gap-1" disabled={!interactive}>
          <Save className="h-4 w-4" />
          Save
        </Button>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Profile</CardTitle>
          <CardDescription className="text-xs">Your personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-16 w-16">
                <AvatarImage src={data.profile.avatar} />
                <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                  {data.profile.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button 
                variant="secondary" 
                size="icon" 
                className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full"
                disabled={!interactive}
              >
                <Camera className="h-3 w-3" />
              </Button>
            </div>
            <div className="flex-1">
              <p className="font-medium">{data.profile.name}</p>
              <p className="text-sm text-muted-foreground">{data.profile.role}</p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Display Name</Label>
              <Input defaultValue={data.profile.name} disabled={!interactive} className="h-8" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Email</Label>
              <Input defaultValue={data.profile.email} disabled={!interactive} className="h-8" />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Timezone</Label>
            <Select disabled={!interactive} defaultValue={data.profile.timezone}>
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="utc">UTC</SelectItem>
                <SelectItem value="pst">Pacific Time (PST)</SelectItem>
                <SelectItem value="est">Eastern Time (EST)</SelectItem>
                <SelectItem value="gmt">GMT</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.preferences.map((pref) => (
            <div key={pref.id} className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-xs">{pref.label}</Label>
                <p className="text-[10px] text-muted-foreground">{pref.description}</p>
              </div>
              <Switch checked={pref.enabled} disabled={!interactive} />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Theme */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            {(['light', 'dark', 'system'] as const).map((theme) => (
              <div
                key={theme}
                className={cn(
                  "p-3 rounded-lg border text-center cursor-pointer transition-colors",
                  data.theme === theme ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                )}
              >
                <div className={cn(
                  "w-6 h-6 rounded-full mx-auto mb-1",
                  theme === 'light' ? "bg-white border" : 
                  theme === 'dark' ? "bg-slate-900" : 
                  "bg-gradient-to-r from-white to-slate-900"
                )} />
                <span className="text-xs capitalize">{theme}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Register the preview
export default defineFeaturePreview({
  featureId: 'user-settings',
  name: 'User Settings',
  description: 'Personal profile and preferences',
  component: UserSettingsPreview,
  category: 'profile',
  tags: ['profile', 'settings', 'preferences', 'account'],
  mockDataSets: [
    {
      id: 'default',
      name: 'Profile',
      description: 'User profile settings',
      data: {
        profile: {
          name: 'John Doe',
          email: 'john@example.com',
          role: 'Administrator',
          timezone: 'pst',
        },
        preferences: [
          { id: '1', label: 'Email Notifications', enabled: true, description: 'Receive email updates' },
          { id: '2', label: 'Desktop Alerts', enabled: true, description: 'Show browser notifications' },
          { id: '3', label: 'Weekly Digest', enabled: false, description: 'Weekly summary email' },
        ],
        theme: 'system',
      },
    },
  ],
})
