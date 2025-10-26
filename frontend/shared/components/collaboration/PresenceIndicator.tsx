import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useRealtimeCollaboration } from '../../hooks/useConvexCollaboration';
import { Id } from '../../../../convex/_generated/dataModel';

interface PresenceIndicatorProps {
  workspaceId: Id<'workspaces'> | null;
  resourceType: string;
  resourceId: string | null;
  currentUserName: string;
  currentUserAvatar?: string;
}

export function PresenceIndicator({
  workspaceId,
  resourceType,
  resourceId,
  currentUserName,
  currentUserAvatar
}: PresenceIndicatorProps) {
  const { sessions, activeUsers } = useRealtimeCollaboration(
    workspaceId,
    resourceType,
    resourceId,
    currentUserName,
    currentUserAvatar
  );

  if (!sessions || sessions.length === 0) {
    return null;
  }

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1 px-3 py-1.5 bg-muted/50 rounded-md border">
        <div className="flex -space-x-2">
          {sessions.slice(0, 3).map((session) => (
            <Tooltip key={session.userId}>
              <TooltipTrigger>
                <Avatar className="w-7 h-7 border-2 border-background">
                  <AvatarImage src={session.userAvatar} alt={session.userName} />
                  <AvatarFallback className="text-xs">
                    {session.userName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>
                <p>{session.userName}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
        {activeUsers > 3 && (
          <span className="text-xs text-muted-foreground ml-1">
            +{activeUsers - 3}
          </span>
        )}
        <span className="text-xs text-muted-foreground ml-2">
          {activeUsers === 1 ? '1 person' : `${activeUsers} people`} editing
        </span>
      </div>
    </TooltipProvider>
  );
}
