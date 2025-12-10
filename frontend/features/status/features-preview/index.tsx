/**
 * Status Feature Preview
 * 
 * Shows system status monitoring with
 * service health, incidents, and uptime
 */

"use client"

import * as React from 'react'
import { useState } from 'react'
import {
    Activity,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    Clock,
    Server,
    Database,
    Globe,
    Zap,
    RefreshCw
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { defineFeaturePreview } from '@/frontend/shared/preview'
import type { FeaturePreviewProps } from '@/frontend/shared/preview'

interface Service {
    id: string
    name: string
    status: 'operational' | 'degraded' | 'outage' | 'maintenance'
    uptime: number
    latency: number
}

interface Incident {
    id: string
    title: string
    status: 'investigating' | 'identified' | 'monitoring' | 'resolved'
    time: string
    impact: 'minor' | 'major' | 'critical'
}

interface StatusMockData {
    overall: 'operational' | 'degraded' | 'outage'
    services: Service[]
    incidents: Incident[]
    uptime: { day: number; week: number; month: number }
}

function StatusPreview({ mockData, compact, interactive }: FeaturePreviewProps) {
    const data = mockData.data as unknown as StatusMockData

    const getStatusColor = (status: Service['status']) => {
        switch (status) {
            case 'operational': return 'text-green-500 bg-green-500'
            case 'degraded': return 'text-yellow-500 bg-yellow-500'
            case 'outage': return 'text-red-500 bg-red-500'
            case 'maintenance': return 'text-blue-500 bg-blue-500'
        }
    }

    const getStatusIcon = (status: Service['status']) => {
        switch (status) {
            case 'operational': return <CheckCircle2 className="h-4 w-4 text-green-500" />
            case 'degraded': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
            case 'outage': return <XCircle className="h-4 w-4 text-red-500" />
            case 'maintenance': return <Clock className="h-4 w-4 text-blue-500" />
        }
    }

    const getServiceIcon = (name: string) => {
        if (name.includes('API')) return Server
        if (name.includes('Database')) return Database
        if (name.includes('CDN') || name.includes('Website')) return Globe
        return Zap
    }

    const getOverallStatus = () => {
        switch (data.overall) {
            case 'operational': return { text: 'All Systems Operational', color: 'bg-green-500', icon: CheckCircle2 }
            case 'degraded': return { text: 'Partial System Outage', color: 'bg-yellow-500', icon: AlertTriangle }
            case 'outage': return { text: 'Major System Outage', color: 'bg-red-500', icon: XCircle }
        }
    }

    const overall = getOverallStatus()

    if (compact) {
        return (
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Status</span>
                    </div>
                    <Badge variant="secondary" className="gap-1">
                        <div className={cn("w-2 h-2 rounded-full", overall.color)} />
                        {data.overall === 'operational' ? 'All Good' : data.overall}
                    </Badge>
                </div>
                <div className="text-center p-2 bg-muted/50 rounded-md">
                    <p className="text-lg font-bold">{data.uptime.month}%</p>
                    <p className="text-[10px] text-muted-foreground">30-day uptime</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full border rounded-xl overflow-hidden bg-background">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b bg-card">
                <div className="flex items-center gap-3">
                    <Activity className="h-5 w-5 text-primary" />
                    <div>
                        <h2 className="font-semibold">System Status</h2>
                        <p className="text-xs text-muted-foreground">Monitor service health and incidents</p>
                    </div>
                </div>
                <Button variant="outline" size="sm" className="gap-2" disabled={!interactive}>
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                </Button>
            </div>

            {/* Overall Status Banner */}
            <div className={cn("px-6 py-4 flex items-center gap-3", overall.color.replace('bg-', 'bg-') + '/10')}>
                <overall.icon className={cn("h-6 w-6", overall.color.replace('bg-', 'text-'))} />
                <div>
                    <p className="font-semibold">{overall.text}</p>
                    <p className="text-sm text-muted-foreground">Last updated: Just now</p>
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-6 space-y-6">
                    {/* Uptime Stats */}
                    <div className="grid gap-4 md:grid-cols-3">
                        {[
                            { label: '24 Hours', value: data.uptime.day },
                            { label: '7 Days', value: data.uptime.week },
                            { label: '30 Days', value: data.uptime.month },
                        ].map((stat) => (
                            <Card key={stat.label}>
                                <CardContent className="pt-4">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold">{stat.value}%</p>
                                        <p className="text-sm text-muted-foreground">{stat.label} Uptime</p>
                                        <Progress value={stat.value} className="h-1.5 mt-2" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Services */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Services</CardTitle>
                            <CardDescription>Current status of all services</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {data.services.map((service) => {
                                    const ServiceIcon = getServiceIcon(service.name)
                                    const colorClass = getStatusColor(service.status)
                                    return (
                                        <div key={service.id} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <ServiceIcon className="h-5 w-5 text-muted-foreground" />
                                                <div>
                                                    <p className="font-medium text-sm">{service.name}</p>
                                                    <p className="text-xs text-muted-foreground">{service.latency}ms latency</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm text-muted-foreground">{service.uptime}%</span>
                                                <div className="flex items-center gap-1.5">
                                                    <div className={cn("w-2 h-2 rounded-full", colorClass.split(' ')[1])} />
                                                    <span className={cn("text-sm font-medium capitalize", colorClass.split(' ')[0])}>
                                                        {service.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Incidents */}
                    {data.incidents.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Recent Incidents</CardTitle>
                                <CardDescription>Past incidents and their status</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {data.incidents.map((incident) => (
                                        <div key={incident.id} className="p-3 border rounded-lg">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="font-medium text-sm">{incident.title}</p>
                                                    <p className="text-xs text-muted-foreground">{incident.time}</p>
                                                </div>
                                                <Badge variant={incident.status === 'resolved' ? 'outline' : 'secondary'}>
                                                    {incident.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </ScrollArea>
        </div>
    )
}

export default defineFeaturePreview({
    featureId: 'status',
    name: 'Status',
    description: 'Monitor system health and service status',
    component: StatusPreview,
    category: 'operations',
    tags: ['status', 'uptime', 'monitoring', 'incidents', 'health'],
    mockDataSets: [
        {
            id: 'default',
            name: 'System Status',
            description: 'Sample status page with services',
            data: {
                overall: 'operational',
                uptime: { day: 100, week: 99.9, month: 99.8 },
                services: [
                    { id: '1', name: 'API Server', status: 'operational', uptime: 99.9, latency: 45 },
                    { id: '2', name: 'Database Cluster', status: 'operational', uptime: 99.99, latency: 12 },
                    { id: '3', name: 'CDN / Assets', status: 'operational', uptime: 100, latency: 8 },
                    { id: '4', name: 'Authentication', status: 'operational', uptime: 99.95, latency: 32 },
                    { id: '5', name: 'Email Service', status: 'degraded', uptime: 98.5, latency: 156 },
                ],
                incidents: [
                    { id: '1', title: 'Email delivery delays', status: 'monitoring', time: '2 hours ago', impact: 'minor' },
                    { id: '2', title: 'API latency spike', status: 'resolved', time: 'Yesterday', impact: 'minor' },
                ],
            },
        },
    ],
})
