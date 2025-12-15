'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeftRight, Plus, Clock, Truck, CheckCircle } from 'lucide-react'

interface TransfersOverviewProps {
  workspaceId?: string | null
}

export default function TransfersOverview({ workspaceId }: TransfersOverviewProps) {
  const [activeTab, setActiveTab] = useState('all')
  const transfers: unknown[] = [] // Will be populated from database

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5" />
            <div>
              <CardTitle>Stock Transfers</CardTitle>
              <CardDescription>
                Manage inter-warehouse stock transfers
              </CardDescription>
            </div>
          </div>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Transfer
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending"><Clock className="h-3 w-3 mr-1" />Pending</TabsTrigger>
            <TabsTrigger value="in-transit"><Truck className="h-3 w-3 mr-1" />In Transit</TabsTrigger>
            <TabsTrigger value="completed"><CheckCircle className="h-3 w-3 mr-1" />Completed</TabsTrigger>
          </TabsList>
          <TabsContent value={activeTab}>
            <div className="flex gap-2 mb-4">
              <Badge variant="outline">0 Pending</Badge>
              <Badge variant="outline">0 In Transit</Badge>
              <Badge variant="outline">0 This Month</Badge>
            </div>
            {transfers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                <ArrowLeftRight className="h-12 w-12 mb-4 opacity-20" />
                <p className="font-medium">No transfers yet</p>
                <p className="text-sm">Create a transfer to move stock between locations</p>
              </div>
            ) : null}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
