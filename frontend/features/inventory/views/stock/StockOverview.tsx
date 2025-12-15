'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Layers, Search, Filter, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

interface StockOverviewProps {
  workspaceId?: string | null
}

export default function StockOverview({ workspaceId }: StockOverviewProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const stockItems: unknown[] = [] // Will be populated from database

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            <div>
              <CardTitle>Stock Levels</CardTitle>
              <CardDescription>
                Monitor stock levels across locations
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="gap-1">
              <CheckCircle className="h-3 w-3 text-green-500" />
              In Stock: 0
            </Badge>
            <Badge variant="outline" className="gap-1">
              <AlertTriangle className="h-3 w-3 text-yellow-500" />
              Low: 0
            </Badge>
            <Badge variant="outline" className="gap-1">
              <XCircle className="h-3 w-3 text-red-500" />
              Out: 0
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by item name or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        {stockItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
            <Layers className="h-12 w-12 mb-4 opacity-20" />
            <p className="font-medium">No stock data</p>
            <p className="text-sm">Add items to track stock levels</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
