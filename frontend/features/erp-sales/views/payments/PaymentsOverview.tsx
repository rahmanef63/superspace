/**
 * Payments Overview Component
 * Placeholder for the payments sub-module
 */

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface PaymentsOverviewProps {
  workspaceId?: string | null
}

export default function PaymentsOverview({ workspaceId }: PaymentsOverviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <p>Payment processing and management coming soon</p>
        </div>
      </CardContent>
    </Card>
  )
}