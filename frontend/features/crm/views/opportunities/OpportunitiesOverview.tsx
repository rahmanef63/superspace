'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Plus, Search, DollarSign } from 'lucide-react'

interface OpportunitiesOverviewProps {
  workspaceId?: string | null
}

export default function OpportunitiesOverview({ workspaceId }: OpportunitiesOverviewProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const opportunities: unknown[] = [] // Will be populated from database

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            <div>
              <CardTitle>Opportunities</CardTitle>
              <CardDescription>
                Manage sales opportunities and deals
              </CardDescription>
            </div>
          </div>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Opportunity
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search opportunities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="p-3 rounded-lg border text-center">
            <p className="text-2xl font-bold">$0</p>
            <p className="text-xs text-muted-foreground">Pipeline Value</p>
          </div>
          <div className="p-3 rounded-lg border text-center">
            <p className="text-2xl font-bold">0</p>
            <p className="text-xs text-muted-foreground">Open Deals</p>
          </div>
          <div className="p-3 rounded-lg border text-center">
            <p className="text-2xl font-bold">0%</p>
            <p className="text-xs text-muted-foreground">Win Rate</p>
          </div>
          <div className="p-3 rounded-lg border text-center">
            <p className="text-2xl font-bold">0</p>
            <p className="text-xs text-muted-foreground">This Month</p>
          </div>
        </div>
        {opportunities.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            <DollarSign className="h-10 w-10 mb-3 opacity-20" />
            <p className="font-medium">No opportunities yet</p>
            <p className="text-sm">Create your first deal to track revenue</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
