/**
 * User Management Feature Preview
 * 
 * Real UI preview showing user management interface with tabs
 */

"use client"

import * as React from 'react'
import { useState } from 'react'
import {
    Users,
    Shield,
    LayoutList,
    UserPlus,
    Search,
    MoreHorizontal,
    Crown,
    Mail,
    Check,
    X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Checkbox } from '@/components/ui/checkbox'
import { defineFeaturePreview } from '@/frontend/shared/preview'
import type { FeaturePreviewProps } from '@/frontend/shared/preview'

interface Member {
    id: string
    name: string
    email: string
    avatar?: string
    role: 'owner' | 'admin' | 'member' | 'guest'
    status: 'active' | 'pending' | 'inactive'
    joinedAt: string
}

interface Team {
    id: string
    name: string
    memberCount: number
    color: string
}

interface Role {
    id: string
    name: string
    description: string
    permissions: string[]
    memberCount: number
    color: string
}

interface UserManagementMockData {
    members: Member[]
    teams: Team[]
    roles: Role[]
    stats: {
        totalMembers: number
        activeMembers: number
        pendingInvites: number
        teamCount: number
    }
}

const roleColors: Record<string, string> = {
    owner: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    admin: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    member: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    guest: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
}

const statusColors: Record<string, string> = {
    active: 'bg-green-500',
    pending: 'bg-yellow-500',
    inactive: 'bg-gray-400',
}

