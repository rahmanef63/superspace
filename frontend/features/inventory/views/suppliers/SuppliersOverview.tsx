'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Truck, Plus, Search, Filter, Star } from 'lucide-react'

interface SuppliersOverviewProps {
  workspaceId?: string | null
}

export default function SuppliersOverview({ workspaceId }: SuppliersOverviewProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const suppliers: unknown[] = [] // Will be populated from database

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            <div>
              <CardTitle>Suppliers</CardTitle>
              <CardDescription>
                Manage suppliers and vendor relationships
              </CardDescription>
            </div>
          </div>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Supplier
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search suppliers..."
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
          <Badge variant="outline">0 Active</Badge>
          <Badge variant="outline">0 Preferred</Badge>
        </div>
        {suppliers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
            <Truck className="h-12 w-12 mb-4 opacity-20" />
            <p className="font-medium">No suppliers yet</p>
            <p className="text-sm">Add suppliers to manage vendor relationships</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
