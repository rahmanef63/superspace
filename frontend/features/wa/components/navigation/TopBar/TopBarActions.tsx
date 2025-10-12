import { Button } from "@/components/ui/button";
import { Search, Video, Phone, MoreVertical, Info } from "lucide-react";

interface TopBarActionsProps {
  showSearch?: boolean;
  onContactInfoClick?: () => void;
}

export function TopBarActions({ showSearch, onContactInfoClick }: TopBarActionsProps) {
  const canOpenContact = Boolean(onContactInfoClick);

  return (
    <div className="flex flex-shrink-0 items-center gap-1">
      {showSearch && (
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full text-wa-muted transition-colors hover:bg-wa-hover hover:text-wa-text"
          type="button"
        >
          <Search className="h-5 w-5" />
        </Button>
      )}

      <Button
        variant="ghost"
        size="icon"
        className="hidden h-10 w-10 rounded-full text-wa-muted transition-colors hover:bg-wa-hover hover:text-wa-text sm:flex"
        type="button"
      >
        <Video className="h-5 w-5" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="hidden h-10 w-10 rounded-full text-wa-muted transition-colors hover:bg-wa-hover hover:text-wa-text sm:flex"
        type="button"
      >
        <Phone className="h-5 w-5" />
      </Button>

      {canOpenContact && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onContactInfoClick}
          className="hidden h-10 w-10 rounded-full text-wa-muted transition-colors hover:bg-wa-hover hover:text-wa-text sm:flex"
          type="button"
        >
          <Info className="h-5 w-5" />
        </Button>
      )}

      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10 rounded-full text-wa-muted transition-colors hover:bg-wa-hover hover:text-wa-text"
        type="button"
      >
        <MoreVertical className="h-5 w-5" />
      </Button>
    </div>
  );
}
