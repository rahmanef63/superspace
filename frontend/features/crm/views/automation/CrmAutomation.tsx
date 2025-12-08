'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Zap } from 'lucide-react'

interface CrmAutomationProps {
  workspaceId?: string | null
}

export default function CrmAutomation({ workspaceId }: CrmAutomationProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Automation
        </CardTitle>
        <CardDescription>
          CRM workflow automation rules
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center h-48 text-muted-foreground">
          <p>CRM automation coming soon...</p>
        </div>
      </CardContent>
    </Card>
  )
}
