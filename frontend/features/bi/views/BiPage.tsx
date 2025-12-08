"use client"

import React from "react"
import { LineChart, Plus, BarChart3, PieChart, TrendingUp, TrendingDown, Activity } from "lucide-react"
import { Id } from "@convex/_generated/dataModel"
import { useBi } from "../hooks/useBi"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface BiPageProps {
  workspaceId?: Id<"workspaces"> | null
}

/**
 * BI Page Component
 */
export default function BiPage({ workspaceId }: BiPageProps) {
  const { isLoading, dashboards, metrics } = useBi(workspaceId)

  if (!workspaceId) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">No Workspace Selected</h2>
          <p className="mt-2 text-muted-foreground">
            Please select a workspace to use BI
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
          <LineChart className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-xl font-bold">Business Intelligence</h1>
            <p className="text-sm text-muted-foreground">
              Analytics and insights
            </p>
          </div>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Dashboard
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4 border-b p-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenue</p>
                <p className="text-2xl font-bold">
                  ${metrics?.revenue?.toLocaleString() || "0"}
                </p>
              </div>
              <div className="flex items-center gap-1 text-green-500">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm">+12%</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Customers</p>
                <p className="text-2xl font-bold">
                  {metrics?.customers?.toLocaleString() || "0"}
                </p>
              </div>
              <div className="flex items-center gap-1 text-green-500">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm">+8%</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Orders</p>
                <p className="text-2xl font-bold">
                  {metrics?.orders?.toLocaleString() || "0"}
                </p>
              </div>
              <div className="flex items-center gap-1 text-red-500">
                <TrendingDown className="h-4 w-4" />
                <span className="text-sm">-3%</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversion</p>
                <p className="text-2xl font-bold">
                  {metrics?.conversionRate || "0"}%
                </p>
              </div>
              <Activity className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        <Tabs defaultValue="dashboards">
          <TabsList>
            <TabsTrigger value="dashboards">Dashboards</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="data-sources">Data Sources</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboards" className="mt-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">Loading dashboards...</p>
              </div>
            ) : dashboards.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <LineChart className="h-12 w-12 text-muted-foreground" />
                <div className="text-center">
                  <h3 className="font-medium">No dashboards yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Create your first BI dashboard
                  </p>
                </div>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Dashboard
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {dashboards.map((dashboard: any) => (
                  <Card key={dashboard._id} className="cursor-pointer hover:bg-accent">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {dashboard.type === "bar" && <BarChart3 className="h-5 w-5 text-blue-500" />}
                          {dashboard.type === "line" && <LineChart className="h-5 w-5 text-green-500" />}
                          {dashboard.type === "pie" && <PieChart className="h-5 w-5 text-purple-500" />}
                          <CardTitle className="text-base">{dashboard.name}</CardTitle>
                        </div>
                        <Badge variant="outline">
                          {dashboard.widgetCount || 0} widgets
                        </Badge>
                      </div>
                      <CardDescription>{dashboard.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="aspect-video rounded-lg bg-muted flex items-center justify-center">
                        <LineChart className="h-8 w-8 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="reports" className="mt-6">
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <BarChart3 className="h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">Reports coming soon</p>
            </div>
          </TabsContent>

          <TabsContent value="data-sources" className="mt-6">
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Activity className="h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">Data sources coming soon</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
