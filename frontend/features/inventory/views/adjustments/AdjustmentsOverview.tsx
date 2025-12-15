'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Settings2, Plus, ArrowUp, ArrowDown, RefreshCw } from 'lucide-react'

interface AdjustmentsOverviewProps {
  workspaceId?: string | null
}

export default function AdjustmentsOverview({ workspaceId }: AdjustmentsOverviewProps) {
  const [activeTab, setActiveTab] = useState('all')
  const adjustments: unknown[] = [] // Will be populated from database

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            <div>
              <CardTitle>Stock Adjustments</CardTitle>
              <CardDescription>
                Manage inventory adjustments and corrections
              </CardDescription>
            </div>
          </div>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Adjustment
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="increase"><ArrowUp className="h-3 w-3 mr-1" />Increase</TabsTrigger>
            <TabsTrigger value="decrease"><ArrowDown className="h-3 w-3 mr-1" />Decrease</TabsTrigger>
            <TabsTrigger value="recount"><RefreshCw className="h-3 w-3 mr-1" />Recount</TabsTrigger>
          </TabsList>
          <TabsContent value={activeTab}>
            <div className="flex gap-2 mb-4">
              <Badge variant="outline">0 Pending</Badge>
              <Badge variant="outline">0 Approved</Badge>
              <Badge variant="outline">0 This Month</Badge>
            </div>
            {adjustments.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                <Settings2 className="h-12 w-12 mb-4 opacity-20" />
                <p className="font-medium">No adjustments recorded</p>
                <p className="text-sm">Create an adjustment to correct stock levels</p>
              </div>
            ) : null}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
