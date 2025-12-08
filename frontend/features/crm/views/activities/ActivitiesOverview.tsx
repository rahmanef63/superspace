'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity } from 'lucide-react'

interface ActivitiesOverviewProps {
  workspaceId?: string | null
}

export default function ActivitiesOverview({ workspaceId }: ActivitiesOverviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Activities
        </CardTitle>
        <CardDescription>
          Track sales activities and interactions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center h-48 text-muted-foreground">
          <p>Activity tracking coming soon...</p>
        </div>
      </CardContent>
    </Card>
  )
}
