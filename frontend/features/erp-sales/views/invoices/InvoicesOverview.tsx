/**
 * Invoices Overview Component
 * Placeholder for the invoices sub-module
 */

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface InvoicesOverviewProps {
  workspaceId?: string | null
}

export default function InvoicesOverview({ workspaceId }: InvoicesOverviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoices</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <p>Invoice management coming soon</p>
        </div>
      </CardContent>
    </Card>
  )
}