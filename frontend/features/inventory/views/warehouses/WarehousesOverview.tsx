'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Warehouse } from 'lucide-react'

interface WarehousesOverviewProps {
  workspaceId?: string | null
}

export default function WarehousesOverview({ workspaceId }: WarehousesOverviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Warehouse className="h-5 w-5" />
          Warehouses
        </CardTitle>
        <CardDescription>
          Manage warehouse locations and storage
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center h-48 text-muted-foreground">
          <p>Warehouse management coming soon...</p>
        </div>
      </CardContent>
    </Card>
  )
}
