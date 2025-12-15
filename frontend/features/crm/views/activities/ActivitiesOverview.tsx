'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Activity, Plus, Phone, Mail, Calendar, MessageSquare } from 'lucide-react'

interface ActivitiesOverviewProps {
  workspaceId?: string | null
}

export default function ActivitiesOverview({ workspaceId }: ActivitiesOverviewProps) {
  const [activeTab, setActiveTab] = useState('all')
  const activities: unknown[] = [] // Will be populated from database

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            <div>
              <CardTitle>Activities</CardTitle>
              <CardDescription>
                Track sales activities and interactions
              </CardDescription>
            </div>
          </div>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Log Activity
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="calls"><Phone className="h-3 w-3 mr-1" />Calls</TabsTrigger>
            <TabsTrigger value="emails"><Mail className="h-3 w-3 mr-1" />Emails</TabsTrigger>
            <TabsTrigger value="meetings"><Calendar className="h-3 w-3 mr-1" />Meetings</TabsTrigger>
            <TabsTrigger value="notes"><MessageSquare className="h-3 w-3 mr-1" />Notes</TabsTrigger>
          </TabsList>
          <TabsContent value={activeTab}>
            {activities.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                <Activity className="h-12 w-12 mb-4 opacity-20" />
                <p className="font-medium">No activities recorded</p>
                <p className="text-sm">Log your first activity to start tracking</p>
              </div>
            ) : null}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
