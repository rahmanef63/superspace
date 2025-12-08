'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Target } from 'lucide-react'

interface LeadsOverviewProps {
  workspaceId?: string | null
}

export default function LeadsOverview({ workspaceId }: LeadsOverviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Leads
        </CardTitle>
        <CardDescription>
          Track and manage sales leads
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center h-48 text-muted-foreground">
          <p>Lead management coming soon...</p>
        </div>
      </CardContent>
    </Card>
  )
}
