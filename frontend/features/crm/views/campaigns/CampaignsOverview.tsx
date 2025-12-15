'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Megaphone, Plus, Mail, MessageSquare, Globe } from 'lucide-react'

interface CampaignsOverviewProps {
  workspaceId?: string | null
}

export default function CampaignsOverview({ workspaceId }: CampaignsOverviewProps) {
  const [activeTab, setActiveTab] = useState('all')
  const campaigns: unknown[] = [] // Will be populated from database

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            <div>
              <CardTitle>Campaigns</CardTitle>
              <CardDescription>
                Marketing and sales campaigns
              </CardDescription>
            </div>
          </div>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Campaign
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="email"><Mail className="h-3 w-3 mr-1" />Email</TabsTrigger>
            <TabsTrigger value="sms"><MessageSquare className="h-3 w-3 mr-1" />SMS</TabsTrigger>
            <TabsTrigger value="social"><Globe className="h-3 w-3 mr-1" />Social</TabsTrigger>
          </TabsList>
          <TabsContent value={activeTab}>
            {campaigns.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                <Megaphone className="h-12 w-12 mb-4 opacity-20" />
                <p className="font-medium">No campaigns yet</p>
                <p className="text-sm">Create your first marketing campaign</p>
                <div className="flex gap-2 mt-4">
                  <Badge variant="outline">0 Active</Badge>
                  <Badge variant="outline">0 Scheduled</Badge>
                  <Badge variant="outline">0 Completed</Badge>
                </div>
              </div>
            ) : null}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
