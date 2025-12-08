'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users } from 'lucide-react'

interface ContactsOverviewProps {
  workspaceId?: string | null
}

export default function ContactsOverview({ workspaceId }: ContactsOverviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Contacts
        </CardTitle>
        <CardDescription>
          Manage your customer and business contacts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center h-48 text-muted-foreground">
          <p>Contact management coming soon...</p>
        </div>
      </CardContent>
    </Card>
  )
}
