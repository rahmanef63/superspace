import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { getInitials } from "../../../utils";

interface TopBarHeaderProps {
  title: string;
  subtitle?: string;
  avatar?: string;
  onMenuClick?: () => void;
  onMemberClick?: () => void;
}

export function TopBarHeader({
  title,
  subtitle,
  avatar,
  onMenuClick,
  onMemberClick,
}: TopBarHeaderProps) {
  const clickable = Boolean(onMemberClick);

  return (
    <div className="flex min-w-0 flex-1 items-center gap-3">
      {onMenuClick && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="flex h-10 w-10 flex-shrink-0 text-wa-muted transition hover:bg-wa-hover hover:text-wa-text"
          type="button"
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}

      <div
        className={cn(
          "min-w-0 flex-1 rounded-lg p-2 transition-colors",
          clickable ? "cursor-pointer -ml-2 flex items-center gap-3 hover:bg-wa-hover" : "flex items-center gap-3",
        )}
        onClick={clickable ? onMemberClick : undefined}
      >
        <Avatar className="h-10 w-10 flex-shrink-0">
          {avatar ? <AvatarImage src={avatar} /> : null}
          <AvatarFallback className="bg-wa-primary text-sm font-medium text-white">
            {getInitials(title)}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-base font-medium leading-tight text-wa-text">{title}</h1>
          {subtitle && (
            <p className="mt-0.5 truncate text-sm leading-tight text-wa-muted">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}
