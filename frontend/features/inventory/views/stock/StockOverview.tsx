'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Layers } from 'lucide-react'

interface StockOverviewProps {
  workspaceId?: string | null
}

export default function StockOverview({ workspaceId }: StockOverviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="h-5 w-5" />
          Stock Levels
        </CardTitle>
        <CardDescription>
          Monitor stock levels across locations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center h-48 text-muted-foreground">
          <p>Stock level management coming soon...</p>
        </div>
      </CardContent>
    </Card>
  )
}
