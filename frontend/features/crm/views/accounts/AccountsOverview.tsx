'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Building } from 'lucide-react'

interface AccountsOverviewProps {
  workspaceId?: string | null
}

export default function AccountsOverview({ workspaceId }: AccountsOverviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Accounts
        </CardTitle>
        <CardDescription>
          Manage business accounts and organizations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center h-48 text-muted-foreground">
          <p>Account management coming soon...</p>
        </div>
      </CardContent>
    </Card>
  )
}
