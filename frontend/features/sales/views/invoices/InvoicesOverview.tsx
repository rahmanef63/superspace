/**
 * Invoices Overview Component
 * Placeholder for the invoices sub-module
 */

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { FileText, Plus, Search, Filter } from 'lucide-react'

interface InvoicesOverviewProps {
  workspaceId?: string | null
}

export default function InvoicesOverview({ workspaceId }: InvoicesOverviewProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const invoices: unknown[] = [] // Will be populated from database

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Invoices</CardTitle>
            <CardDescription>Create and manage customer invoices</CardDescription>
          </div>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Invoice
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search invoices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-2 mb-4">
          <Badge variant="outline">0 Draft</Badge>
          <Badge variant="outline">0 Sent</Badge>
          <Badge variant="outline">0 Paid</Badge>
          <Badge variant="outline">0 Overdue</Badge>
        </div>
        {invoices.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="font-medium text-foreground">No invoices yet</p>
            <p className="text-sm text-muted-foreground">Create your first invoice to get started</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
