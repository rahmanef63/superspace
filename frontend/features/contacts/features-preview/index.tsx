/**
 * Contacts Feature Preview
 * 
 * Uses the REAL ContactsList layout with mock data
 * showing contacts, pending requests, and sent requests
 */

"use client"

import * as React from 'react'
import { useState } from 'react'
import {
  Contact,
  UserPlus,
  Clock,
  Check,
  X,
  Send,
  Search,
  MoreHorizontal,
  Mail,
  Phone,
  MessageSquare,
  MapPin,
  Building2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { defineFeaturePreview } from '@/frontend/shared/preview'
import type { FeaturePreviewProps } from '@/frontend/shared/preview'

interface ContactPerson {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  location?: string
  avatar?: string
  isOnline?: boolean
}

interface ContactRequest {
  id: string
  sender: ContactPerson
  message?: string
  sentAt: string
}

interface ContactsMockData {
  stats: { total: number; pending: number; sent: number }
  contacts: ContactPerson[]
  pendingRequests: ContactRequest[]
  sentRequests: Array<{ id: string; receiver: ContactPerson; message?: string; sentAt: string }>
}

function ContactsPreview({ mockData, compact, interactive }: FeaturePreviewProps) {
  const data = mockData.data as unknown as ContactsMockData
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const selectedContact = data.contacts.find(c => c.id === selectedId)

  const filteredContacts = data.contacts.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  )

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Contact className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Contacts</span>
          </div>
          <Badge variant="secondary">{data.stats.total} contacts</Badge>
        </div>
        <div className="space-y-1">
          {data.contacts.slice(0, 3).map((contact) => (
            <div key={contact.id} className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-[10px]">{contact.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-sm truncate flex-1">{contact.name}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full border rounded-xl overflow-hidden bg-background">
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-card">
          <div className="flex items-center gap-3">
            <Contact className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">Contacts ({data.stats.total})</h2>
          </div>
          <Button size="sm" className="gap-2" disabled={!interactive}>
            <UserPlus className="h-4 w-4" />
            Add Contact
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-6 space-y-6">
            {/* Pending Requests */}
            {data.pendingRequests.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="w-4 h-4 text-yellow-600" />
                    Contact Requests ({data.pendingRequests.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {data.pendingRequests.map((request) => (
                    <div key={request.id} className="flex items-center gap-3 p-3 rounded-lg border">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={request.sender.avatar} />
                        <AvatarFallback>{request.sender.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{request.sender.name}</div>
                        <div className="text-sm text-muted-foreground">Wants to connect</div>
                        {request.message && (
                          <div className="text-sm text-muted-foreground mt-1 italic">"{request.message}"</div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 h-8 w-8 p-0" disabled={!interactive}>
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0" disabled={!interactive}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Sent Requests */}
            {data.sentRequests.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Send className="w-4 h-4 text-primary" />
                    Sent Requests ({data.sentRequests.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {data.sentRequests.map((request) => (
                    <div key={request.id} className="flex items-center gap-3 p-3 rounded-lg border">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={request.receiver.avatar} />
                        <AvatarFallback>{request.receiver.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{request.receiver.name}</div>
                        <div className="text-sm text-muted-foreground">Request sent — Pending response</div>
                      </div>
                      <div className="text-sm text-muted-foreground">{request.sentAt}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Contacts List */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search contacts..."
                    className="pl-8 h-9"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    disabled={!interactive}
                  />
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {filteredContacts.map((contact) => (
                  <Card
                    key={contact.id}
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-md",
                      selectedId === contact.id && "ring-2 ring-primary"
                    )}
                    onClick={() => interactive && setSelectedId(selectedId === contact.id ? null : contact.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="relative">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={contact.avatar} />
                            <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          {contact.isOnline && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium truncate">{contact.name}</p>
                            <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2" disabled={!interactive}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{contact.email}</p>
                          {contact.company && (
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              {contact.company}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Right Panel - Contact Info */}
      {selectedContact && (
        <div className="w-72 border-l bg-muted/10 flex flex-col hidden lg:flex">
          <div className="p-4 border-b text-center">
            <Avatar className="h-20 w-20 mx-auto mb-3">
              <AvatarImage src={selectedContact.avatar} />
              <AvatarFallback className="text-xl">{selectedContact.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <h3 className="font-semibold">{selectedContact.name}</h3>
            {selectedContact.company && (
              <p className="text-sm text-muted-foreground">{selectedContact.company}</p>
            )}
          </div>
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button className="flex-1 gap-2" size="sm" disabled={!interactive}>
                  <MessageSquare className="h-4 w-4" />
                  Message
                </Button>
                <Button variant="outline" size="icon" className="h-9 w-9" disabled={!interactive}>
                  <Phone className="h-4 w-4" />
                </Button>
              </div>

              <Separator />

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase">Email</label>
                  <p className="text-sm mt-1 flex items-center gap-2">
                    <Mail className="h-3 w-3 text-muted-foreground" />
                    {selectedContact.email}
                  </p>
                </div>
                {selectedContact.phone && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase">Phone</label>
                    <p className="text-sm mt-1 flex items-center gap-2">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      {selectedContact.phone}
                    </p>
                  </div>
                )}
                {selectedContact.location && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase">Location</label>
                    <p className="text-sm mt-1 flex items-center gap-2">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      {selectedContact.location}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  )
}

// Register the preview
export default defineFeaturePreview({
  featureId: 'contact',
  name: 'Contacts',
  description: 'Manage personal and workspace contacts',
  component: ContactsPreview,
  category: 'communication',
  tags: ['contacts', 'people', 'network', 'address-book'],
  mockDataSets: [
    {
      id: 'default',
      name: 'Contact List',
      description: 'Sample contacts with requests',
      data: {
        stats: { total: 8, pending: 2, sent: 1 },
        contacts: [
          { id: '1', name: 'Alice Johnson', email: 'alice@example.com', phone: '+1 234 567 890', company: 'TechCorp', location: 'San Francisco, CA', isOnline: true },
          { id: '2', name: 'Bob Smith', email: 'bob@example.com', company: 'Innovate Inc', location: 'New York, NY', isOnline: false },
          { id: '3', name: 'Charlie Brown', email: 'charlie@example.com', phone: '+1 345 678 901', company: 'Design Studio', isOnline: true },
          { id: '4', name: 'Diana Ross', email: 'diana@example.com', company: 'Marketing Pro', location: 'Los Angeles, CA', isOnline: false },
          { id: '5', name: 'Eve Wilson', email: 'eve@example.com', phone: '+1 456 789 012', isOnline: false },
          { id: '6', name: 'Frank Miller', email: 'frank@example.com', company: 'Dev Agency', isOnline: true },
        ],
        pendingRequests: [
          { id: 'r1', sender: { id: 'p1', name: 'Grace Lee', email: 'grace@example.com' }, message: 'Hi! We met at the conference', sentAt: 'Dec 9' },
          { id: 'r2', sender: { id: 'p2', name: 'Henry Chen', email: 'henry@example.com' }, sentAt: 'Dec 8' },
        ],
        sentRequests: [
          { id: 's1', receiver: { id: 'p3', name: 'Ivy Taylor', email: 'ivy@example.com', company: 'StartupX' }, sentAt: 'Dec 7' },
        ],
      },
    },
  ],
})
