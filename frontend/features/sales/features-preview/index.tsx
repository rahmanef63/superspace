/**
 * Sales Feature Preview
 * 
 * Uses the REAL SalesPage layout with mock data
 * showing quotes, invoices, payments, and revenue stats
 */

"use client"

import * as React from 'react'
import { useState } from 'react'
import {
    ShoppingCart,
    FileText,
    Receipt,
    CreditCard,
    TrendingUp,
    Plus,
    Filter,
    Download,
    Eye
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { defineFeaturePreview } from '@/frontend/shared/preview'
import type { FeaturePreviewProps } from '@/frontend/shared/preview'

interface SalesMockData {
    stats: {
        totalRevenue: number
        totalInvoices: number
        outstandingAmount: number
        thisMonthRevenue: number
    }
    recentInvoices: Array<{
        id: string
        client: string
        amount: number
        status: 'paid' | 'pending' | 'overdue'
    }>
}

function SalesPreview({ mockData, compact, interactive }: FeaturePreviewProps) {
    const data = mockData.data as unknown as SalesMockData
    const [activeTab, setActiveTab] = useState('overview')

    if (compact) {
        return (
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ShoppingCart className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Sales</span>
                    </div>
                    <Badge variant="secondary">${(data.stats.totalRevenue / 1000).toFixed(0)}k</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-green-500/10 rounded-md text-center">
                        <p className="text-lg font-bold text-green-600">{data.stats.totalInvoices}</p>
                        <p className="text-[10px] text-muted-foreground">Invoices</p>
                    </div>
                    <div className="p-2 bg-orange-500/10 rounded-md text-center">
                        <p className="text-lg font-bold text-orange-600">${(data.stats.outstandingAmount / 1000).toFixed(0)}k</p>
                        <p className="text-[10px] text-muted-foreground">Outstanding</p>
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
                    <ShoppingCart className="h-5 w-5 text-primary" />
                    <div>
                        <h2 className="font-semibold">Sales & Invoicing</h2>
                        <p className="text-xs text-muted-foreground">Manage quotes, invoices, and payments</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8" disabled={!interactive}>
                        <Filter className="h-4 w-4" />
                    </Button>
                    <Button size="sm" className="gap-2" disabled={!interactive}>
                        <Plus className="h-4 w-4" />
                        New Invoice
                    </Button>
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-6 space-y-6">
                    {/* Stats Grid */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">${data.stats.totalRevenue.toLocaleString()}</div>
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
                                <div className="text-2xl font-bold">{data.stats.totalInvoices}</div>
                                <p className="text-xs text-muted-foreground">
                                    {Math.floor(data.stats.totalInvoices * 0.3)} pending
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
                                <Receipt className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">${data.stats.outstandingAmount.toLocaleString()}</div>
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
                                <div className="text-2xl font-bold">${data.stats.thisMonthRevenue.toLocaleString()}</div>
                                <p className="text-xs text-muted-foreground">85% of target</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Tabs */}
                    <Tabs value={activeTab} onValueChange={(v) => interactive && setActiveTab(v)}>
                        <TabsList>
                            <TabsTrigger value="overview" disabled={!interactive}>Overview</TabsTrigger>
                            <TabsTrigger value="quotes" disabled={!interactive}>
                                Quotes <Badge variant="secondary" className="ml-1 text-xs">12</Badge>
                            </TabsTrigger>
                            <TabsTrigger value="invoices" disabled={!interactive}>
                                Invoices <Badge variant="secondary" className="ml-1 text-xs">{data.stats.totalInvoices}</Badge>
                            </TabsTrigger>
                            <TabsTrigger value="payments" disabled={!interactive}>Payments</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="mt-4 space-y-4">
                            <div className="grid gap-4 md:grid-cols-3">
                                {/* Recent Invoices */}
                                <Card className="md:col-span-2">
                                    <CardHeader>
                                        <div className="flex justify-between items-center">
                                            <CardTitle className="text-base">Recent Invoices</CardTitle>
                                            <Button variant="ghost" size="sm" disabled={!interactive}>
                                                <Eye className="mr-2 h-4 w-4" />
                                                View All
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {data.recentInvoices.map((invoice) => (
                                                <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                    <div>
                                                        <p className="font-medium text-sm">{invoice.id}</p>
                                                        <p className="text-xs text-muted-foreground">{invoice.client}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-medium text-sm">${invoice.amount.toLocaleString()}</p>
                                                        <Badge variant={invoice.status === 'paid' ? 'default' : invoice.status === 'overdue' ? 'destructive' : 'secondary'}>
                                                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
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
                                        <CardTitle className="text-base">Quick Actions</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <Button variant="outline" className="w-full justify-start" disabled={!interactive}>
                                            <FileText className="mr-2 h-4 w-4" /> Create Quote
                                        </Button>
                                        <Button variant="outline" className="w-full justify-start" disabled={!interactive}>
                                            <Receipt className="mr-2 h-4 w-4" /> Create Invoice
                                        </Button>
                                        <Button variant="outline" className="w-full justify-start" disabled={!interactive}>
                                            <CreditCard className="mr-2 h-4 w-4" /> Record Payment
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {['quotes', 'invoices', 'payments'].map((tab) => (
                            <TabsContent key={tab} value={tab} className="mt-4">
                                <Card>
                                    <CardContent className="p-6 text-center text-muted-foreground">
                                        <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                        <p className="font-medium capitalize">{tab} Management</p>
                                        <p className="text-sm">Manage your {tab} here</p>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        ))}
                    </Tabs>
                </div>
            </ScrollArea>
        </div>
    )
}

export default defineFeaturePreview({
    featureId: 'sales',
    name: 'Sales & Invoicing',
    description: 'Manage quotes, invoices, and payments',
    component: SalesPreview,
    category: 'business',
    tags: ['sales', 'invoices', 'quotes', 'payments', 'revenue'],
    mockDataSets: [
        {
            id: 'default',
            name: 'Sales Dashboard',
            description: 'Sample sales data with invoices',
            data: {
                stats: {
                    totalRevenue: 485000,
                    totalInvoices: 156,
                    outstandingAmount: 45000,
                    thisMonthRevenue: 68000,
                },
                recentInvoices: [
                    { id: 'INV-2025-102', client: 'Acme Corp', amount: 12500, status: 'paid' },
                    { id: 'INV-2025-101', client: 'TechStart Inc', amount: 8750, status: 'paid' },
                    { id: 'INV-2025-100', client: 'Global Services', amount: 15000, status: 'pending' },
                    { id: 'INV-2025-099', client: 'Innovation Lab', amount: 6200, status: 'overdue' },
                ],
            },
        },
    ],
})
