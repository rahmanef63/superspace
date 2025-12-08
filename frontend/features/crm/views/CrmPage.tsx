/**
 * ERP CRM Module Main Page
 *
 * Main entry point for the CRM & Sales module
 */

'use client'

import React, { useState } from 'react'
import { Id } from "@convex/_generated/dataModel"
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FeatureHeader } from "@/frontend/shared/ui/layout/header"
import { PageContainer } from "@/frontend/shared/ui/layout/container"
import {
  Users,
  Target,
  TrendingUp,
  Building,
  Megaphone,
  Activity,
  CheckSquare,
  Zap,
  Plus,
  Search,
  Filter,
  Download,
  Phone,
  Mail,
} from 'lucide-react'

// Import sub-components (will be created)
import ContactsOverview from './contacts/ContactsOverview'
import LeadsOverview from './leads/LeadsOverview'
import OpportunitiesOverview from './opportunities/OpportunitiesOverview'
import AccountsOverview from './accounts/AccountsOverview'
import CampaignsOverview from './campaigns/CampaignsOverview'
import ActivitiesOverview from './activities/ActivitiesOverview'
import CrmTasksOverview from './tasks/CrmTasksOverview'
import CrmReports from './reports/CrmReports'
import CrmAutomation from './automation/CrmAutomation'

interface CrmPageProps {
  workspaceId?: Id<"workspaces"> | null
}

