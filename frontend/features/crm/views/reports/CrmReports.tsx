'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3 } from 'lucide-react'

interface CrmReportsProps {
  workspaceId?: string | null
}

export default function CrmReports({ workspaceId }: CrmReportsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Reports
        </CardTitle>
        <CardDescription>
          CRM analytics and reports
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center h-48 text-muted-foreground">
          <p>CRM reporting coming soon...</p>
        </div>
      </CardContent>
    </Card>
  )
}
