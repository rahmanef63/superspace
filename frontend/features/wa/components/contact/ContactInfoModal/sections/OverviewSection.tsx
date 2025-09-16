import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Video, Phone, Info, Edit3 } from "lucide-react";
import { getInitials } from "../../../../utils";

interface OverviewSectionProps {
  contact: any;
  isMobile: boolean;
}

export function OverviewSection({ contact, isMobile }: OverviewSectionProps) {
  return (
    <div className="space-y-4 md:space-y-6">
      {/* Profile Section */}
      <div className="text-center bg-wa-surface rounded-wa-lg p-4 md:p-6 border border-wa-border">
        <div className="relative inline-block">
          <Avatar className={`mx-auto mb-4 border-4 border-primary/20 ${
            isMobile ? 'h-24 w-24' : 'h-32 w-32'
          }`}>
            <AvatarImage src={contact.avatar} />
            <AvatarFallback className={`bg-primary text-primary-foreground font-semibold ${
              isMobile ? 'text-lg' : 'text-2xl'
            }`}>
              {getInitials(contact.name)}
            </AvatarFallback>
          </Avatar>
          <Button 
            size="icon" 
            className={`absolute bottom-2 right-2 rounded-full bg-primary hover:bg-primary/90 shadow-wa-lg ${
              isMobile ? 'h-6 w-6' : 'h-8 w-8'
            }`}
          >
            <Edit3 className={`text-primary-foreground ${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
          </Button>
        </div>
        
        <h2 className={`font-semibold text-wa-text mb-1 ${
          isMobile ? 'text-xl' : 'text-2xl'
        }`}>
          {contact.name}
        </h2>
        {contact.username && (
          <p className="text-wa-muted mb-4">@{contact.username}</p>
        )}

        {/* Action Buttons */}
        <div className={`flex justify-center gap-3 mb-6 ${
          isMobile ? 'flex-col' : 'flex-row'
        }`}>
          <Button 
            variant="outline" 
            size={isMobile ? "default" : "lg"}
            className={`bg-wa-surface hover:bg-wa-hover border-wa-border ${
              isMobile ? 'w-full' : 'flex-1 max-w-40'
            }`}
          >
            <Video className={`mr-2 ${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
            Video
          </Button>
          <Button 
            variant="outline" 
            size={isMobile ? "default" : "lg"}
            className={`bg-wa-surface hover:bg-wa-hover border-wa-border ${
              isMobile ? 'w-full' : 'flex-1 max-w-40'
            }`}
          >
            <Phone className={`mr-2 ${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
            Voice
          </Button>
        </div>
      </div>

      {/* Contact Details */}
      <div className="space-y-4 md:space-y-6">
        <div className="bg-wa-surface rounded-wa-lg p-4 border border-wa-border">
          <h3 className="text-wa-text font-medium mb-2 flex items-center gap-2">
            <Info className="h-4 w-4" />
            About
          </h3>
          <p className="text-wa-muted">{contact.about || "Hey there! I am using WhatsApp."}</p>
        </div>

        {contact.phoneNumber && (
          <div className="bg-wa-surface rounded-wa-lg p-4 border border-wa-border">
            <h3 className="text-wa-text font-medium mb-2 flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Phone number
            </h3>
            <p className="text-wa-muted">{contact.phoneNumber}</p>
          </div>
        )}

        <div className="bg-wa-surface rounded-wa-lg p-4 border border-wa-border">
          <h3 className="text-wa-text font-medium mb-2">Privacy Settings</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-wa-text mb-1">Disappearing messages</p>
              <p className="text-wa-muted text-sm">Off</p>
            </div>
            
            <Separator className="bg-wa-border" />
            
            <div>
              <p className="text-sm text-wa-text mb-2">Advanced chat privacy</p>
              <p className="text-wa-muted text-xs mb-3">
                This setting can only be updated on your phone.{" "}
                <span className="text-primary cursor-pointer hover:underline">Learn more</span>
              </p>
              <div className="flex items-center justify-between">
                <span className="text-wa-muted text-sm">Off</span>
                <Switch disabled />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-wa-surface rounded-wa-lg p-4 border border-wa-border">
          <h3 className="text-wa-text font-medium mb-4">Notifications</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-wa-text mb-2">Mute notifications</p>
              <Button variant="outline" size="sm" className="text-wa-muted border-wa-border">
                🔔 Mute ▼
              </Button>
            </div>
            
            <div>
              <p className="text-sm text-wa-text mb-2">Notification tone</p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="border-wa-border">
                  ▶️
                </Button>
                <Button variant="outline" size="sm" className="text-wa-muted border-wa-border">
                  🎵 Default ▼
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button 
          variant="outline" 
          className="w-full justify-center text-wa-muted hover:text-wa-text border-wa-border"
        >
          Remove from favorites
        </Button>
        
        <div className={`gap-3 ${isMobile ? 'flex flex-col' : 'flex'}`}>
          <Button 
            variant="outline" 
            className="flex-1 justify-center text-wa-muted hover:text-wa-text border-wa-border"
          >
            Block
          </Button>
          <Button 
            variant="destructive" 
            className="flex-1 justify-center"
          >
            Report contact
          </Button>
        </div>
      </div>
    </div>
  );
}
