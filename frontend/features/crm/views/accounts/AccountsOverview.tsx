'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Building, Plus, Search, Filter } from 'lucide-react'

interface AccountsOverviewProps {
  workspaceId?: string | null
}

export default function AccountsOverview({ workspaceId }: AccountsOverviewProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const accounts: unknown[] = [] // Will be populated from database

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            <div>
              <CardTitle>Accounts</CardTitle>
              <CardDescription>
                Manage business accounts and organizations
              </CardDescription>
            </div>
          </div>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Account
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search accounts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        {accounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
            <Building className="h-12 w-12 mb-4 opacity-20" />
            <p className="font-medium">No accounts yet</p>
            <p className="text-sm">Create your first business account to get started</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
