/**
 * Workspace Settings Feature Preview
 * 
 * Mock preview showing workspace settings interface
 */

"use client"

import * as React from 'react'
import { Settings, Globe, Lock, Bell, Palette, Users, Shield, Database, Save } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { defineFeaturePreview } from '@/frontend/shared/preview'
import type { FeaturePreviewProps } from '@/frontend/shared/preview'

interface SettingsSection {
  id: string
  icon: React.ReactNode
  title: string
  description: string
  badge?: string
}

interface SettingsMockData {
  workspace: {
    name: string
    slug: string
    visibility: 'private' | 'public'
  }
  sections: SettingsSection[]
  quickSettings: {
    id: string
    label: string
    enabled: boolean
    description: string
  }[]
}

function WorkspaceSettingsPreview({ mockData, compact, interactive }: FeaturePreviewProps) {
  const data = mockData.data as unknown as SettingsMockData

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Settings</span>
          <Settings className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="p-2 bg-muted/50 rounded-md">
          <p className="text-xs font-medium">{data.workspace.name}</p>
          <p className="text-[10px] text-muted-foreground">/{data.workspace.slug}</p>
        </div>
        <div className="flex gap-1">
          {data.sections.slice(0, 3).map((section) => (
            <div key={section.id} className="p-1.5 bg-muted/30 rounded">
              {section.icon}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          <h3 className="font-semibold">Workspace Settings</h3>
        </div>
        <Button size="sm" className="gap-1" disabled={!interactive}>
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </div>

      {/* Basic Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">General</CardTitle>
          <CardDescription className="text-xs">Basic workspace information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs">Workspace Name</Label>
            <Input 
              defaultValue={data.workspace.name} 
              disabled={!interactive}
              className="h-8"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">URL Slug</Label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">superspace.io/</span>
              <Input 
                defaultValue={data.workspace.slug} 
                disabled={!interactive}
                className="h-8 flex-1"
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-xs">Visibility</Label>
              <p className="text-[10px] text-muted-foreground">
                {data.workspace.visibility === 'private' ? 'Only members can access' : 'Anyone can view'}
              </p>
            </div>
            <Badge variant={data.workspace.visibility === 'private' ? 'secondary' : 'default'}>
              {data.workspace.visibility === 'private' ? <Lock className="h-3 w-3 mr-1" /> : <Globe className="h-3 w-3 mr-1" />}
              {data.workspace.visibility}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Settings Sections */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Settings Categories</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2">
          {data.sections.map((section) => (
            <div 
              key={section.id} 
              className="flex items-center gap-2 p-2 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center">
                {section.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium">{section.title}</p>
                <p className="text-[10px] text-muted-foreground truncate">{section.description}</p>
              </div>
              {section.badge && (
                <Badge variant="secondary" className="text-[10px]">{section.badge}</Badge>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Quick Settings */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Quick Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.quickSettings.map((setting) => (
            <div key={setting.id} className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-xs">{setting.label}</Label>
                <p className="text-[10px] text-muted-foreground">{setting.description}</p>
              </div>
              <Switch checked={setting.enabled} disabled={!interactive} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

// Register the preview
export default defineFeaturePreview({
  featureId: 'workspace-settings',
  name: 'Workspace Settings',
  description: 'Configure workspace preferences',
  component: WorkspaceSettingsPreview,
  category: 'administration',
  tags: ['settings', 'configuration', 'preferences', 'workspace'],
  mockDataSets: [
    {
      id: 'default',
      name: 'Settings',
      description: 'Workspace configuration',
      data: {
        workspace: {
          name: 'Acme Corporation',
          slug: 'acme-corp',
          visibility: 'private',
        },
        sections: [
          { id: '1', icon: <Users className="h-4 w-4 text-blue-500" />, title: 'Members', description: 'Manage team access', badge: '24' },
          { id: '2', icon: <Shield className="h-4 w-4 text-green-500" />, title: 'Security', description: 'Security settings' },
          { id: '3', icon: <Bell className="h-4 w-4 text-yellow-500" />, title: 'Notifications', description: 'Alert preferences' },
          { id: '4', icon: <Palette className="h-4 w-4 text-purple-500" />, title: 'Appearance', description: 'Theme & branding' },
          { id: '5', icon: <Database className="h-4 w-4 text-orange-500" />, title: 'Storage', description: 'Data management', badge: '80%' },
          { id: '6', icon: <Lock className="h-4 w-4 text-red-500" />, title: 'Privacy', description: 'Data privacy' },
        ],
        quickSettings: [
          { id: '1', label: 'Two-Factor Authentication', enabled: true, description: 'Require 2FA for all members' },
          { id: '2', label: 'Guest Access', enabled: false, description: 'Allow external guests' },
          { id: '3', label: 'Analytics', enabled: true, description: 'Collect usage analytics' },
        ],
      },
    },
  ],
})