function UserManagementPreview({ mockData, compact, interactive }: FeaturePreviewProps) {
    const data = mockData.data as unknown as UserManagementMockData
    const [activeTab, setActiveTab] = useState('members')
    const [searchQuery, setSearchQuery] = useState('')

    const filteredMembers = data.members.filter(m =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.email.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (compact) {
        return (
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">User Management</span>
                    </div>
                    <Badge variant="secondary">{data.stats.totalMembers} members</Badge>
                </div>
                <div className="flex -space-x-2">
                    {data.members.slice(0, 5).map(member => (
                        <Avatar key={member.id} className="h-8 w-8 border-2 border-background">
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback className="text-xs">{member.name[0]}</AvatarFallback>
                        </Avatar>
                    ))}
                    {data.members.length > 5 && (
                        <div className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                            <span className="text-xs font-medium">+{data.members.length - 5}</span>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full border rounded-xl overflow-hidden bg-background">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b bg-card">
                <div>
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary" />
                        User Management
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Manage members, roles, and access
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                        {data.stats.totalMembers} members
                    </Badge>
                    <Button size="sm" className="gap-1" disabled={!interactive}>
                        <UserPlus className="h-4 w-4" />
                        Invite
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <Tabs
                value={activeTab}
                onValueChange={interactive ? setActiveTab : undefined}
                className="flex-1 flex flex-col"
            >
                <div className="px-6 pt-4">
                    <TabsList className="w-full justify-start bg-muted/50 p-1">
                        <TabsTrigger value="members" className="gap-2">
                            <LayoutList className="w-4 h-4" />
                            Members
                        </TabsTrigger>
                        <TabsTrigger value="explorer" className="gap-2">
                            <Shield className="w-4 h-4" />
                            Role Explorer
                        </TabsTrigger>
                        <TabsTrigger value="team" className="gap-2">
                            <Users className="w-4 h-4" />
                            Teams
                            <Badge variant="secondary" className="ml-1 text-[10px] px-1 py-0 h-4">
                                {data.teams.length}
                            </Badge>
                        </TabsTrigger>
                    </TabsList>
                </div>

                <div className="flex-1 overflow-hidden">
                    {/* Members Tab */}
                    <TabsContent value="members" className="h-full m-0 p-4">
                        <div className="flex flex-col h-full gap-4">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search members..."
                                    className="pl-9"
                                    value={searchQuery}
                                    onChange={(e) => interactive && setSearchQuery(e.target.value)}
                                    disabled={!interactive}
                                />
                            </div>

                            {/* Members List */}
                            <ScrollArea className="flex-1">
                                <div className="space-y-2">
                                    {filteredMembers.map(member => (
                                        <Card key={member.id} className="hover:bg-muted/30 transition-colors">
                                            <CardContent className="p-3 flex items-center gap-3">
                                                <div className="relative">
                                                    <Avatar className="h-10 w-10">
                                                        <AvatarImage src={member.avatar} />
                                                        <AvatarFallback>{member.name[0]}</AvatarFallback>
                                                    </Avatar>
                                                    <div className={cn(
                                                        "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background",
                                                        statusColors[member.status]
                                                    )} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-medium text-sm truncate">{member.name}</p>
                                                        {member.role === 'owner' && (
                                                            <Crown className="h-3 w-3 text-amber-500" />
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                                                </div>
                                                <Badge variant="outline" className={cn("text-xs capitalize", roleColors[member.role])}>
                                                    {member.role}
                                                </Badge>
                                                <Button variant="ghost" size="icon" className="h-8 w-8" disabled={!interactive}>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    </TabsContent>

                    {/* Role Explorer Tab */}
                    <TabsContent value="explorer" className="h-full m-0 p-4">
                        <ScrollArea className="h-full">
                            <div className="space-y-4">
                                {data.roles.map(role => (
                                    <Card key={role.id}>
                                        <CardHeader className="pb-2">
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                                    <div
                                                        className="w-3 h-3 rounded-full"
                                                        style={{ backgroundColor: role.color }}
                                                    />
                                                    {role.name}
                                                </CardTitle>
                                                <Badge variant="secondary" className="text-xs">
                                                    {role.memberCount} members
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground">{role.description}</p>
                                        </CardHeader>
                                        <CardContent className="pt-0">
                                            <div className="flex flex-wrap gap-1">
                                                {role.permissions.slice(0, 4).map(perm => (
                                                    <Badge key={perm} variant="outline" className="text-[10px]">
                                                        {perm}
                                                    </Badge>
                                                ))}
                                                {role.permissions.length > 4 && (
                                                    <Badge variant="outline" className="text-[10px]">
                                                        +{role.permissions.length - 4} more
                                                    </Badge>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </ScrollArea>
                    </TabsContent>

                    {/* Teams Tab */}
                    <TabsContent value="team" className="h-full m-0 p-4">
                        <div className="flex flex-col h-full gap-4">
                            <Button variant="outline" className="w-full gap-2" disabled={!interactive}>
                                <UserPlus className="h-4 w-4" />
                                Create Team
                            </Button>
                            <ScrollArea className="flex-1">
                                <div className="grid gap-3">
                                    {data.teams.map(team => (
                                        <Card key={team.id} className="hover:bg-muted/30 transition-colors cursor-pointer">
                                            <CardContent className="p-4 flex items-center gap-3">
                                                <div
                                                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-medium"
                                                    style={{ backgroundColor: team.color }}
                                                >
                                                    {team.name.slice(0, 2).toUpperCase()}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium">{team.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {team.memberCount} member{team.memberCount !== 1 ? 's' : ''}
                                                    </p>
                                                </div>
                                                <Button variant="ghost" size="icon" className="h-8 w-8" disabled={!interactive}>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    )
}

// Register the preview
export default defineFeaturePreview({
    featureId: 'user-management',
    name: 'User Management',
    description: 'Manage members, roles, teams, and access control',
    component: UserManagementPreview,
    category: 'administration',
    tags: ['users', 'members', 'roles', 'teams', 'access'],
    mockDataSets: [
        {
            id: 'default',
            name: 'Workspace Team',
            description: 'Typical workspace with members and teams',
            data: {
                stats: {
                    totalMembers: 12,
                    activeMembers: 10,
                    pendingInvites: 2,
                    teamCount: 3,
                },
                members: [
                    { id: '1', name: 'Alice Johnson', email: 'alice@company.com', role: 'owner', status: 'active', joinedAt: '2024-01-15' },
                    { id: '2', name: 'Bob Smith', email: 'bob@company.com', role: 'admin', status: 'active', joinedAt: '2024-02-20' },
                    { id: '3', name: 'Charlie Brown', email: 'charlie@company.com', role: 'member', status: 'active', joinedAt: '2024-03-10' },
                    { id: '4', name: 'Diana Ross', email: 'diana@company.com', role: 'member', status: 'active', joinedAt: '2024-03-15' },
                    { id: '5', name: 'Eve Wilson', email: 'eve@company.com', role: 'member', status: 'pending', joinedAt: '2024-04-01' },
                    { id: '6', name: 'Frank Miller', email: 'frank@external.com', role: 'guest', status: 'active', joinedAt: '2024-04-05' },
                ],
                teams: [
                    { id: '1', name: 'Engineering', memberCount: 5, color: '#3b82f6' },
                    { id: '2', name: 'Design', memberCount: 3, color: '#a855f7' },
                    { id: '3', name: 'Marketing', memberCount: 4, color: '#22c55e' },
                ],
                roles: [
                    {
                        id: '1',
                        name: 'Owner',
                        description: 'Full access to all workspace features',
                        permissions: ['manage_members', 'manage_roles', 'manage_billing', 'delete_workspace'],
                        memberCount: 1,
                        color: '#f59e0b'
                    },
                    {
                        id: '2',
                        name: 'Admin',
                        description: 'Manage members and most settings',
                        permissions: ['manage_members', 'manage_channels', 'manage_integrations'],
                        memberCount: 2,
                        color: '#8b5cf6'
                    },
                    {
                        id: '3',
                        name: 'Member',
                        description: 'Standard access to workspace features',
                        permissions: ['view_members', 'create_content', 'use_channels'],
                        memberCount: 8,
                        color: '#3b82f6'
                    },
                    {
                        id: '4',
                        name: 'Guest',
                        description: 'Limited access to specific channels',
                        permissions: ['view_shared_content'],
                        memberCount: 1,
                        color: '#6b7280'
                    },
                ],
            },
        },
    ],
})
