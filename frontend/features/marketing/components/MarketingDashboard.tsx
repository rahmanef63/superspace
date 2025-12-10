"use client"

import React, { useState } from "react"
import {
    Megaphone,
    BarChart3,
    Target,
    Users,
    TrendingUp,
    Search,
    Filter,
    Plus,
    MoreHorizontal,
    Mail,
    Share2,
    Globe
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { MarketingData } from "../types"

interface MarketingDashboardProps {
    data: MarketingData
    isLoading?: boolean
}

export default function MarketingDashboard({ data, isLoading }: MarketingDashboardProps) {
    const [activeTab, setActiveTab] = useState("overview")

    if (isLoading) {
        return <div className="p-8 text-center text-muted-foreground">Loading marketing data...</div>
    }

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
                        <Megaphone className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.stats.activeCampaigns}</div>
                        <p className="text-xs text-muted-foreground">
                            Running across all channels
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${data.stats.spend.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            This month
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Conversions</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.stats.totalLeads}</div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-green-600 font-medium">+{data.stats.conversionRate}%</span> conversion rate
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">ROI</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{data.stats.roi}x</div>
                        <p className="text-xs text-muted-foreground">
                            Return on ad spend
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
                    <TabsTrigger value="creative">Creative</TabsTrigger>
                    <TabsTrigger value="audiences">Audiences</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    {/* Active Campaigns List */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Active Campaigns</CardTitle>
                                <Button variant="ghost" size="sm">View All</Button>
                            </div>
                            <CardDescription>Performance of currently running ads</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {data.activeCampaigns.map((campaign) => (
                                    <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors">
                                        <div className="flex items-start gap-4 flex-1">
                                            <div className={`p-2 rounded-lg ${campaign.platform === 'email' ? 'bg-blue-100 text-blue-600' :
                                                    campaign.platform === 'social' ? 'bg-purple-100 text-purple-600' :
                                                        'bg-orange-100 text-orange-600'
                                                }`}>
                                                {campaign.platform === 'email' ? <Mail className="h-5 w-5" /> :
                                                    campaign.platform === 'social' ? <Share2 className="h-5 w-5" /> :
                                                        <Globe className="h-5 w-5" />}
                                            </div>
                                            <div className="space-y-1 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-semibold">{campaign.name}</p>
                                                    <Badge variant={
                                                        campaign.status === 'active' ? 'default' : 'secondary'
                                                    } className="capitalize text-[10px] h-5">
                                                        {campaign.status}
                                                    </Badge>
                                                </div>
                                                <div className="grid grid-cols-3 gap-4 text-sm max-w-md pt-2">
                                                    <div>
                                                        <p className="text-muted-foreground text-xs">Spend</p>
                                                        <p className="font-medium">${campaign.budget}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-muted-foreground text-xs">Clicks</p>
                                                        <p className="font-medium">{campaign.clicks.toLocaleString()}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-muted-foreground text-xs">Conv.</p>
                                                        <p className="font-medium">{campaign.conversions}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right hidden md:block">
                                                <p className="text-sm font-medium">CTR</p>
                                                <p className="text-lg font-bold">
                                                    {((campaign.clicks / campaign.impressions) * 100).toFixed(1)}%
                                                </p>
                                            </div>
                                            <Button variant="ghost" size="icon">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
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
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
                                    <Plus className="h-5 w-5" />
                                    <span>New Campaign</span>
                                </Button>
                                <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
                                    <Mail className="h-5 w-5" />
                                    <span>Email Blast</span>
                                </Button>
                                <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
                                    <Share2 className="h-5 w-5" />
                                    <span>Social Post</span>
                                </Button>
                                <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
                                    <BarChart3 className="h-5 w-5" />
                                    <span>Reports</span>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="campaigns">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>All Campaigns</CardTitle>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm"><Filter className="h-4 w-4 mr-2" /> Filter</Button>
                                    <Button variant="outline" size="sm"><Plus className="h-4 w-4 mr-2" /> CREATE</Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-12 text-muted-foreground">
                                <Megaphone className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                <p>Full campaign management coming soon</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="creative">
                    <Card>
                        <CardHeader>
                            <CardTitle>Creative Assets</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-12 text-muted-foreground">
                                <Target className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                <p>Asset library coming soon</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="audiences">
                    <Card>
                        <CardHeader>
                            <CardTitle>Audience Segments</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-12 text-muted-foreground">
                                <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                <p>Audience management coming soon</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
