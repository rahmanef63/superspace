'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Package } from 'lucide-react'

interface ItemsOverviewProps {
  workspaceId?: string | null
}

export default function ItemsOverview({ workspaceId }: ItemsOverviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Items
        </CardTitle>
        <CardDescription>
          Manage inventory items and products
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center h-48 text-muted-foreground">
          <p>Items management coming soon...</p>
        </div>
      </CardContent>
    </Card>
  )
}
