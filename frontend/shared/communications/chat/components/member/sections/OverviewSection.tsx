import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Video, Phone, Info, Edit3, Star, Ban, Flag } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MemberInfoContact } from "../types";

type OverviewSectionProps = {
  contact: MemberInfoContact;
  isMobile: boolean;
  /** Member action callbacks */
  isFavorite?: boolean;
  isBlocked?: boolean;
  onAddToFavorites?: () => void;
  onRemoveFromFavorites?: () => void;
  onBlock?: () => void;
  onUnblock?: () => void;
  onReport?: () => void;
  onVideoCall?: () => void;
  onVoiceCall?: () => void;
};

const FALLBACK_ABOUT = "Hey there! I am using Chats.";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function OverviewSection({
  contact,
  isMobile,
  isFavorite = false,
  isBlocked = false,
  onAddToFavorites,
  onRemoveFromFavorites,
  onBlock,
  onUnblock,
  onReport,
  onVideoCall,
  onVoiceCall,
}: OverviewSectionProps) {
  return (
    <div className="space-y-4 md:space-y-6">
      <div className="bg-muted/30 border border-border rounded-lg p-4 text-center md:p-6">
        <div className="relative inline-block">
          <Avatar
            className={cn(
              "mx-auto border-4 border-primary/20",
              isMobile ? "mb-3 h-24 w-24" : "mb-4 h-32 w-32"
            )}
          >
            <AvatarImage src={contact.avatar} alt={contact.name} />
            <AvatarFallback
              className={cn(
                "bg-primary text-primary-foreground font-semibold",
                isMobile ? "text-lg" : "text-2xl"
              )}
            >
              {getInitials(contact.name)}
            </AvatarFallback>
          </Avatar>

          <Button
            size="icon"
            className={cn(
              "absolute bottom-2 right-2 rounded-full bg-primary text-primary-foreground shadow-lg",
              isMobile ? "h-6 w-6" : "h-8 w-8"
            )}
          >
            <Edit3 className={isMobile ? "h-3 w-3" : "h-4 w-4"} />
          </Button>
        </div>

        <h2
          className={cn(
            "font-semibold text-foreground",
            isMobile ? "text-xl" : "text-2xl"
          )}
        >
          {contact.name}
        </h2>

        {contact.username && (
          <p className="text-muted-foreground">@{contact.username}</p>
        )}

        <div
          className={cn(
            "flex justify-center gap-3",
            isMobile ? "mt-4 flex-col" : "mt-6 flex-row"
          )}
        >
          <Button
            variant="outline"
            size={isMobile ? "default" : "lg"}
            onClick={onVideoCall}
            className={cn(
              "border-border bg-background hover:bg-accent",
              isMobile ? "w-full" : "flex-1 max-w-40"
            )}
          >
            <Video className="mr-2 h-4 w-4 md:h-5 md:w-5" />
            Video
          </Button>
          <Button
            variant="outline"
            size={isMobile ? "default" : "lg"}
            onClick={onVoiceCall}
            className={cn(
              "border-border bg-background hover:bg-accent",
              isMobile ? "w-full" : "flex-1 max-w-40"
            )}
          >
            <Phone className="mr-2 h-4 w-4 md:h-5 md:w-5" />
            Voice
          </Button>
        </div>
      </div>

      <div className="space-y-4 md:space-y-6">
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <h3 className="mb-2 flex items-center gap-2 font-medium text-foreground">
            <Info className="h-4 w-4" />
            About
          </h3>
          <p className="text-muted-foreground">{contact.about ?? FALLBACK_ABOUT}</p>
        </div>

        {contact.phoneNumber && (
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <h3 className="mb-2 flex items-center gap-2 font-medium text-foreground">
              <Phone className="h-4 w-4" />
              Phone number
            </h3>
            <p className="text-muted-foreground">{contact.phoneNumber}</p>
          </div>
        )}

        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <h3 className="mb-2 font-medium text-foreground">Privacy Settings</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-foreground">Disappearing messages</p>
              <p className="text-sm text-muted-foreground">Off</p>
            </div>

            <Separator className="bg-border" />

            <div>
              <p className="text-sm text-foreground">Advanced chat privacy</p>
              <p className="mb-3 text-xs text-muted-foreground">
                This setting can only be updated on your phone.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Off</span>
                <Switch disabled />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <h3 className="mb-4 font-medium text-foreground">Notifications</h3>
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-sm text-foreground">Mute notifications</p>
              <Button
                variant="outline"
                size="sm"
                className="border-border text-muted-foreground"
              >
                Mute for 8 hours
              </Button>
            </div>

            <div>
              <p className="mb-2 text-sm text-foreground">Notification tone</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="border-border">
                  Preview
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-border text-muted-foreground"
                >
                  Default
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Button
          variant="outline"
          onClick={isFavorite ? onRemoveFromFavorites : onAddToFavorites}
          className={cn(
            "w-full justify-center border-border",
            isFavorite ? "text-yellow-500 hover:text-yellow-600" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Star className={cn("mr-2 h-4 w-4", isFavorite && "fill-current")} />
          {isFavorite ? "Remove from favorites" : "Add to favorites"}
        </Button>
        <div className={isMobile ? "flex flex-col gap-3" : "flex gap-3"}>
          <Button
            variant="outline"
            onClick={isBlocked ? onUnblock : onBlock}
            className={cn(
              "flex-1 justify-center border-border",
              isBlocked ? "text-green-500 hover:text-green-600" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Ban className="mr-2 h-4 w-4" />
            {isBlocked ? "Unblock" : "Block"}
          </Button>
          <Button 
            variant="destructive" 
            className="flex-1 justify-center"
            onClick={onReport}
          >
            <Flag className="mr-2 h-4 w-4" />
            Report contact
          </Button>
        </div>
      </div>
    </div>
  );
}
