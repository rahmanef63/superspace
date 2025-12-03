/**
 * Members Feature Preview
 * 
 * Mock preview showing team members interface with Tabs (Members, Search, Invitations)
 */

"use client"

import * as React from 'react'
import { Users, Search, Mail, Crown, Shield, User, MoreVertical, UserPlus, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { defineFeaturePreview } from '@/frontend/shared/preview'
import type { FeaturePreviewProps } from '@/frontend/shared/preview'

interface Member {
  id: string
  name: string
  email: string
  role: 'owner' | 'admin' | 'member' | 'guest'
  avatar?: string
  status: 'online' | 'offline' | 'away'
  joinedAt: string
}

interface MembersMockData {
  members: Member[]
  stats: {
    total: number
    online: number
    admins: number
  }
}

const roleIcons = {
  owner: <Crown className="h-3 w-3 text-yellow-500" />,
  admin: <Shield className="h-3 w-3 text-blue-500" />,
  member: <User className="h-3 w-3 text-muted-foreground" />,
  guest: <User className="h-3 w-3 text-muted-foreground/50" />,
}

const roleColors = {
  owner: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  admin: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  member: 'bg-muted text-muted-foreground',
  guest: 'bg-muted/50 text-muted-foreground/50',
}

function MembersPreview({ mockData, compact, interactive }: FeaturePreviewProps) {
  const data = mockData.data as unknown as MembersMockData
  const [activeTab, setActiveTab] = React.useState('members')

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Members</span>
          <Badge variant="secondary">{data.stats.total} members</Badge>
        </div>
        {data.members.slice(0, 3).map((member) => (
          <div key={member.id} className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
            <Avatar className="h-6 w-6">
              <AvatarImage src={member.avatar} />
              <AvatarFallback className="text-xs">{member.name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="text-xs truncate flex-1">{member.name}</span>
            {roleIcons[member.role]}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Page Header */}
      <div className="flex items-center justify-between pb-2 border-b">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          <h3 className="font-semibold">Members</h3>
          <Badge variant="secondary" className="ml-2">{data.stats.total}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 gap-1" disabled={!interactive}>
            <Filter className="h-3 w-3" />
            Filter
          </Button>
          <Button size="sm" className="h-8 gap-1" disabled={!interactive}>
            <UserPlus className="h-4 w-4" />
            Invite
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="members" className="text-xs">Members</TabsTrigger>
          <TabsTrigger value="search" className="text-xs">Search</TabsTrigger>
          <TabsTrigger value="invitations" className="text-xs">Invitations</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="mt-3 space-y-3">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            <Card>
              <CardContent className="p-2 text-center">
                <div className="text-sm font-bold">{data.stats.total}</div>
                <div className="text-[10px] text-muted-foreground">Total</div>
              </CardContent>
            </Card>
            <Card className="bg-green-500/5">
              <CardContent className="p-2 text-center">
                <div className="text-sm font-bold text-green-600">{data.stats.online}</div>
                <div className="text-[10px] text-muted-foreground">Online</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-2 text-center">
                <div className="text-sm font-bold">{data.stats.admins}</div>
                <div className="text-[10px] text-muted-foreground">Admins</div>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder="Search members..." className="pl-8 h-8 text-sm" disabled={!interactive} />
          </div>

          {/* Members list */}
          <ScrollArea className="h-[240px]">
            <div className="space-y-1">
              {data.members.map((member) => (
                <div 
                  key={member.id} 
                  className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 transition-colors"
                >
                  <div className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback className="text-xs">{member.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span 
                      className={cn(
                        "absolute bottom-0 right-0 w-2 h-2 rounded-full border border-background",
                        member.status === 'online' ? 'bg-green-500' :
                        member.status === 'away' ? 'bg-yellow-500' : 'bg-muted'
                      )}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="font-medium text-xs truncate">{member.name}</p>
                      {roleIcons[member.role]}
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate">{member.email}</p>
                  </div>
                  <Badge variant="outline" className={cn("text-[10px] px-1 h-4", roleColors[member.role])}>
                    {member.role}
                  </Badge>
                  <Button variant="ghost" size="icon" className="h-6 w-6" disabled={!interactive}>
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="search" className="mt-3">
          <Card>
            <CardContent className="p-8 text-center">
              <Search className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-xs text-muted-foreground">Search across workspace</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invitations" className="mt-3">
          <Card>
            <CardContent className="p-8 text-center">
              <Mail className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-xs text-muted-foreground">Manage pending invitations</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Register the preview
export default defineFeaturePreview({
  featureId: 'members',
  name: 'Members',
  description: 'Team member management',
  component: MembersPreview,
  category: 'team',
  tags: ['members', 'team', 'users', 'roles'],
  mockDataSets: [
    {
      id: 'default',
      name: 'Team',
      description: 'Workspace team members',
      data: {
        stats: { total: 24, online: 8, admins: 3 },
        members: [
          { id: '1', name: 'Alice Johnson', email: 'alice@company.com', role: 'owner', status: 'online', joinedAt: '2024-01-15' },
          { id: '2', name: 'Bob Smith', email: 'bob@company.com', role: 'admin', status: 'online', joinedAt: '2024-02-01' },
          { id: '3', name: 'Charlie Brown', email: 'charlie@company.com', role: 'admin', status: 'away', joinedAt: '2024-02-10' },
          { id: '4', name: 'Diana Prince', email: 'diana@company.com', role: 'member', status: 'online', joinedAt: '2024-03-05' },
          { id: '5', name: 'Eve Martinez', email: 'eve@company.com', role: 'member', status: 'offline', joinedAt: '2024-03-12' },
          { id: '6', name: 'Frank Wilson', email: 'frank@company.com', role: 'member', status: 'online', joinedAt: '2024-04-01' },
          { id: '7', name: 'Grace Lee', email: 'grace@company.com', role: 'guest', status: 'offline', joinedAt: '2024-05-15' },
        ],
      },
    },
  ],
})
