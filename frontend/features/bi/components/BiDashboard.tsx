"use client"

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BiData, BiMetric } from "../types";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    Legend
} from 'recharts';
import { ArrowUpRight, ArrowDownRight, TrendingUp, Users, DollarSign, Activity } from "lucide-react";

interface BiDashboardProps {
    data: BiData;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export const BiDashboard: React.FC<BiDashboardProps> = ({ data }) => {
    const { metrics, revenueHistory, userGrowth, deviceUsage, isLoading } = data;

    if (isLoading) {
        return <div className="p-8 text-center text-muted-foreground">Loading Analytics...</div>;
    }

    const renderMetricCard = (metric: BiMetric, icon: React.ReactNode) => (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.label}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                    {metric.trend === 'up' ? (
                        <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                    ) : metric.trend === 'down' ? (
                        <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                    ) : (
                        <Activity className="h-4 w-4 text-yellow-500 mr-1" />
                    )}
                    <span className={metric.trend === 'up' ? 'text-green-500' : metric.trend === 'down' ? 'text-red-500' : ''}>
                        {Math.abs(metric.change)}%
                    </span>
                    <span className="ml-1">from last {metric.period}</span>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-6">
            {/* Metrics Row */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {renderMetricCard(metrics.revenue, <DollarSign className="h-4 w-4 text-muted-foreground" />)}
                {renderMetricCard(metrics.activeUsers, <Users className="h-4 w-4 text-muted-foreground" />)}
                {renderMetricCard(metrics.conversionRate, <TrendingUp className="h-4 w-4 text-muted-foreground" />)}
                {renderMetricCard(metrics.churnRate, <Activity className="h-4 w-4 text-muted-foreground" />)}
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="users">User Growth</TabsTrigger>
                    <TabsTrigger value="revenue">Revenue</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        {/* Main Revenue Chart */}
                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>Revenue Over Time</CardTitle>
                                <CardDescription>
                                    Monthly revenue performance for the current year.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pl-2">
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={revenueHistory} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                                            <Tooltip />
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                            <Area type="monotone" dataKey="value" stroke="#8884d8" fillOpacity={1} fill="url(#colorRevenue)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Device Usage Pie Chart */}
                        <Card className="col-span-3">
                            <CardHeader>
                                <CardTitle>Device Usage</CardTitle>
                                <CardDescription>
                                    Distribution of users by device type.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={deviceUsage}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {deviceUsage.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="users" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>User Growth</CardTitle>
                            <CardDescription>New vs Returning Users</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[400px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={userGrowth}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="value" name="New Users" fill="#8884d8" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="secondaryValue" name="Returning Users" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="revenue" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Detailed Revenue Analysis</CardTitle>
                            <CardDescription>Comparative revenue trends</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[400px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={revenueHistory}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="value" stroke="#82ca9d" name="This Year" strokeWidth={2} />
                                        <Line type="monotone" dataKey="secondaryValue" stroke="#ff7300" name="Last Year" strokeWidth={2} strokeDasharray="5 5" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};
