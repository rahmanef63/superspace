'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CheckSquare, Plus, Clock, AlertCircle, CheckCircle2 } from 'lucide-react'

interface CrmTasksOverviewProps {
  workspaceId?: string | null
}

export default function CrmTasksOverview({ workspaceId }: CrmTasksOverviewProps) {
  const [activeTab, setActiveTab] = useState('all')
  const tasks: unknown[] = [] // Will be populated from database

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            <div>
              <CardTitle>Tasks</CardTitle>
              <CardDescription>
                CRM-related tasks and follow-ups
              </CardDescription>
            </div>
          </div>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="today"><Clock className="h-3 w-3 mr-1" />Today</TabsTrigger>
            <TabsTrigger value="overdue"><AlertCircle className="h-3 w-3 mr-1" />Overdue</TabsTrigger>
            <TabsTrigger value="completed"><CheckCircle2 className="h-3 w-3 mr-1" />Done</TabsTrigger>
          </TabsList>
          <TabsContent value={activeTab}>
            <div className="flex gap-2 mb-4">
              <Badge variant="outline">0 Open</Badge>
              <Badge variant="outline">0 Due Today</Badge>
              <Badge variant="outline">0 Overdue</Badge>
            </div>
            {tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                <CheckSquare className="h-12 w-12 mb-4 opacity-20" />
                <p className="font-medium">No tasks yet</p>
                <p className="text-sm">Create tasks to track follow-ups and action items</p>
              </div>
            ) : null}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
