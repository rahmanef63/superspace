"use client"

import React, { useState } from "react"
import { Users, Plus, Search, Mail, Phone, Building, MoreHorizontal } from "lucide-react"
import { Id } from "@convex/_generated/dataModel"
import { useContacts } from "../hooks/useContacts"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface ContactsPageProps {
  workspaceId?: Id<"workspaces"> | null
}

/**
 * Contacts Page Component
 */
export default function ContactsPage({ workspaceId }: ContactsPageProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const { isLoading, contacts } = useContacts(workspaceId)

  if (!workspaceId) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">No Workspace Selected</h2>
          <p className="mt-2 text-muted-foreground">
            Please select a workspace to view contacts
          </p>
        </div>
      </div>
    )
  }

  const filteredContacts = contacts.filter((contact: any) =>
    contact.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.company?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-xl font-bold">Contacts</h1>
            <p className="text-sm text-muted-foreground">
              {contacts.length} contacts
            </p>
          </div>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Contact
        </Button>
      </div>

      {/* Search */}
      <div className="border-b p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Contacts List */}
      <div className="flex-1 overflow-auto p-4">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">Loading contacts...</p>
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4">
            <Users className="h-12 w-12 text-muted-foreground" />
            <div className="text-center">
              <h3 className="font-medium">No contacts found</h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery ? "Try a different search" : "Add your first contact"}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredContacts.map((contact: any) => (
              <Card key={contact._id} className="cursor-pointer hover:bg-accent">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={contact.avatar} />
                        <AvatarFallback>
                          {contact.name?.charAt(0)?.toUpperCase() || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">{contact.name}</h4>
                        {contact.title && (
                          <p className="text-sm text-muted-foreground">{contact.title}</p>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="mt-4 space-y-2 text-sm">
                    {contact.email && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span className="truncate">{contact.email}</span>
                      </div>
                    )}
                    {contact.phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{contact.phone}</span>
                      </div>
                    )}
                    {contact.company && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Building className="h-4 w-4" />
                        <span>{contact.company}</span>
                      </div>
                    )}
                  </div>

                  {contact.tags && contact.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {contact.tags.map((tag: string) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
