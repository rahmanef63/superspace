/**
 * ERP Sales Module Main Page
 *
 * This is the main entry point for the Sales & Invoicing module.
 * It provides a comprehensive overview of all sales activities.
 */

'use client'

import React, { useState } from 'react'
import { Id } from "@convex/_generated/dataModel"
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FeatureLayout } from "@/frontend/shared/ui/layout/feature-layout"
import {
  ShoppingCart,
  FileText,
  Receipt,
  CreditCard,
  TrendingUp,
  Plus,
  Filter,
  Download,
  Eye,
} from 'lucide-react'
import { SalesHeader } from "./SalesHeader"

// Import sub-components (will be created)
import QuotesOverview from './quotes/QuotesOverview'
import InvoicesOverview from './invoices/InvoicesOverview'
import PaymentsOverview from './payments/PaymentsOverview'

interface SalesPageProps {
  workspaceId?: Id<"workspaces"> | null
}

export default function SalesPage({ workspaceId }: SalesPageProps) {
  const [activeTab, setActiveTab] = useState('overview')

  // Quick stats (will be fetched from API)
  const stats = {
    totalRevenue: 0,
    totalInvoices: 0,
    outstandingAmount: 0,
    thisMonthRevenue: 0,
  }

  if (!workspaceId) {
    return (
      <FeatureLayout featureId="sales" centered>
        <div className="text-center">
          <h2 className="text-xl font-semibold">No Workspace Selected</h2>
          <p className="mt-2 text-muted-foreground">
            Please select a workspace to view Sales & Invoicing
          </p>
        </div>
      </FeatureLayout>
    )
  }

  return (
    <FeatureLayout featureId="sales" padding={false}>
      <SalesHeader />

      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+12.5%</span> from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalInvoices}</div>
                <p className="text-xs text-muted-foreground">
                  {Math.floor(stats.totalInvoices * 0.3)} pending
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
                <Receipt className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.outstandingAmount.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-red-600">+5.2%</span> from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Month</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.thisMonthRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  85% of target achieved
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="quotes">
                Quotes
                <Badge variant="secondary" className="ml-2">12</Badge>
              </TabsTrigger>
              <TabsTrigger value="invoices">
                Invoices
                <Badge variant="secondary" className="ml-2">48</Badge>
              </TabsTrigger>
              <TabsTrigger value="payments">
                Payments
                <Badge variant="secondary" className="ml-2">36</Badge>
              </TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {/* Quick Overview */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Recent Invoices */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Recent Invoices</CardTitle>
                      <Button variant="ghost" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        View All
                      </Button>
                    </div>
                    <CardDescription>
                      Latest invoices and their payment status
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="space-y-1">
                            <p className="font-medium">INV-2025-{String(100 + i).padStart(3, '0')}</p>
                            <p className="text-sm text-muted-foreground">Client Name</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${(1000 * i).toLocaleString()}</p>
                            <Badge variant={i <= 2 ? 'default' : 'secondary'}>
                              {i <= 2 ? 'Paid' : 'Pending'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>
                      Common sales operations
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full justify-start" variant="outline">
                      <FileText className="mr-2 h-4 w-4" />
                      Create Quote
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Receipt className="mr-2 h-4 w-4" />
                      Create Invoice
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Record Payment
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      View Reports
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Latest sales-related activities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { action: 'Invoice INV-2025-102 paid', time: '2 hours ago' },
                      { action: 'Quote Q-2025-045 converted to invoice', time: '4 hours ago' },
                      { action: 'New customer added', time: '6 hours ago' },
                      { action: 'Payment received for INV-2025-098', time: '1 day ago' },
                    ].map((activity, i) => (
                      <div key={i} className="flex items-center space-x-4 text-sm">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        <span>{activity.action}</span>
                        <span className="text-muted-foreground ml-auto">{activity.time}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="quotes">
              <QuotesOverview workspaceId={workspaceId} />
            </TabsContent>

            <TabsContent value="invoices">
              <InvoicesOverview workspaceId={workspaceId} />
            </TabsContent>

            <TabsContent value="payments">
              <PaymentsOverview workspaceId={workspaceId} />
            </TabsContent>

            <TabsContent value="analytics">
              <Card>
                <CardHeader>
                  <CardTitle>Sales Analytics</CardTitle>
                  <CardDescription>
                    Comprehensive sales analytics and insights
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Analytics Dashboard</h3>
                    <p className="text-muted-foreground mb-4">
                      View sales trends, performance metrics, and forecasts
                    </p>
                    <Button variant="outline">View Basic Reports</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </FeatureLayout>
  )
}
