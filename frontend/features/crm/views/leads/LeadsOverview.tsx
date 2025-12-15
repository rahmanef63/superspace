'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Target, Plus, Search, Filter } from 'lucide-react'

interface LeadsOverviewProps {
  workspaceId?: string | null
}

export default function LeadsOverview({ workspaceId }: LeadsOverviewProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const leads: unknown[] = [] // Will be populated from database

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            <div>
              <CardTitle>Leads</CardTitle>
              <CardDescription>
                Track and manage sales leads
              </CardDescription>
            </div>
          </div>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Lead
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        {leads.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
            <Target className="h-12 w-12 mb-4 opacity-20" />
            <p className="font-medium">No leads yet</p>
            <p className="text-sm">Add your first lead to start tracking</p>
            <div className="flex gap-2 mt-4">
              <Badge variant="secondary">New</Badge>
              <Badge variant="secondary">Contacted</Badge>
              <Badge variant="secondary">Qualified</Badge>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
