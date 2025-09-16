import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu } from "lucide-react";
import { getInitials } from "../../../utils";

interface TopBarHeaderProps {
  title: string;
  subtitle?: string;
  avatar?: string;
  onMenuClick?: () => void;
  onContactClick: () => void;
}

export function TopBarHeader({
  title,
  subtitle,
  avatar,
  onMenuClick,
  onContactClick,
}: TopBarHeaderProps) {
  return (
    <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
      {onMenuClick && (
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onMenuClick} 
          className="text-wa-muted hover:text-wa-text hover:bg-wa-hover flex-shrink-0"
        >
          <Menu className="h-4 w-4 md:h-5 md:w-5" />
        </Button>
      )}
      
      <div 
        className="flex items-center gap-2 md:gap-3 cursor-pointer min-w-0 flex-1"
        onClick={onContactClick}
      >
        {avatar && (
          <Avatar className="h-8 w-8 md:h-10 md:w-10 border-2 border-primary/20 flex-shrink-0">
            <AvatarImage src={avatar} />
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-xs md:text-sm">
              {getInitials(title)}
            </AvatarFallback>
          </Avatar>
        )}
        
        <div className="min-w-0 flex-1">
          <h1 className="font-semibold text-wa-text text-sm md:text-base truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs md:text-sm text-wa-muted truncate">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
