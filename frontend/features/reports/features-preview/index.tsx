/**
 * Reports Feature Preview
 * 
 * Shows the reports dashboard with various report types
 * and export capabilities
 */

"use client"

import * as React from 'react'
import { useState } from 'react'
import {
    BarChart3,
    FileText,
    Download,
    Calendar,
    TrendingUp,
    Users,
    DollarSign,
    Package,
    PieChart,
    LineChart,
    Table,
    Filter
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { defineFeaturePreview } from '@/frontend/shared/preview'
import type { FeaturePreviewProps } from '@/frontend/shared/preview'

interface ReportsMockData {
    stats: { generated: number; scheduled: number; favorites: number }
    reports: Array<{
        id: string
        name: string
        type: string
        lastRun: string
        format: string
    }>
}

function ReportsPreview({ mockData, compact, interactive }: FeaturePreviewProps) {
    const data = mockData.data as unknown as ReportsMockData
    const [selectedType, setSelectedType] = useState('all')

    const reportTypes = [
        { id: 'sales', name: 'Sales Reports', icon: DollarSign, color: 'text-green-500' },
        { id: 'inventory', name: 'Inventory Reports', icon: Package, color: 'text-blue-500' },
        { id: 'analytics', name: 'Analytics Reports', icon: TrendingUp, color: 'text-purple-500' },
        { id: 'users', name: 'User Reports', icon: Users, color: 'text-orange-500' },
    ]

    if (compact) {
        return (
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Reports</span>
                    </div>
                    <Badge variant="secondary">{data.stats.generated} reports</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-muted/50 rounded-md text-center">
                        <p className="text-lg font-bold">{data.stats.scheduled}</p>
                        <p className="text-[10px] text-muted-foreground">Scheduled</p>
                    </div>
                    <div className="p-2 bg-muted/50 rounded-md text-center">
                        <p className="text-lg font-bold">{data.stats.favorites}</p>
                        <p className="text-[10px] text-muted-foreground">Favorites</p>
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
                    <BarChart3 className="h-5 w-5 text-primary" />
                    <div>
                        <h2 className="font-semibold">Reports</h2>
                        <p className="text-xs text-muted-foreground">Generate and schedule reports</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Select value={selectedType} onValueChange={(v) => interactive && setSelectedType(v)} disabled={!interactive}>
                        <SelectTrigger className="w-32 h-8">
                            <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="sales">Sales</SelectItem>
                            <SelectItem value="inventory">Inventory</SelectItem>
                            <SelectItem value="analytics">Analytics</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button size="sm" className="gap-2" disabled={!interactive}>
                        <FileText className="h-4 w-4" />
                        New Report
                    </Button>
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-6 space-y-6">
                    {/* Report Types */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {reportTypes.map((type) => (
                            <Card key={type.id} className="cursor-pointer hover:shadow-md transition-shadow">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className={cn("p-2 rounded-lg bg-muted", type.color)}>
                                            <type.icon className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">{type.name}</p>
                                            <p className="text-xs text-muted-foreground">2 reports</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Recent Reports */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-base">Recent Reports</CardTitle>
                                    <CardDescription>Your recently generated reports</CardDescription>
                                </div>
                                <Button variant="outline" size="sm" disabled={!interactive}>
                                    <Calendar className="mr-2 h-4 w-4" />
                                    Schedule
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {data.reports.map((report) => (
                                    <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-md bg-muted">
                                                {report.type === 'chart' ? <PieChart className="h-4 w-4" /> : <Table className="h-4 w-4" />}
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">{report.name}</p>
                                                <p className="text-xs text-muted-foreground">Last run: {report.lastRun}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline">{report.format}</Badge>
                                            <Button variant="ghost" size="icon" className="h-8 w-8" disabled={!interactive}>
                                                <Download className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Generate */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Quick Generate</CardTitle>
                            <CardDescription>Generate common reports instantly</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                <Button variant="outline" className="justify-start" disabled={!interactive}>
                                    <LineChart className="mr-2 h-4 w-4" /> Revenue
                                </Button>
                                <Button variant="outline" className="justify-start" disabled={!interactive}>
                                    <Package className="mr-2 h-4 w-4" /> Inventory
                                </Button>
                                <Button variant="outline" className="justify-start" disabled={!interactive}>
                                    <Users className="mr-2 h-4 w-4" /> Team Activity
                                </Button>
                                <Button variant="outline" className="justify-start" disabled={!interactive}>
                                    <PieChart className="mr-2 h-4 w-4" /> Summary
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </ScrollArea>
        </div>
    )
}

export default defineFeaturePreview({
    featureId: 'reports',
    name: 'Reports',
    description: 'Generate and schedule business reports',
    component: ReportsPreview,
    category: 'analytics',
    tags: ['reports', 'analytics', 'export', 'dashboard', 'charts'],
    mockDataSets: [
        {
            id: 'default',
            name: 'Reports Dashboard',
            description: 'Sample reports with scheduling',
            data: {
                stats: { generated: 48, scheduled: 5, favorites: 8 },
                reports: [
                    { id: '1', name: 'Monthly Revenue Report', type: 'chart', lastRun: '2 hours ago', format: 'PDF' },
                    { id: '2', name: 'Inventory Status', type: 'table', lastRun: 'Yesterday', format: 'Excel' },
                    { id: '3', name: 'Team Performance', type: 'chart', lastRun: '3 days ago', format: 'PDF' },
                    { id: '4', name: 'Sales by Region', type: 'chart', lastRun: '1 week ago', format: 'PDF' },
                ],
            },
        },
    ],
})
