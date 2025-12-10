"use client"

import React, { useState } from "react"
import {
    CheckCircle,
    XCircle,
    Clock,
    FileText,
    Search,
    Filter,
    MoreHorizontal,
    Check,
    X,
    AlertCircle
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { ApprovalsData } from "../types"

interface ApprovalsDashboardProps {
    data: ApprovalsData
    isLoading?: boolean
}

export default function ApprovalsDashboard({ data, isLoading }: ApprovalsDashboardProps) {
    const [activeTab, setActiveTab] = useState("overview")

    if (isLoading) {
        return <div className="p-8 text-center text-muted-foreground">Loading approvals data...</div>
    }

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                        <Clock className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{data.stats.pending}</div>
                        <p className="text-xs text-muted-foreground">
                            Requests awaiting action
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Approved</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{data.stats.approved}</div>
                        <p className="text-xs text-muted-foreground">
                            Total approved requests
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                        <XCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{data.stats.rejected}</div>
                        <p className="text-xs text-muted-foreground">
                            Total rejected requests
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Review Time</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.stats.avgTime}</div>
                        <p className="text-xs text-muted-foreground">
                            Per request
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    {/* Recent Requests List */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Recent Requests</CardTitle>
                                <Button variant="ghost" size="sm">View All</Button>
                            </div>
                            <CardDescription>Latest approval requests across departments</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {data.recentRequests.map((request) => (
                                    <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors">
                                        <div className="flex items-start gap-4">
                                            <div className={`p-2 rounded-full ${request.priority === 'high' ? 'bg-red-100 text-red-600' :
                                                    request.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                                                        'bg-blue-100 text-blue-600'
                                                }`}>
                                                <FileText className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-semibold">{request.title}</p>
                                                    <Badge variant="outline" className="text-[10px]">{request.type}</Badge>
                                                    {request.priority === 'high' && (
                                                        <Badge variant="destructive" className="text-[10px] h-5">High Priority</Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    Requested by <span className="font-medium text-foreground">{request.requester}</span> • {request.department} • {request.date}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {request.status === 'pending' ? (
                                                <>
                                                    <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700 hover:bg-green-50">
                                                        <Check className="h-4 w-4 mr-1" /> Approve
                                                    </Button>
                                                    <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                                        <X className="h-4 w-4 mr-1" /> Reject
                                                    </Button>
                                                </>
                                            ) : (
                                                <Badge variant={
                                                    request.status === 'approved' ? 'default' : 'destructive'
                                                }>
                                                    {request.status}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="pending">
                    <Card>
                        <CardHeader>
                            <CardTitle>Needs Your Review</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-12 text-muted-foreground">
                                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                <p>Detailed pending list coming soon</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="history">
                    <Card>
                        <CardHeader>
                            <CardTitle>Approval History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-12 text-muted-foreground">
                                <Clock className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                <p>Archived approvals view coming soon</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