export default function CrmPage({ workspaceId }: CrmPageProps) {
  const [activeTab, setActiveTab] = useState('overview')

  // Quick stats (will be fetched from API)
  const stats = {
    totalContacts: 0,
    totalLeads: 0,
    openOpportunities: 0,
    pipelineValue: 0,
    conversionRate: 0,
    activeCampaigns: 0,
    overdueTasks: 0,
    todayActivities: 0,
  }

  // Recent leads (will be fetched)
  const recentLeads: Array<{ id: string; name: string; company: string; status: string; value: number; date: string }> = []

  // Sales pipeline data (will be fetched)
  const pipelineData: Array<{ name: string; stage: string; count: number; value: number; probability: number }> = []

  // Today's activities (will be fetched)
  const todayActivities: Array<{ id: string; type: string; subject: string; time: string; with: string }> = []

  if (!workspaceId) {
    return (
      <PageContainer centered>
        <div className="text-center">
          <h2 className="text-xl font-semibold">No Workspace Selected</h2>
          <p className="mt-2 text-muted-foreground">
            Please select a workspace to view CRM & Sales
          </p>
        </div>
      </PageContainer>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <FeatureHeader
        icon={Users}
        title="CRM & Sales"
        subtitle="Manage customers, leads, opportunities, and sales activities"
        primaryAction={{
          label: "Add Contact",
          icon: Plus,
          onClick: () => {},
        }}
        secondaryActions={[
          {
            id: "search",
            label: "Search",
            icon: Search,
            onClick: () => {},
          },
          {
            id: "filter",
            label: "Filter",
            icon: Filter,
            onClick: () => {},
          },
          {
            id: "export",
            label: "Export",
            icon: Download,
            onClick: () => {},
          },
        ]}
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalContacts.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalLeads} leads in pipeline
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Opportunities</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.openOpportunities}</div>
            <p className="text-xs text-muted-foreground">
              ${stats.pipelineValue.toLocaleString()} in pipeline
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conversionRate}%</div>
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
            <div className="text-2xl font-bold">{stats.todayActivities}</div>
            <p className="text-xs text-muted-foreground">
              {stats.overdueTasks} tasks overdue
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="contacts">
            Contacts
            <Badge variant="secondary" className="ml-2">{stats.totalContacts}</Badge>
          </TabsTrigger>
          <TabsTrigger value="leads">
            Leads
            <Badge variant="secondary" className="ml-2">{stats.totalLeads}</Badge>
          </TabsTrigger>
          <TabsTrigger value="opportunities">
            Opportunities
            <Badge variant="secondary" className="ml-2">{stats.openOpportunities}</Badge>
          </TabsTrigger>
          <TabsTrigger value="accounts">
            Accounts
          </TabsTrigger>
          <TabsTrigger value="campaigns">
            Campaigns
            <Badge variant="secondary" className="ml-2">{stats.activeCampaigns}</Badge>
          </TabsTrigger>
          <TabsTrigger value="activities">
            Activities
            <Badge variant="secondary" className="ml-2">{stats.todayActivities}</Badge>
          </TabsTrigger>
          <TabsTrigger value="tasks">
            Tasks
            <Badge variant="secondary" className="ml-2">{stats.overdueTasks}</Badge>
          </TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Sales Pipeline Overview */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  Sales Pipeline
                </CardTitle>
                <Button variant="ghost" size="sm">
                  View Pipeline
                </Button>
              </div>
              <CardDescription>
                Current opportunities by stage
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pipelineData.length > 0 ? (
                <div className="space-y-4">
                  {pipelineData.slice(0, 5).map((stage, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium">{stage.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {stage.count} deals
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${stage.value.toLocaleString()}</p>
                        <Badge variant="outline">{stage.probability}%</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Pipeline Data</h3>
                  <p className="text-muted-foreground mb-4">
                    Start adding opportunities to see your pipeline
                  </p>
                  <Button>Add Opportunity</Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Leads & Today's Activities */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Recent Leads */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-500" />
                    Recent Leads
                  </CardTitle>
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                </div>
                <CardDescription>
                  Latest leads added to the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentLeads.length > 0 ? (
                  <div className="space-y-4">
                    {recentLeads.slice(0, 5).map((lead, i) => (
                      <div key={i} className="flex items-center justify-between p-3 border rounded">
                        <div className="space-y-1">
                          <p className="font-medium">{lead.name}</p>
                          <p className="text-sm text-muted-foreground">{lead.company}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">{lead.status}</Badge>
                          <p className="text-xs text-muted-foreground mt-1">{lead.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground text-sm">No recent leads</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Today's Activities */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-purple-500" />
                    Today's Activities
                  </CardTitle>
                  <Button variant="ghost" size="sm">
                    View Calendar
                  </Button>
                </div>
                <CardDescription>
                  Scheduled activities for today
                </CardDescription>
              </CardHeader>
              <CardContent>
                {todayActivities.length > 0 ? (
                  <div className="space-y-3">
                    {todayActivities.slice(0, 5).map((activity, i) => (
                      <div key={i} className="flex items-center space-x-4 text-sm">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        <div className="flex-1">
                          <p className="font-medium">{activity.subject}</p>
                          <p className="text-muted-foreground">
                            {activity.type} • {activity.time}
                          </p>
                        </div>
                        <Badge variant="outline">{activity.with}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground text-sm">No activities scheduled</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common CRM operations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button className="w-full justify-start" variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  New Contact
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Target className="mr-2 h-4 w-4" />
                  New Lead
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  New Opportunity
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Phone className="mr-2 h-4 w-4" />
                  Log Call
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Mail className="mr-2 h-4 w-4" />
                  Send Email
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <CheckSquare className="mr-2 h-4 w-4" />
                  Create Task
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Megaphone className="mr-2 h-4 w-4" />
                  New Campaign
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Activity className="mr-2 h-4 w-4" />
                  Schedule Meeting
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts">
          <ContactsOverview workspaceId={workspaceId} />
        </TabsContent>

        <TabsContent value="leads">
          <LeadsOverview workspaceId={workspaceId} />
        </TabsContent>

        <TabsContent value="opportunities">
          <OpportunitiesOverview workspaceId={workspaceId} />
        </TabsContent>

        <TabsContent value="accounts">
          <AccountsOverview workspaceId={workspaceId} />
        </TabsContent>

        <TabsContent value="campaigns">
          <CampaignsOverview workspaceId={workspaceId} />
        </TabsContent>

        <TabsContent value="activities">
          <ActivitiesOverview workspaceId={workspaceId} />
        </TabsContent>

        <TabsContent value="tasks">
          <CrmTasksOverview workspaceId={workspaceId} />
        </TabsContent>

        <TabsContent value="reports">
          <CrmReports workspaceId={workspaceId} />
        </TabsContent>

        <TabsContent value="automation">
          <CrmAutomation workspaceId={workspaceId} />
        </TabsContent>
      </Tabs>
        </div>
      </div>
    </div>
  )
}
