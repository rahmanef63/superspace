import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, Video, MessageCircle, User, Clock, Shield, Star } from "lucide-react";
import type { Contact } from "../../shared/types";

interface ContactDetailViewProps {
  contact: Contact;
  onCall?: () => void;
  onVideoCall?: () => void;
  onMessage?: () => void;
}

export function ContactDetailView({ 
  contact, 
  onCall, 
  onVideoCall, 
  onMessage 
}: ContactDetailViewProps) {
  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-6 border-b border-border text-center">
        <Avatar className="w-24 h-24 mx-auto mb-4">
          <AvatarImage src={contact.avatar} alt={contact.name} />
          <AvatarFallback className="text-2xl">
            {contact.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <h1 className="text-2xl font-semibold text-foreground mb-1">
          {contact.name}
        </h1>
        
        <p className="text-muted-foreground mb-2">{contact.phoneNumber}</p>
        
        {contact.isOnline ? (
          <Badge variant="secondary" className="mb-4">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
            Online
          </Badge>
        ) : (
          <p className="text-sm text-muted-foreground mb-4">
            Last seen {contact.lastSeen || "recently"}
          </p>
        )}
        
        {/* Action Buttons */}
        <div className="flex gap-3 justify-center">
          <Button size="icon" variant="outline" onClick={onCall}>
            <Phone className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="outline" onClick={onVideoCall}>
            <Video className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="outline" onClick={onMessage}>
            <MessageCircle className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Contact Info */}
      <div className="flex-1 p-6 space-y-6">
        {contact.about && (
          <div>
            <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
              <User className="h-4 w-4" />
              About
            </h3>
            <p className="text-muted-foreground">{contact.about}</p>
          </div>
        )}
        
        {contact.username && (
          <div>
            <h3 className="font-medium text-foreground mb-2">Username</h3>
            <p className="text-muted-foreground">@{contact.username}</p>
          </div>
        )}
        
        <div>
          <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </h3>
          <p className="text-sm text-muted-foreground">
            Messages and calls are end-to-end encrypted
          </p>
        </div>
        
        <div>
          <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Contact Info
          </h3>
          <p className="text-sm text-muted-foreground">
            Added to contacts automatically
          </p>
        </div>
      </div>
    </div>
  );
}
