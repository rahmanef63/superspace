/**
 * CRM Feature Preview
 * 
 * Uses the REAL CrmPage layout with mock data
 * showing contacts, leads, opportunities, and activities
 */

"use client"

import * as React from 'react'
import { useState } from 'react'
import {
  Users,
  Target,
  TrendingUp,
  Building,
  Megaphone,
  Activity,
  CheckSquare,
  Plus,
  Search,
  Filter,
  Download,
  Phone,
  Mail
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { defineFeaturePreview } from '@/frontend/shared/preview'
import type { FeaturePreviewProps } from '@/frontend/shared/preview'

interface CrmMockData {
  stats: {
    totalContacts: number
    totalLeads: number
    openOpportunities: number
    pipelineValue: number
    conversionRate: number
    todayActivities: number
    overdueTasks: number
  }
  recentLeads: Array<{
    name: string
    company: string
    status: string
    value: number
    date: string
  }>
  pipeline: Array<{
    stage: string
    count: number
    value: number
    probability: number
  }>
  todayActivities: Array<{
    type: string
    subject: string
    time: string
    with: string
  }>
}

function CRMPreview({ mockData, compact, interactive }: FeaturePreviewProps) {
  const data = mockData.data as unknown as CrmMockData
  const [activeTab, setActiveTab] = useState('overview')

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">CRM & Sales</span>
          </div>
          <Badge variant="secondary">{data.stats.totalContacts} contacts</Badge>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 bg-muted/50 rounded-md text-center">
            <p className="text-lg font-bold">{data.stats.totalLeads}</p>
            <p className="text-[10px] text-muted-foreground">Leads</p>
          </div>
          <div className="p-2 bg-muted/50 rounded-md text-center">
            <p className="text-lg font-bold">${(data.stats.pipelineValue / 1000).toFixed(0)}k</p>
            <p className="text-[10px] text-muted-foreground">Pipeline</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full border rounded-xl overflow-hidden bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-card">
        <div className="flex items-center gap-3">
          <Users className="h-5 w-5 text-primary" />
          <div>
            <h2 className="font-semibold">CRM & Sales</h2>
            <p className="text-xs text-muted-foreground">Manage customers, leads, and opportunities</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8" disabled={!interactive}>
            <Search className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" disabled={!interactive}>
            <Filter className="h-4 w-4" />
          </Button>
          <Button size="sm" className="gap-2" disabled={!interactive}>
            <Plus className="h-4 w-4" />
            Add Contact
          </Button>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.stats.totalContacts.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">{data.stats.totalLeads} leads in pipeline</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Open Opportunities</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.stats.openOpportunities}</div>
                <p className="text-xs text-muted-foreground">${data.stats.pipelineValue.toLocaleString()} in pipeline</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.stats.conversionRate}%</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+2.5%</span> from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Activities</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.stats.todayActivities}</div>
                <p className="text-xs text-muted-foreground">{data.stats.overdueTasks} tasks overdue</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => interactive && setActiveTab(v)}>
            <TabsList>
              <TabsTrigger value="overview" disabled={!interactive}>Overview</TabsTrigger>
              <TabsTrigger value="contacts" disabled={!interactive}>
                Contacts <Badge variant="secondary" className="ml-1">{data.stats.totalContacts}</Badge>
              </TabsTrigger>
              <TabsTrigger value="leads" disabled={!interactive}>
                Leads <Badge variant="secondary" className="ml-1">{data.stats.totalLeads}</Badge>
              </TabsTrigger>
              <TabsTrigger value="opportunities" disabled={!interactive}>
                Opportunities <Badge variant="secondary" className="ml-1">{data.stats.openOpportunities}</Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4 space-y-4">
              {/* Sales Pipeline */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Target className="h-4 w-4 text-blue-500" />
                      Sales Pipeline
                    </CardTitle>
                    <Button variant="ghost" size="sm" disabled={!interactive}>View Pipeline</Button>
                  </div>
                  <CardDescription>Current opportunities by stage</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.pipeline.map((stage, i) => (
                      <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{stage.stage}</p>
                          <p className="text-xs text-muted-foreground">{stage.count} deals</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-sm">${stage.value.toLocaleString()}</p>
                          <Badge variant="outline" className="text-xs">{stage.probability}%</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Button className="w-full justify-start" variant="outline" disabled={!interactive}>
                      <Plus className="mr-2 h-4 w-4" /> New Contact
                    </Button>
                    <Button className="w-full justify-start" variant="outline" disabled={!interactive}>
                      <Target className="mr-2 h-4 w-4" /> New Lead
                    </Button>
                    <Button className="w-full justify-start" variant="outline" disabled={!interactive}>
                      <Phone className="mr-2 h-4 w-4" /> Log Call
                    </Button>
                    <Button className="w-full justify-start" variant="outline" disabled={!interactive}>
                      <Mail className="mr-2 h-4 w-4" /> Send Email
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contacts" className="mt-4">
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">Contact Management</p>
                  <p className="text-sm">View and manage your contacts here</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="leads" className="mt-4">
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">Lead Management</p>
                  <p className="text-sm">Track and convert leads here</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="opportunities" className="mt-4">
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">Opportunity Pipeline</p>
                  <p className="text-sm">Manage sales opportunities here</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </div>
  )
}

// Register the preview
export default defineFeaturePreview({
  featureId: 'crm',
  name: 'CRM & Sales',
  description: 'Manage customers, leads, and sales pipeline',
  component: CRMPreview,
  category: 'business',
  tags: ['crm', 'sales', 'contacts', 'leads', 'pipeline'],
  mockDataSets: [
    {
      id: 'default',
      name: 'Sales Dashboard',
      description: 'Sample CRM with pipeline data',
      data: {
        stats: {
          totalContacts: 1248,
          totalLeads: 156,
          openOpportunities: 24,
          pipelineValue: 425000,
          conversionRate: 18,
          todayActivities: 8,
          overdueTasks: 3,
        },
        recentLeads: [
          { name: 'John Smith', company: 'TechCorp', status: 'New', value: 15000, date: 'Today' },
          { name: 'Sarah Johnson', company: 'Innovate Inc', status: 'Contacted', value: 28000, date: 'Yesterday' },
        ],
        pipeline: [
          { stage: 'Qualification', count: 12, value: 120000, probability: 20 },
          { stage: 'Proposal', count: 8, value: 180000, probability: 50 },
          { stage: 'Negotiation', count: 4, value: 125000, probability: 75 },
        ],
        todayActivities: [
          { type: 'Call', subject: 'Follow up call', time: '10:00 AM', with: 'John Smith' },
          { type: 'Meeting', subject: 'Product demo', time: '2:00 PM', with: 'Sarah Johnson' },
        ],
      },
    },
  ],
})
