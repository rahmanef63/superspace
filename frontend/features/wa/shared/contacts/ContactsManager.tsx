import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, UserPlus, Phone, MessageCircle, MoreVertical } from "lucide-react";
import type { Contact } from "../types";

interface ContactsManagerProps {
  contacts?: Contact[];
  onSelectContact?: (contact: Contact) => void;
  onAddContact?: () => void;
  onCallContact?: (contact: Contact) => void;
  onMessageContact?: (contact: Contact) => void;
}

export function ContactsManager({ 
  contacts = [], 
  onSelectContact,
  onAddContact,
  onCallContact,
  onMessageContact
}: ContactsManagerProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.phoneNumber.includes(searchQuery)
  );

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-foreground">Friends</h1>
          <Button variant="ghost" size="icon" onClick={onAddContact}>
            <UserPlus className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search friends..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto">
        {filteredContacts.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            {searchQuery ? "No friends found" : "No friends yet"}
          </div>
        ) : (
          filteredContacts.map((contact) => (
            <div
              key={contact.id}
              className="flex items-center gap-3 p-4 hover:bg-accent cursor-pointer"
              onClick={() => onSelectContact?.(contact)}
            >
              <Avatar>
                <AvatarImage src={contact.avatar} alt={contact.name} />
                <AvatarFallback>
                  {contact.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-foreground truncate">
                    {contact.name}
                  </h3>
                  {contact.isOnline && (
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {contact.phoneNumber}
                </p>
                {contact.about && (
                  <p className="text-xs text-muted-foreground truncate mt-1">
                    {contact.about}
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCallContact?.(contact);
                  }}
                >
                  <Phone className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMessageContact?.(contact);
                  }}
                >
                  <MessageCircle className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
