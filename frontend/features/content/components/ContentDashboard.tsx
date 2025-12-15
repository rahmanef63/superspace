"use client"

import React, { useState } from "react"
import {
    FileText,
    Image as ImageIcon,
    Video,
    Globe,
    Search,
    Filter,
    Plus,
    MoreHorizontal,
    Eye,
    Edit3,
    Calendar,
    CheckCircle
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import type { ContentData } from "../types"

interface ContentDashboardProps {
    data: ContentData
    isLoading?: boolean
}

export default function ContentDashboard({ data, isLoading }: ContentDashboardProps) {
    const [activeTab, setActiveTab] = useState("all")

    if (isLoading) {
        return <div className="p-8 text-center text-muted-foreground">Loading content data...</div>
    }

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.stats.totalItems}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Published</CardTitle>
                        <Globe className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{data.stats.published}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Drafts</CardTitle>
                        <Edit3 className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{data.stats.drafts}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                        <Eye className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{data.stats.views.toLocaleString()}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 flex-1 max-w-sm">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search content..." className="pl-8" />
                        </div>
                        <Button variant="outline" size="icon"><Filter className="h-4 w-4" /></Button>
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="all">All Content</TabsTrigger>
                        <TabsTrigger value="published">Published</TabsTrigger>
                        <TabsTrigger value="drafts">Drafts</TabsTrigger>
                        <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="space-y-4">
                        <Card>
                            <CardHeader className="p-0"></CardHeader>
                            <CardContent className="p-0">
                                <div className="rounded-md border">
                                    <div className="grid grid-cols-12 gap-4 p-4 border-b bg-muted/50 font-medium text-sm">
                                        <div className="col-span-6">Title</div>
                                        <div className="col-span-2">Author</div>
                                        <div className="col-span-2">Status</div>
                                        <div className="col-span-2 text-right">Views</div>
                                    </div>
                                    {data.recentContent.map((item) => (
                                        <div key={item.id} className="grid grid-cols-12 gap-4 p-4 border-b last:border-0 hover:bg-muted/50 transition-colors items-center text-sm">
                                            <div className="col-span-6 flex items-center gap-3">
                                                <div className="p-2 bg-muted rounded">
                                                    {item.type === 'article' ? <FileText className="h-4 w-4" /> :
                                                        item.type === 'image' ? <ImageIcon className="h-4 w-4" /> :
                                                            item.type === 'video' ? <Video className="h-4 w-4" /> :
                                                                <Globe className="h-4 w-4" />}
                                                </div>
                                                <div>
                                                    <p className="font-medium">{item.title}</p>
                                                    <p className="text-xs text-muted-foreground capitalize">{item.type} • {item.publishedAt || 'Not published'}</p>
                                                </div>
                                            </div>
                                            <div className="col-span-2">{item.author}</div>
                                            <div className="col-span-2">
                                                <Badge variant={
                                                    item.status === 'published' ? 'default' :
                                                        item.status === 'draft' ? 'secondary' : 'outline'
                                                } className="capitalize">
                                                    {item.status}
                                                </Badge>
                                            </div>
                                            <div className="col-span-2 text-right font-medium">
                                                {item.views.toLocaleString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Other tabs would filter the list, but for now we just show placeholders or reuse the list if we implemented filtering logic */}
                    <TabsContent value="published">
                        <div className="py-8 text-center text-muted-foreground">No published content yet</div>
                    </TabsContent>
                    <TabsContent value="drafts">
                        <div className="py-8 text-center text-muted-foreground">No drafts available</div>
                    </TabsContent>
                    <TabsContent value="scheduled">
                        <div className="py-8 text-center text-muted-foreground">No scheduled content</div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
