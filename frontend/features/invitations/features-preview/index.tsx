/**
 * Invitations Feature Preview
 * 
 * Mock preview showing team invitations interface
 */

"use client"

import * as React from 'react'
import { Mail, Send, Copy, Link2, Clock, Check, X, UserPlus, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { defineFeaturePreview } from '@/frontend/shared/features/preview'
import type { FeaturePreviewProps } from '@/frontend/shared/features/preview'

interface Invitation {
  id: string
  email: string
  role: 'admin' | 'member' | 'viewer'
  status: 'pending' | 'accepted' | 'expired'
  sentAt: string
  expiresIn?: string
}

interface InvitationsMockData {
  invitations: Invitation[]
  stats: {
    pending: number
    accepted: number
    expired: number
  }
  inviteLink: string
}

const statusConfig = {
  pending: { color: 'bg-yellow-500/10 text-yellow-500', icon: Clock },
  accepted: { color: 'bg-green-500/10 text-green-500', icon: Check },
  expired: { color: 'bg-red-500/10 text-red-500', icon: X },
}

const roleColors = {
  admin: 'bg-purple-500/10 text-purple-500',
  member: 'bg-blue-500/10 text-blue-500',
  viewer: 'bg-gray-500/10 text-gray-500',
}

function InvitationsPreview({ mockData, compact, interactive }: FeaturePreviewProps) {
  const data = mockData.data as unknown as InvitationsMockData

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Invitations</span>
          <Badge variant="secondary">{data.stats.pending} pending</Badge>
        </div>
        {data.invitations.filter(i => i.status === 'pending').slice(0, 2).map((inv) => (
          <div key={inv.id} className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
            <Mail className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs truncate flex-1">{inv.email}</span>
            <Clock className="h-3 w-3 text-yellow-500" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Invite Form */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Invite by Email
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input 
              placeholder="email@example.com" 
              className="flex-1" 
              disabled={!interactive}
            />
            <Button size="sm" className="gap-1" disabled={!interactive}>
              <Send className="h-4 w-4" />
              Send
            </Button>
          </div>
          <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-md">
            <Link2 className="h-4 w-4 text-muted-foreground" />
            <code className="text-xs flex-1 truncate text-muted-foreground">{data.inviteLink}</code>
            <Button variant="ghost" size="icon" className="h-6 w-6" disabled={!interactive}>
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <Card className={cn("bg-yellow-500/5 border-yellow-500/20")}>
          <CardContent className="p-3 text-center">
            <Clock className="h-4 w-4 mx-auto text-yellow-500 mb-1" />
            <div className="text-lg font-bold">{data.stats.pending}</div>
            <div className="text-[10px] text-muted-foreground">Pending</div>
          </CardContent>
        </Card>
        <Card className={cn("bg-green-500/5 border-green-500/20")}>
          <CardContent className="p-3 text-center">
            <Check className="h-4 w-4 mx-auto text-green-500 mb-1" />
            <div className="text-lg font-bold">{data.stats.accepted}</div>
            <div className="text-[10px] text-muted-foreground">Accepted</div>
          </CardContent>
        </Card>
        <Card className={cn("bg-red-500/5 border-red-500/20")}>
          <CardContent className="p-3 text-center">
            <X className="h-4 w-4 mx-auto text-red-500 mb-1" />
            <div className="text-lg font-bold">{data.stats.expired}</div>
            <div className="text-[10px] text-muted-foreground">Expired</div>
          </CardContent>
        </Card>
      </div>

      {/* Invitations List */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Sent Invitations
          </CardTitle>
        </CardHeader>
        <ScrollArea className="h-[180px]">
          <CardContent className="space-y-2">
            {data.invitations.map((inv) => {
              const StatusIcon = statusConfig[inv.status].icon
              return (
                <div 
                  key={inv.id} 
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs bg-muted">
                      {inv.email.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{inv.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Sent {inv.sentAt} {inv.expiresIn && `· Expires ${inv.expiresIn}`}
                    </p>
                  </div>
                  <Badge className={cn("text-xs", roleColors[inv.role])}>
                    {inv.role}
                  </Badge>
                  <Badge className={cn("text-xs", statusConfig[inv.status].color)}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {inv.status}
                  </Badge>
                </div>
              )
            })}
          </CardContent>
        </ScrollArea>
      </Card>
    </div>
  )
}

// Register the preview
export default defineFeaturePreview({
  featureId: 'invitations',
  name: 'Invitations',
  description: 'Manage team invitations and access',
  component: InvitationsPreview,
  category: 'team',
  tags: ['invitations', 'team', 'access', 'onboarding'],
  mockDataSets: [
    {
      id: 'default',
      name: 'Team Invitations',
      description: 'Pending and sent invitations',
      data: {
        stats: { pending: 3, accepted: 12, expired: 2 },
        inviteLink: 'https://app.superspace.io/invite/abc123xyz',
        invitations: [
          { id: '1', email: 'alice@company.com', role: 'admin', status: 'pending', sentAt: '2h ago', expiresIn: '5d' },
          { id: '2', email: 'bob@partner.io', role: 'member', status: 'pending', sentAt: '1d ago', expiresIn: '4d' },
          { id: '3', email: 'charlie@agency.com', role: 'viewer', status: 'accepted', sentAt: '3d ago' },
          { id: '4', email: 'diana@client.org', role: 'member', status: 'expired', sentAt: '2w ago' },
          { id: '5', email: 'eve@startup.co', role: 'member', status: 'pending', sentAt: '5h ago', expiresIn: '7d' },
        ],
      },
    },
  ],
})
