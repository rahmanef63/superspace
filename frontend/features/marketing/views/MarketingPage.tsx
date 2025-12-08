"use client"

import React from "react"
import { Megaphone, Plus, Mail, Send, Users, BarChart3, Play, Pause } from "lucide-react"
import { Id } from "@convex/_generated/dataModel"
import { useMarketing } from "../hooks/useMarketing"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"

interface MarketingPageProps {
  workspaceId?: Id<"workspaces"> | null
}

/**
 * Marketing Page Component
 */
export default function MarketingPage({ workspaceId }: MarketingPageProps) {
  const { isLoading, campaigns, stats } = useMarketing(workspaceId)

  if (!workspaceId) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">No Workspace Selected</h2>
          <p className="mt-2 text-muted-foreground">
            Please select a workspace to use marketing
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-3">
          <Megaphone className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-xl font-bold">Marketing</h1>
            <p className="text-sm text-muted-foreground">
              Campaigns and automation
            </p>
          </div>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Campaign
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 border-b p-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Emails Sent</p>
                <p className="text-2xl font-bold">{stats?.emailsSent || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Send className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Open Rate</p>
                <p className="text-2xl font-bold">{stats?.openRate || 0}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Subscribers</p>
                <p className="text-2xl font-bold">{stats?.subscribers || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Conversions</p>
                <p className="text-2xl font-bold">{stats?.conversions || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        <Tabs defaultValue="campaigns">
          <TabsList>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="automations">Automations</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="campaigns" className="mt-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">Loading campaigns...</p>
              </div>
            ) : campaigns.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <Megaphone className="h-12 w-12 text-muted-foreground" />
                <div className="text-center">
                  <h3 className="font-medium">No campaigns yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Create your first marketing campaign
                  </p>
                </div>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Campaign
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {campaigns.map((campaign: any) => (
                  <Card key={campaign._id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">{campaign.name}</CardTitle>
                          <CardDescription>{campaign.description}</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={
                              campaign.status === "active" ? "default" :
                              campaign.status === "draft" ? "secondary" : "outline"
                            }
                          >
                            {campaign.status}
                          </Badge>
                          <Button variant="ghost" size="icon">
                            {campaign.status === "active" ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Sent</p>
                          <p className="font-medium">{campaign.sent || 0}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Opens</p>
                          <p className="font-medium">{campaign.opens || 0}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Clicks</p>
                          <p className="font-medium">{campaign.clicks || 0}</p>
                        </div>
                      </div>
                      {campaign.progress !== undefined && (
                        <div className="mt-4">
                          <Progress value={campaign.progress} className="h-2" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="automations" className="mt-6">
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Megaphone className="h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">Marketing automations coming soon</p>
            </div>
          </TabsContent>

          <TabsContent value="templates" className="mt-6">
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Mail className="h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">Email templates coming soon</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
