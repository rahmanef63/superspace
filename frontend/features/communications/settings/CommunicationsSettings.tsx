"use client"

import { useCommunicationsSettingsStorage } from "./useCommunicationsSettings"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function CommunicationsSettings() {
    const { settings, updateSettings } = useCommunicationsSettingsStorage()

    return (
        <div className="space-y-6">
             <Card>
                <CardHeader>
                    <CardTitle>Settings</CardTitle>
                    <CardDescription>Manage settings for communications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Enable Notifications</Label>
                            <p className="text-sm text-muted-foreground">
                                Receive notifications for updates
                            </p>
                        </div>
                        <Switch
                            checked={settings.notificationsEnabled}
                            onCheckedChange={(checked) =>
                                updateSettings({ notificationsEnabled: checked })
                            }
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
