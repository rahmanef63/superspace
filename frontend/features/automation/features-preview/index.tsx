/**
 * Automation Feature Preview
 * 
 * Shows the automation builder interface with
 * workflow triggers, actions, and conditions
 */

"use client"

import * as React from 'react'
import { useState } from 'react'
import {
    Zap,
    Plus,
    Play,
    Pause,
    Settings,
    MoreHorizontal,
    ArrowRight,
    Clock,
    Mail,
    MessageSquare,
    Database,
    Webhook,
    GitBranch,
    CheckCircle2,
    XCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { defineFeaturePreview } from '@/frontend/shared/preview'
import type { FeaturePreviewProps } from '@/frontend/shared/preview'

interface Workflow {
    id: string
    name: string
    description: string
    trigger: string
    actions: number
    enabled: boolean
    lastRun?: string
    runs: number
}

interface AutomationMockData {
    stats: { total: number; active: number; runsToday: number; failed: number }
    workflows: Workflow[]
}

function AutomationPreview({ mockData, compact, interactive }: FeaturePreviewProps) {
    const data = mockData.data as unknown as AutomationMockData
    const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null)

    const getTriggerIcon = (trigger: string) => {
        const icons: Record<string, any> = {
            schedule: Clock,
            webhook: Webhook,
            email: Mail,
            database: Database,
            message: MessageSquare,
        }
        return icons[trigger] || Zap
    }

    if (compact) {
        return (
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Automation</span>
                    </div>
                    <Badge variant="secondary">{data.stats.total} workflows</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-green-500/10 rounded-md text-center">
                        <p className="text-lg font-bold text-green-600">{data.stats.active}</p>
                        <p className="text-[10px] text-muted-foreground">Active</p>
                    </div>
                    <div className="p-2 bg-muted/50 rounded-md text-center">
                        <p className="text-lg font-bold">{data.stats.runsToday}</p>
                        <p className="text-[10px] text-muted-foreground">Runs Today</p>
                    </div>
                </div>
            </div>
        )
    }

    const workflow = data.workflows.find(w => w.id === selectedWorkflow)

    return (
        <div className="flex h-full border rounded-xl overflow-hidden bg-background">
            {/* Workflows List */}
            <div className="w-80 border-r flex flex-col">
                <div className="p-4 border-b">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Zap className="h-5 w-5 text-primary" />
                            <h2 className="font-semibold">Automation</h2>
                        </div>
                        <Button size="sm" className="gap-1" disabled={!interactive}>
                            <Plus className="h-4 w-4" />
                            New
                        </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="p-2 bg-green-500/10 rounded-md text-center">
                            <p className="text-lg font-bold text-green-600">{data.stats.active}</p>
                            <p className="text-[10px] text-muted-foreground">Active</p>
                        </div>
                        <div className="p-2 bg-muted/50 rounded-md text-center">
                            <p className="text-lg font-bold">{data.stats.runsToday}</p>
                            <p className="text-[10px] text-muted-foreground">Today</p>
                        </div>
                    </div>
                </div>

                <ScrollArea className="flex-1">
                    <div className="p-2 space-y-1">
                        {data.workflows.map((wf) => {
                            const TriggerIcon = getTriggerIcon(wf.trigger)
                            return (
                                <button
                                    key={wf.id}
                                    className={cn(
                                        "w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors",
                                        selectedWorkflow === wf.id ? "bg-primary/10" : "hover:bg-muted"
                                    )}
                                    onClick={() => interactive && setSelectedWorkflow(wf.id)}
                                    disabled={!interactive}
                                >
                                    <div className={cn(
                                        "p-2 rounded-md",
                                        wf.enabled ? "bg-green-500/10" : "bg-muted"
                                    )}>
                                        <TriggerIcon className={cn(
                                            "h-4 w-4",
                                            wf.enabled ? "text-green-600" : "text-muted-foreground"
                                        )} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium text-sm truncate">{wf.name}</p>
                                            {wf.enabled ? (
                                                <CheckCircle2 className="h-3 w-3 text-green-500 shrink-0" />
                                            ) : (
                                                <XCircle className="h-3 w-3 text-muted-foreground shrink-0" />
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground truncate">{wf.description}</p>
                                        <p className="text-xs text-muted-foreground mt-1">{wf.runs} runs</p>
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                </ScrollArea>
            </div>

            {/* Workflow Detail / Builder */}
            <div className="flex-1 flex flex-col">
                {workflow ? (
                    <>
                        <div className="p-4 border-b flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold">{workflow.name}</h3>
                                <p className="text-sm text-muted-foreground">{workflow.description}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch checked={workflow.enabled} disabled={!interactive} />
                                <Button variant="outline" size="icon" className="h-8 w-8" disabled={!interactive}>
                                    <Settings className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <ScrollArea className="flex-1 p-6">
                            <div className="max-w-md mx-auto space-y-4">
                                {/* Trigger */}
                                <Card>
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 rounded-md bg-blue-500/10">
                                                <Clock className="h-4 w-4 text-blue-600" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-sm">Trigger</CardTitle>
                                                <CardDescription className="text-xs capitalize">{workflow.trigger}</CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                </Card>

                                <div className="flex justify-center">
                                    <ArrowRight className="h-5 w-5 text-muted-foreground rotate-90" />
                                </div>

                                {/* Condition */}
                                <Card>
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 rounded-md bg-yellow-500/10">
                                                <GitBranch className="h-4 w-4 text-yellow-600" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-sm">Condition</CardTitle>
                                                <CardDescription className="text-xs">If conditions match</CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                </Card>

                                <div className="flex justify-center">
                                    <ArrowRight className="h-5 w-5 text-muted-foreground rotate-90" />
                                </div>

                                {/* Action */}
                                <Card>
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 rounded-md bg-green-500/10">
                                                <Zap className="h-4 w-4 text-green-600" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-sm">Action</CardTitle>
                                                <CardDescription className="text-xs">{workflow.actions} actions configured</CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                </Card>

                                <Button variant="outline" className="w-full gap-2" disabled={!interactive}>
                                    <Plus className="h-4 w-4" />
                                    Add Step
                                </Button>
                            </div>
                        </ScrollArea>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground">
                        <div className="text-center">
                            <Zap className="h-12 w-12 mx-auto mb-3 opacity-50" />
                            <p className="font-medium">Select a workflow</p>
                            <p className="text-sm">Choose from the list to view or edit</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default defineFeaturePreview({
    featureId: 'automation',
    name: 'Automation',
    description: 'Build automated workflows with triggers and actions',
    component: AutomationPreview,
    category: 'productivity',
    tags: ['automation', 'workflows', 'triggers', 'actions', 'integrations'],
    mockDataSets: [
        {
            id: 'default',
            name: 'Workflow Builder',
            description: 'Sample automation workflows',
            data: {
                stats: { total: 6, active: 4, runsToday: 128, failed: 2 },
                workflows: [
                    { id: '1', name: 'Welcome Email', description: 'Send email when user signs up', trigger: 'webhook', actions: 2, enabled: true, lastRun: '10m ago', runs: 245 },
                    { id: '2', name: 'Daily Report', description: 'Generate and send daily summary', trigger: 'schedule', actions: 3, enabled: true, lastRun: '6h ago', runs: 180 },
                    { id: '3', name: 'Slack Notification', description: 'Notify team on new orders', trigger: 'database', actions: 1, enabled: true, lastRun: '2h ago', runs: 89 },
                    { id: '4', name: 'Lead Scoring', description: 'Update lead scores automatically', trigger: 'webhook', actions: 4, enabled: false, runs: 0 },
                    { id: '5', name: 'Backup Data', description: 'Weekly data backup', trigger: 'schedule', actions: 2, enabled: true, lastRun: '2d ago', runs: 52 },
                ],
            },
        },
    ],
})
