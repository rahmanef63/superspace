import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, MoreVertical, Phone, Video, Search, Info } from "lucide-react";
import { MemberInfoDrawer } from "@/frontend/shared/communications";
import { useMemberInfo } from "@/frontend/features/chat/shared/hooks";
import { useWorkspaceContext } from "@/frontend/shared/foundation/provider/WorkspaceProvider";
import { cn } from "@/lib/utils";
import type { Id } from "@/convex/_generated/dataModel";

interface MemberSummary {
  id: string;
  name: string;
  username?: string;
  avatar?: string;
  phoneNumber?: string;
  about?: string;
}

interface MobileHeaderProps {
  title: string;
  subtitle?: string;
  avatar?: string;
  isOnline?: boolean;
  onBack?: () => void;
  onSearch?: () => void;
  onVoiceCall?: () => void;
  onVideoCall?: () => void;
  onMoreClick?: () => void;
  contact?: MemberSummary;
}

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export function MobileHeader({ 
  title, 
  subtitle, 
  avatar, 
  isOnline,
  onBack,
  onSearch,
  onVoiceCall,
  onVideoCall,
  onMoreClick,
  contact,
}: MobileHeaderProps) {
  const [isMemberInfoOpen, setIsMemberInfoOpen] = useState(false);
  const hasMember = Boolean(contact);
  const { workspaceId } = useWorkspaceContext();

  // Use member info hook for actions and state
  const memberInfo = useMemberInfo(contact?.id);
  const { 
    isFavorite, 
    isBlocked, 
    addToFavorites, 
    removeFromFavorites, 
    blockMember, 
    unblockMember,
    reportMember 
  } = memberInfo;

  // Wrap action callbacks to provide required arguments
  const handleAddToFavorites = useCallback(() => {
    if (contact?.id && workspaceId) {
      addToFavorites(contact.id, workspaceId as Id<"workspaces">);
    }
  }, [contact?.id, workspaceId, addToFavorites]);

  const handleRemoveFromFavorites = useCallback(() => {
    if (contact?.id && workspaceId) {
      removeFromFavorites(contact.id, workspaceId as Id<"workspaces">);
    }
  }, [contact?.id, workspaceId, removeFromFavorites]);

  const handleBlock = useCallback(() => {
    if (contact?.id) {
      blockMember(contact.id);
    }
  }, [contact?.id, blockMember]);

  const handleUnblock = useCallback(() => {
    if (contact?.id) {
      unblockMember(contact.id);
    }
  }, [contact?.id, unblockMember]);

  const handleReport = useCallback(() => {
    if (contact?.id) {
      reportMember(contact.id, "Reported from chat header");
    }
  }, [contact?.id, reportMember]);

  const handleMemberInfoClick = () => {
    if (!hasMember) return;
    setIsMemberInfoOpen(true);
  };

  return (
    <>
      <div className="flex items-center justify-between p-3 border-b bg-card">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onBack} 
            className="flex-shrink-0 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          {/* Clickable avatar and info area */}
          <div 
            className={cn(
              "flex items-center gap-3 flex-1 min-w-0 rounded-lg py-1 px-2 -ml-1 transition-colors",
              hasMember && "cursor-pointer hover:bg-accent/50 active:bg-accent"
            )}
            onClick={handleMemberInfoClick}
          >
            <div className="relative flex-shrink-0">
              <Avatar className="h-10 w-10">
                <AvatarImage src={avatar || contact?.avatar} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getInitials(title)}
                </AvatarFallback>
              </Avatar>
              {isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
              )}
            </div>
            
            <div className="min-w-0 flex-1">
              <h2 className="font-semibold text-foreground truncate">{title}</h2>
              {subtitle && (
                <p className={cn(
                  "text-sm truncate",
                  isOnline ? "text-green-500" : "text-muted-foreground"
                )}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1 flex-shrink-0">
          {onVideoCall && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onVideoCall}
              className="text-muted-foreground hover:text-foreground"
            >
              <Video className="h-5 w-5" />
            </Button>
          )}
          {onVoiceCall && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onVoiceCall}
              className="text-muted-foreground hover:text-foreground"
            >
              <Phone className="h-5 w-5" />
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onMoreClick}
            className="text-muted-foreground hover:text-foreground"
          >
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {contact && (
        <MemberInfoDrawer
          contact={contact}
          isOpen={isMemberInfoOpen}
          onClose={() => setIsMemberInfoOpen(false)}
          onBack={() => setIsMemberInfoOpen(false)}
          isFavorite={isFavorite}
          isBlocked={isBlocked}
          onAddToFavorites={handleAddToFavorites}
          onRemoveFromFavorites={handleRemoveFromFavorites}
          onBlock={handleBlock}
          onUnblock={handleUnblock}
          onReport={handleReport}
          onVoiceCall={onVoiceCall}
          onVideoCall={onVideoCall}
        />
      )}
    </>
  );
}
