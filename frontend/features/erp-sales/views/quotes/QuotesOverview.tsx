/**
 * Quotes Overview Component
 * Placeholder for the quotations sub-module
 */

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface QuotesOverviewProps {
  workspaceId?: string | null
}

export default function QuotesOverview({ workspaceId }: QuotesOverviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quotes & Estimates</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <p>Quotes and estimates management coming soon</p>
        </div>
      </CardContent>
    </Card>
  )
}