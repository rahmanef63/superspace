'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeftRight } from 'lucide-react'

interface TransfersOverviewProps {
  workspaceId?: string | null
}

export default function TransfersOverview({ workspaceId }: TransfersOverviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowLeftRight className="h-5 w-5" />
          Stock Transfers
        </CardTitle>
        <CardDescription>
          Manage inter-warehouse stock transfers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center h-48 text-muted-foreground">
          <p>Stock transfer management coming soon...</p>
        </div>
      </CardContent>
    </Card>
  )
}
