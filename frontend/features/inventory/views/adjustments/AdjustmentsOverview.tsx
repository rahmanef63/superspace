'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings2 } from 'lucide-react'

interface AdjustmentsOverviewProps {
  workspaceId?: string | null
}

export default function AdjustmentsOverview({ workspaceId }: AdjustmentsOverviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings2 className="h-5 w-5" />
          Stock Adjustments
        </CardTitle>
        <CardDescription>
          Manage inventory adjustments and corrections
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center h-48 text-muted-foreground">
          <p>Stock adjustment management coming soon...</p>
        </div>
      </CardContent>
    </Card>
  )
}
