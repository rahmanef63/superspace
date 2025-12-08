'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Truck } from 'lucide-react'

interface SuppliersOverviewProps {
  workspaceId?: string | null
}

export default function SuppliersOverview({ workspaceId }: SuppliersOverviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Suppliers
        </CardTitle>
        <CardDescription>
          Manage suppliers and vendor relationships
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center h-48 text-muted-foreground">
          <p>Supplier management coming soon...</p>
        </div>
      </CardContent>
    </Card>
  )
}
