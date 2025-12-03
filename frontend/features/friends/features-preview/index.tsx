/**
 * Friends Feature Preview
 * 
 * Mock preview showing friends/connections interface
 */

"use client"

import * as React from 'react'
import { UserPlus, Users, Search, MessageCircle, MoreHorizontal, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { defineFeaturePreview } from '@/frontend/shared/features/preview'
import type { FeaturePreviewProps } from '@/frontend/shared/features/preview'

interface Friend {
  id: string
  name: string
  avatar: string
  status: 'online' | 'offline' | 'away'
  mutualWorkspaces: number
  lastActive: string
}

interface FriendRequest {
  id: string
  name: string
  avatar: string
  sentAt: string
  type: 'incoming' | 'outgoing'
}

interface FriendsMockData {
  friends: Friend[]
  requests: FriendRequest[]
  stats: {
    total: number
    online: number
    pending: number
  }
}

const statusColors: Record<string, string> = {
  online: 'bg-green-500',
  offline: 'bg-gray-400',
  away: 'bg-yellow-500',
}

function FriendsPreview({ mockData, compact, interactive }: FeaturePreviewProps) {
  const data = mockData.data as unknown as FriendsMockData

  if (compact) {
    return (
      <div className="flex -space-x-2">
        {data.friends.slice(0, 4).map((friend) => (
          <div key={friend.id} className="relative">
            <Avatar className="h-8 w-8 border-2 border-background">
              <AvatarImage src={friend.avatar} />
              <AvatarFallback>{friend.name[0]}</AvatarFallback>
            </Avatar>
            <div className={cn(
              "absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-background",
              statusColors[friend.status]
            )} />
          </div>
        ))}
        {data.friends.length > 4 && (
          <div className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center">
            <span className="text-xs">+{data.friends.length - 4}</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="bg-blue-500/10">
          <CardContent className="p-3 text-center">
            <Users className="h-4 w-4 mx-auto text-blue-500 mb-1" />
            <div className="text-lg font-bold">{data.stats.total}</div>
            <div className="text-xs text-muted-foreground">Friends</div>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10">
          <CardContent className="p-3 text-center">
            <div className="w-2 h-2 rounded-full bg-green-500 mx-auto mb-2" />
            <div className="text-lg font-bold">{data.stats.online}</div>
            <div className="text-xs text-muted-foreground">Online</div>
          </CardContent>
        </Card>
        <Card className="bg-yellow-500/10">
          <CardContent className="p-3 text-center">
            <UserPlus className="h-4 w-4 mx-auto text-yellow-500 mb-1" />
            <div className="text-lg font-bold">{data.stats.pending}</div>
            <div className="text-xs text-muted-foreground">Pending</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Find friends..." className="pl-9 h-9" disabled={!interactive} />
        </div>
        <Button size="sm" className="h-9 gap-1" disabled={!interactive}>
          <UserPlus className="h-4 w-4" />
          Add
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="friends">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="friends" className="text-xs">
            Friends ({data.friends.length})
          </TabsTrigger>
          <TabsTrigger value="requests" className="text-xs">
            Requests ({data.requests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="friends" className="mt-3">
          <Card>
            <ScrollArea className="h-[200px]">
              <div className="divide-y">
                {data.friends.map((friend) => (
                  <div key={friend.id} className="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={friend.avatar} />
                        <AvatarFallback>{friend.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className={cn(
                        "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background",
                        statusColors[friend.status]
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{friend.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {friend.mutualWorkspaces} shared workspaces
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" disabled={!interactive}>
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" disabled={!interactive}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="mt-3">
          <Card>
            <ScrollArea className="h-[200px]">
              <div className="divide-y">
                {data.requests.map((request) => (
                  <div key={request.id} className="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={request.avatar} />
                      <AvatarFallback>{request.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{request.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {request.type === 'incoming' ? 'Wants to connect' : 'Request sent'} • {request.sentAt}
                      </p>
                    </div>
                    {request.type === 'incoming' ? (
                      <div className="flex gap-1">
                        <Button size="icon" className="h-8 w-8" disabled={!interactive}>
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-8 w-8" disabled={!interactive}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Badge variant="secondary" className="text-xs">Pending</Badge>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Register the preview
export default defineFeaturePreview({
  featureId: 'friends',
  name: 'Friends',
  description: 'Manage connections and friends',
  component: FriendsPreview,
  category: 'social',
  tags: ['social', 'connections', 'network'],
  mockDataSets: [
    {
      id: 'default',
      name: 'My Network',
      description: 'Your friend connections',
      data: {
        stats: { total: 24, online: 8, pending: 3 },
        friends: [
          { id: '1', name: 'Alice Johnson', avatar: '', status: 'online', mutualWorkspaces: 3, lastActive: 'now' },
          { id: '2', name: 'Bob Smith', avatar: '', status: 'online', mutualWorkspaces: 2, lastActive: '5m ago' },
          { id: '3', name: 'Charlie Brown', avatar: '', status: 'away', mutualWorkspaces: 1, lastActive: '1h ago' },
          { id: '4', name: 'Diana Ross', avatar: '', status: 'offline', mutualWorkspaces: 4, lastActive: '2d ago' },
          { id: '5', name: 'Eve Wilson', avatar: '', status: 'online', mutualWorkspaces: 2, lastActive: '10m ago' },
        ],
        requests: [
          { id: '1', name: 'Frank Miller', avatar: '', sentAt: '2h ago', type: 'incoming' },
          { id: '2', name: 'Grace Lee', avatar: '', sentAt: '1d ago', type: 'incoming' },
          { id: '3', name: 'Henry Ford', avatar: '', sentAt: '3d ago', type: 'outgoing' },
        ],
      },
    },
  ],
})
