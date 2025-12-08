'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3 } from 'lucide-react'

interface InventoryReportsProps {
  workspaceId?: string | null
}

export default function InventoryReports({ workspaceId }: InventoryReportsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Inventory Reports
        </CardTitle>
        <CardDescription>
          Analytics and reporting for inventory
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center h-48 text-muted-foreground">
          <p>Inventory reporting coming soon...</p>
        </div>
      </CardContent>
    </Card>
  )
}
