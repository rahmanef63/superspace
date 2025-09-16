"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Save, Trash2 } from "lucide-react"

interface WorkspaceSettingsProps {
  className?: string
}

export function WorkspaceSettings({ className }: WorkspaceSettingsProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isPublic, setIsPublic] = useState(false)

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Workspace Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="workspace-name">Workspace Name</Label>
          <Input
            id="workspace-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter workspace name..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="workspace-description">Description</Label>
          <Textarea
            id="workspace-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your workspace..."
            rows={3}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Public Workspace</Label>
            <p className="text-sm text-gray-500">Allow others to discover and join this workspace</p>
          </div>
          <Switch checked={isPublic} onCheckedChange={setIsPublic} />
        </div>

        <div className="flex gap-2 pt-4">
          <Button>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
          <Button variant="destructive">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Workspace
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
