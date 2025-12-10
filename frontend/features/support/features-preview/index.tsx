/**
 * Support Feature Preview
 * 
 * Shows the support dashboard with tickets,
 * knowledge base, and customer conversations
 */

"use client"

import * as React from 'react'
import { useState } from 'react'
import {
    Headphones,
    MessageSquare,
    BookOpen,
    Users,
    Plus,
    Search,
    Filter,
    Clock,
    CheckCircle2,
    AlertCircle,
    XCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { defineFeaturePreview } from '@/frontend/shared/preview'
import type { FeaturePreviewProps } from '@/frontend/shared/preview'

interface Ticket {
    id: string
    subject: string
    customer: string
    status: 'open' | 'pending' | 'resolved' | 'closed'
    priority: 'low' | 'medium' | 'high'
    createdAt: string
}

interface SupportMockData {
    stats: { open: number; pending: number; resolved: number; avgResponse: string }
    tickets: Ticket[]
}

function SupportPreview({ mockData, compact, interactive }: FeaturePreviewProps) {
    const data = mockData.data as unknown as SupportMockData
    const [activeTab, setActiveTab] = useState('tickets')
    const [selectedTicket, setSelectedTicket] = useState<string | null>(null)

    const getStatusIcon = (status: Ticket['status']) => {
        switch (status) {
            case 'open': return <AlertCircle className="h-4 w-4 text-blue-500" />
            case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />
            case 'resolved': return <CheckCircle2 className="h-4 w-4 text-green-500" />
            case 'closed': return <XCircle className="h-4 w-4 text-muted-foreground" />
        }
    }

    const getStatusBadge = (status: Ticket['status']) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
            open: 'default',
            pending: 'secondary',
            resolved: 'outline',
            closed: 'outline',
        }
        return variants[status] || 'secondary'
    }

    if (compact) {
        return (
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Headphones className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Support</span>
                    </div>
                    <Badge variant="secondary">{data.stats.open} open</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-blue-500/10 rounded-md text-center">
                        <p className="text-lg font-bold text-blue-600">{data.stats.open}</p>
                        <p className="text-[10px] text-muted-foreground">Open</p>
                    </div>
                    <div className="p-2 bg-green-500/10 rounded-md text-center">
                        <p className="text-lg font-bold text-green-600">{data.stats.resolved}</p>
                        <p className="text-[10px] text-muted-foreground">Resolved</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex h-full border rounded-xl overflow-hidden bg-background">
            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b bg-card">
                    <div className="flex items-center gap-3">
                        <Headphones className="h-5 w-5 text-primary" />
                        <div>
                            <h2 className="font-semibold">Support</h2>
                            <p className="text-xs text-muted-foreground">Manage tickets and conversations</p>
                        </div>
                    </div>
                    <Button size="sm" className="gap-2" disabled={!interactive}>
                        <Plus className="h-4 w-4" />
                        New Ticket
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4 p-4 border-b bg-muted/20">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-blue-500">{data.stats.open}</p>
                        <p className="text-xs text-muted-foreground">Open</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-yellow-500">{data.stats.pending}</p>
                        <p className="text-xs text-muted-foreground">Pending</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-green-500">{data.stats.resolved}</p>
                        <p className="text-xs text-muted-foreground">Resolved</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold">{data.stats.avgResponse}</p>
                        <p className="text-xs text-muted-foreground">Avg Response</p>
                    </div>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={(v) => interactive && setActiveTab(v)} className="flex-1 flex flex-col">
                    <div className="px-4 border-b">
                        <TabsList className="h-10">
                            <TabsTrigger value="tickets" disabled={!interactive}>
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Tickets
                            </TabsTrigger>
                            <TabsTrigger value="kb" disabled={!interactive}>
                                <BookOpen className="h-4 w-4 mr-2" />
                                Knowledge Base
                            </TabsTrigger>
                            <TabsTrigger value="customers" disabled={!interactive}>
                                <Users className="h-4 w-4 mr-2" />
                                Customers
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="tickets" className="flex-1 m-0">
                        <div className="p-4">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="Search tickets..." className="pl-8 h-9" disabled={!interactive} />
                                </div>
                                <Button variant="outline" size="icon" className="h-9 w-9" disabled={!interactive}>
                                    <Filter className="h-4 w-4" />
                                </Button>
                            </div>
                            <ScrollArea className="h-[calc(100%-60px)]">
                                <div className="space-y-2">
                                    {data.tickets.map((ticket) => (
                                        <div
                                            key={ticket.id}
                                            className={cn(
                                                "flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer",
                                                selectedTicket === ticket.id ? "bg-primary/5 border-primary" : "hover:bg-muted/50"
                                            )}
                                            onClick={() => interactive && setSelectedTicket(ticket.id)}
                                        >
                                            {getStatusIcon(ticket.status)}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium text-sm truncate">{ticket.subject}</p>
                                                    <Badge variant="outline" className="text-[10px] shrink-0">
                                                        {ticket.priority}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground">{ticket.customer} • {ticket.createdAt}</p>
                                            </div>
                                            <Badge variant={getStatusBadge(ticket.status)} className="shrink-0">
                                                {ticket.status}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    </TabsContent>

                    <TabsContent value="kb" className="flex-1 m-0 p-4">
                        <div className="text-center text-muted-foreground py-12">
                            <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                            <p className="font-medium">Knowledge Base</p>
                            <p className="text-sm">Create and manage help articles</p>
                        </div>
                    </TabsContent>

                    <TabsContent value="customers" className="flex-1 m-0 p-4">
                        <div className="text-center text-muted-foreground py-12">
                            <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                            <p className="font-medium">Customer Management</p>
                            <p className="text-sm">View and manage customer profiles</p>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}

export default defineFeaturePreview({
    featureId: 'support',
    name: 'Support',
    description: 'Manage support tickets and customer conversations',
    component: SupportPreview,
    category: 'communication',
    tags: ['support', 'tickets', 'helpdesk', 'customer-service'],
    mockDataSets: [
        {
            id: 'default',
            name: 'Support Dashboard',
            description: 'Sample support tickets',
            data: {
                stats: { open: 12, pending: 8, resolved: 45, avgResponse: '2h' },
                tickets: [
                    { id: '1', subject: 'Cannot login to my account', customer: 'John Smith', status: 'open', priority: 'high', createdAt: '10 min ago' },
                    { id: '2', subject: 'Billing question about subscription', customer: 'Sarah Johnson', status: 'pending', priority: 'medium', createdAt: '1 hour ago' },
                    { id: '3', subject: 'Feature request: Dark mode', customer: 'Mike Brown', status: 'open', priority: 'low', createdAt: '2 hours ago' },
                    { id: '4', subject: 'Integration not working', customer: 'Emily Davis', status: 'resolved', priority: 'high', createdAt: 'Yesterday' },
                    { id: '5', subject: 'How to export data?', customer: 'Chris Wilson', status: 'closed', priority: 'low', createdAt: '2 days ago' },
                ],
            },
        },
    ],
})
