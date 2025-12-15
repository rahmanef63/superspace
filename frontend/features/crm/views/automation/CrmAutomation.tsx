'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Zap, Plus, Play, Pause } from 'lucide-react'

interface CrmAutomationProps {
  workspaceId?: string | null
}

export default function CrmAutomation({ workspaceId }: CrmAutomationProps) {
  const automations: unknown[] = [] // Will be populated from database

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            <div>
              <CardTitle>Automation</CardTitle>
              <CardDescription>
                CRM workflow automation rules
              </CardDescription>
            </div>
          </div>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Create Rule
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {automations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
            <Zap className="h-12 w-12 mb-4 opacity-20" />
            <p className="font-medium">No automations configured</p>
            <p className="text-sm">Create rules to automate your CRM workflows</p>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" size="sm">
                <Play className="h-3 w-3 mr-1" />
                Lead Assignment
              </Button>
              <Button variant="outline" size="sm">
                <Pause className="h-3 w-3 mr-1" />
                Follow-up Reminder
              </Button>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
