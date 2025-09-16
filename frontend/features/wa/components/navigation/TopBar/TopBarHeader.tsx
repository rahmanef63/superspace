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
    <div className="flex items-center gap-3 min-w-0 flex-1">
      {onMenuClick && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="text-wa-muted hover:text-wa-text hover:bg-wa-hover flex-shrink-0 h-10 w-10"
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}

      <div
        className="flex items-center gap-3 cursor-pointer min-w-0 flex-1 hover:bg-wa-hover rounded-lg p-2 -ml-2 transition-colors"
        onClick={onContactClick}
      >
        {avatar && (
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarImage src={avatar} />
            <AvatarFallback className="bg-wa-primary text-white font-medium text-sm">
              {getInitials(title)}
            </AvatarFallback>
          </Avatar>
        )}

        <div className="min-w-0 flex-1">
          <h1 className="font-medium text-wa-text text-base truncate leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-wa-muted truncate leading-tight mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
