"use client"

import React, { useState } from "react"
import {
    Activity,
    Shield,
    Users,
    AlertTriangle,
    Search,
    Filter,
    Download,
    Terminal,
    CheckCircle,
    XCircle,
    Clock
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import type { AuditLogData } from "../types"

interface AuditLogDashboardProps {
    data: AuditLogData
    isLoading?: boolean
}

export default function AuditLogDashboard({ data, isLoading }: AuditLogDashboardProps) {
    const [activeTab, setActiveTab] = useState("live")

    if (isLoading) {
        return <div className="p-8 text-center text-muted-foreground">Loading audit logs...</div>
    }

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.stats.totalEvents.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            Last 24 hours
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Critical</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{data.stats.criticalEvents}</div>
                        <p className="text-xs text-muted-foreground">
                            Security alerts
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                        <Users className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.stats.activeUsers}</div>
                        <p className="text-xs text-muted-foreground">
                            Performed actions
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">System Health</CardTitle>
                        <Shield className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{data.stats.systemHealth}</div>
                        <p className="text-xs text-muted-foreground">
                            All systems operational
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 flex-1 max-w-sm">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search logs..." className="pl-8" />
                        </div>
                        <Button variant="outline" size="icon"><Filter className="h-4 w-4" /></Button>
                    </div>
                    <Button variant="outline"><Download className="h-4 w-4 mr-2" /> Export Logs</Button>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="live">Live Feed</TabsTrigger>
                        <TabsTrigger value="security">Security</TabsTrigger>
                        <TabsTrigger value="system">System</TabsTrigger>
                    </TabsList>

                    <TabsContent value="live" className="space-y-4">
                        <Card>
                            <CardHeader className="py-3 px-4 border-b bg-muted/30">
                                <div className="grid grid-cols-12 text-xs font-semibold text-muted-foreground uppercase">
                                    <div className="col-span-2">Time</div>
                                    <div className="col-span-2">Status</div>
                                    <div className="col-span-3">Action</div>
                                    <div className="col-span-2">Actor</div>
                                    <div className="col-span-3">Target</div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y">
                                    {data.recentEvents.map((event) => (
                                        <div key={event.id} className="grid grid-cols-12 items-center p-4 text-sm hover:bg-muted/50 transition-colors font-mono">
                                            <div className="col-span-2 text-muted-foreground">{event.timestamp}</div>
                                            <div className="col-span-2">
                                                <Badge variant={
                                                    event.status === 'success' ? 'outline' :
                                                        event.status === 'warning' ? 'secondary' : 'destructive'
                                                } className="bg-transparent">
                                                    {event.status === 'success' && <CheckCircle className="h-3 w-3 mr-1 text-green-500" />}
                                                    {event.status === 'failure' && <XCircle className="h-3 w-3 mr-1 text-red-500" />}
                                                    {event.status === 'warning' && <AlertTriangle className="h-3 w-3 mr-1 text-orange-500" />}
                                                    {event.status}
                                                </Badge>
                                            </div>
                                            <div className="col-span-3 font-medium">{event.action}</div>
                                            <div className="col-span-2 flex items-center gap-1.5">
                                                <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center text-xs text-blue-700">
                                                    {event.actor.charAt(0)}
                                                </div>
                                                {event.actor}
                                            </div>
                                            <div className="col-span-3 text-muted-foreground truncate">{event.target}</div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="security">
                        <div className="py-12 text-center border rounded-lg bg-muted/10">
                            <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                            <p className="font-medium text-foreground">Security Events</p>
                            <p className="text-sm text-muted-foreground">Filter events by security-related actions</p>
                        </div>
                    </TabsContent>

                    <TabsContent value="system">
                        <div className="py-12 text-center border rounded-lg bg-muted/10">
                            <Terminal className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                            <p className="font-medium text-foreground">System Logs</p>
                            <p className="text-sm text-muted-foreground">View system-level events and operations</p>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
