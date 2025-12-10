/**
 * Forms Feature Preview
 * 
 * Uses the REAL FormsPage layout with mock data
 * showing form list and builder interface
 */

"use client"

import * as React from 'react'
import { useState } from 'react'
import {
    FileText,
    Plus,
    Eye,
    Edit,
    Trash2,
    MoreHorizontal,
    ArrowLeft,
    Save,
    Send,
    GripVertical,
    Type,
    AlignLeft,
    Mail,
    Hash,
    ToggleLeft,
    List,
    Calendar
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { defineFeaturePreview } from '@/frontend/shared/preview'
import type { FeaturePreviewProps } from '@/frontend/shared/preview'

interface Form {
    id: string
    title: string
    description: string
    status: 'draft' | 'published'
    fieldsCount: number
    responses: number
    updatedAt: string
}

interface FormsMockData {
    stats: { total: number; published: number; draft: number; responses: number }
    forms: Form[]
}

function FormsPreview({ mockData, compact, interactive }: FeaturePreviewProps) {
    const data = mockData.data as unknown as FormsMockData
    const [view, setView] = useState<'list' | 'builder'>('list')
    const [activeTab, setActiveTab] = useState('build')

    const fieldTypes = [
        { id: 'text', label: 'Text', icon: Type },
        { id: 'textarea', label: 'Long Text', icon: AlignLeft },
        { id: 'email', label: 'Email', icon: Mail },
        { id: 'number', label: 'Number', icon: Hash },
        { id: 'toggle', label: 'Toggle', icon: ToggleLeft },
        { id: 'select', label: 'Dropdown', icon: List },
        { id: 'date', label: 'Date', icon: Calendar },
    ]

    if (compact) {
        return (
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Forms</span>
                    </div>
                    <Badge variant="secondary">{data.stats.total} forms</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-green-500/10 rounded-md text-center">
                        <p className="text-lg font-bold text-green-600">{data.stats.published}</p>
                        <p className="text-[10px] text-muted-foreground">Published</p>
                    </div>
                    <div className="p-2 bg-muted/50 rounded-md text-center">
                        <p className="text-lg font-bold">{data.stats.responses}</p>
                        <p className="text-[10px] text-muted-foreground">Responses</p>
                    </div>
                </div>
            </div>
        )
    }

    if (view === 'builder') {
        return (
            <div className="flex flex-col h-full border rounded-xl overflow-hidden bg-background">
                {/* Builder Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={() => interactive && setView('list')} disabled={!interactive}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <Input
                            defaultValue="Contact Form"
                            className="text-lg font-semibold border-none p-0 h-auto focus-visible:ring-0 w-48"
                            disabled={!interactive}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" disabled={!interactive}>
                            <Save className="h-4 w-4 mr-2" />
                            Save Draft
                        </Button>
                        <Button disabled={!interactive}>
                            <Send className="h-4 w-4 mr-2" />
                            Publish
                        </Button>
                    </div>
                </div>

                {/* Builder Content */}
                <Tabs value={activeTab} onValueChange={(v) => interactive && setActiveTab(v)} className="flex-1 flex flex-col">
                    <div className="border-b px-4">
                        <TabsList className="h-12">
                            <TabsTrigger value="build" disabled={!interactive}>Build</TabsTrigger>
                            <TabsTrigger value="preview" disabled={!interactive}>Preview</TabsTrigger>
                            <TabsTrigger value="settings" disabled={!interactive}>Settings</TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="build" className="flex-1 flex m-0">
                        {/* Field Types Sidebar */}
                        <div className="w-48 border-r p-3">
                            <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Field Types</p>
                            <div className="space-y-1">
                                {fieldTypes.map((type) => (
                                    <div
                                        key={type.id}
                                        className="flex items-center gap-2 p-2 rounded-md border bg-card text-sm cursor-grab hover:shadow-sm"
                                    >
                                        <GripVertical className="h-3 w-3 text-muted-foreground" />
                                        <type.icon className="h-4 w-4 text-muted-foreground" />
                                        <span>{type.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Form Canvas */}
                        <div className="flex-1 p-4 bg-muted/20">
                            <Card className="max-w-lg mx-auto">
                                <CardHeader>
                                    <CardTitle>Contact Form</CardTitle>
                                    <CardDescription>Fill out this form to get in touch</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="p-3 border-2 border-dashed rounded-md bg-background">
                                        <label className="text-sm font-medium">Name</label>
                                        <Input placeholder="Enter your name" className="mt-1" disabled />
                                    </div>
                                    <div className="p-3 border-2 border-dashed rounded-md bg-background">
                                        <label className="text-sm font-medium">Email</label>
                                        <Input placeholder="Enter your email" type="email" className="mt-1" disabled />
                                    </div>
                                    <div className="p-8 border-2 border-dashed rounded-md text-center text-muted-foreground text-sm">
                                        Drag fields here to add
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="preview" className="flex-1 p-4 m-0">
                        <div className="text-center text-muted-foreground">
                            Preview your form before publishing
                        </div>
                    </TabsContent>

                    <TabsContent value="settings" className="flex-1 p-4 m-0">
                        <div className="text-center text-muted-foreground">
                            Configure form settings
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full border rounded-xl overflow-hidden bg-background">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b bg-card">
                <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                        <h2 className="font-semibold flex items-center gap-2">
                            Forms
                            <Badge variant="secondary" className="text-xs">Beta</Badge>
                        </h2>
                        <p className="text-xs text-muted-foreground">Create and manage forms</p>
                    </div>
                </div>
                <Button size="sm" className="gap-2" onClick={() => interactive && setView('builder')} disabled={!interactive}>
                    <Plus className="h-4 w-4" />
                    Create Form
                </Button>
            </div>

            {/* Forms Grid */}
            <ScrollArea className="flex-1 p-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {data.forms.map((form) => (
                        <Card key={form.id} className="hover:shadow-md transition-shadow cursor-pointer">
                            <CardHeader className="pb-2">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <CardTitle className="text-base truncate">{form.title}</CardTitle>
                                        <CardDescription className="line-clamp-2 mt-1">{form.description}</CardDescription>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" disabled={!interactive}>
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Badge variant={form.status === 'published' ? 'default' : 'secondary'}>
                                            {form.status === 'published' ? 'Published' : 'Draft'}
                                        </Badge>
                                        <span className="text-sm text-muted-foreground">{form.fieldsCount} fields</span>
                                    </div>
                                    <span className="text-sm text-muted-foreground">{form.responses} responses</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </ScrollArea>
        </div>
    )
}

export default defineFeaturePreview({
    featureId: 'forms',
    name: 'Forms',
    description: 'Form builder with drag and drop',
    component: FormsPreview,
    category: 'productivity',
    tags: ['forms', 'builder', 'survey', 'data-collection'],
    mockDataSets: [
        {
            id: 'default',
            name: 'Form Builder',
            description: 'Sample forms with builder',
            data: {
                stats: { total: 8, published: 5, draft: 3, responses: 234 },
                forms: [
                    { id: '1', title: 'Contact Form', description: 'Get in touch with our team', status: 'published', fieldsCount: 5, responses: 89, updatedAt: 'Dec 10' },
                    { id: '2', title: 'Customer Survey', description: 'Help us improve our service', status: 'published', fieldsCount: 12, responses: 156, updatedAt: 'Dec 8' },
                    { id: '3', title: 'Event Registration', description: 'Sign up for upcoming events', status: 'draft', fieldsCount: 8, responses: 0, updatedAt: 'Dec 9' },
                    { id: '4', title: 'Feedback Form', description: 'Share your thoughts', status: 'published', fieldsCount: 6, responses: 45, updatedAt: 'Dec 7' },
                ],
            },
        },
    ],
})
