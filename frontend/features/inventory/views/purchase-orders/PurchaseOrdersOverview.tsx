'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ClipboardList } from 'lucide-react'

interface PurchaseOrdersOverviewProps {
  workspaceId?: string | null
}

export default function PurchaseOrdersOverview({ workspaceId }: PurchaseOrdersOverviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5" />
          Purchase Orders
        </CardTitle>
        <CardDescription>
          Manage purchase orders and procurement
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center h-48 text-muted-foreground">
          <p>Purchase order management coming soon...</p>
        </div>
      </CardContent>
    </Card>
  )
}
