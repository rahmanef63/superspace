'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Megaphone } from 'lucide-react'

interface CampaignsOverviewProps {
  workspaceId?: string | null
}

export default function CampaignsOverview({ workspaceId }: CampaignsOverviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Megaphone className="h-5 w-5" />
          Campaigns
        </CardTitle>
        <CardDescription>
          Marketing and sales campaigns
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center h-48 text-muted-foreground">
          <p>Campaign management coming soon...</p>
        </div>
      </CardContent>
    </Card>
  )
}
