"use client"

import React, { useState } from "react"
import {
    Users,
    UserPlus,
    Calendar,
    Briefcase,
    Building,
    MoreHorizontal,
    Search,
    Filter,
    CheckCircle,
    XCircle,
    Clock
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { HrData } from "../types"

interface HrDashboardProps {
    data: HrData
    isLoading?: boolean
}

export default function HrDashboard({ data, isLoading }: HrDashboardProps) {
    const [activeTab, setActiveTab] = useState("overview")

    if (isLoading) {
        return <div className="p-8 text-center text-muted-foreground">Loading HR data...</div>
    }

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.stats.totalEmployees}</div>
                        <p className="text-xs text-muted-foreground">
                            Across {data.stats.departmentCount} departments
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">On Leave</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.stats.onLeave}</div>
                        <p className="text-xs text-muted-foreground">
                            Employees currently away
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Open Positions</CardTitle>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{data.stats.openPositions}</div>
                        <p className="text-xs text-muted-foreground">
                            Active job listings
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">New Hires</CardTitle>
                        <UserPlus className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{data.stats.newHires}</div>
                        <p className="text-xs text-muted-foreground">
                            Joined this month
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="employees">Employees</TabsTrigger>
                    <TabsTrigger value="leave">Leave Requests</TabsTrigger>
                    <TabsTrigger value="recruitment">Recruitment</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        {/* New Hires */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Recent Hires</CardTitle>
                                    <Button variant="ghost" size="sm">View All</Button>
                                </div>
                                <CardDescription>Latest team members</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {data.recentHires.slice(0, 5).map((employee) => (
                                        <div key={employee.id} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9">
                                                    <AvatarImage src={employee.avatar} />
                                                    <AvatarFallback>{employee.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="text-sm font-medium">{employee.name}</p>
                                                    <p className="text-xs text-muted-foreground">{employee.role}</p>
                                                </div>
                                            </div>
                                            <Badge variant="outline">{employee.department}</Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Leave Requests */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Pending Leave Requests</CardTitle>
                                    <Button variant="ghost" size="sm">View All</Button>
                                </div>
                                <CardDescription>Requires approval</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {data.leaveRequests.slice(0, 5).map((request) => (
                                        <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-yellow-100 text-yellow-600 rounded-lg">
                                                    <Clock className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">{request.employee}</p>
                                                    <p className="text-xs text-muted-foreground">{request.type} • {request.dates}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600">
                                                    <CheckCircle className="h-4 w-4" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600">
                                                    <XCircle className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
                                    <UserPlus className="h-5 w-5" />
                                    <span>Add Employee</span>
                                </Button>
                                <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
                                    <Calendar className="h-5 w-5" />
                                    <span>Team Calendar</span>
                                </Button>
                                <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
                                    <Briefcase className="h-5 w-5" />
                                    <span>Post Job</span>
                                </Button>
                                <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
                                    <Building className="h-5 w-5" />
                                    <span>Departments</span>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="employees">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Employee Directory</CardTitle>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm"><Search className="h-4 w-4 mr-2" /> Search</Button>
                                    <Button variant="outline" size="sm"><Filter className="h-4 w-4 mr-2" /> Filter</Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-12">
                                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                                <p className="font-medium text-foreground">No employees yet</p>
                                <p className="text-sm text-muted-foreground">Add employees to build your team directory</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="leave">
                    <Card>
                        <CardHeader>
                            <CardTitle>Leave Management</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-12">
                                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                                <p className="font-medium text-foreground">Leave Requests</p>
                                <p className="text-sm text-muted-foreground">Manage employee time-off and leave requests</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="recruitment">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recruitment Pipeline</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-12">
                                <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                                <p className="font-medium text-foreground">Applicant Tracking</p>
                                <p className="text-sm text-muted-foreground">Track candidates through your hiring process</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
