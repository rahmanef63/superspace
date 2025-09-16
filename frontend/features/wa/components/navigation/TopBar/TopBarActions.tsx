import { Button } from "@/components/ui/button";
import { Search, Video, Phone, MoreVertical, Info } from "lucide-react";

interface TopBarActionsProps {
  showSearch?: boolean;
  onContactInfoClick: () => void;
}

export function TopBarActions({ showSearch, onContactInfoClick }: TopBarActionsProps) {
  return (
    <div className="flex items-center gap-1 flex-shrink-0">
      {showSearch && (
        <Button
          variant="ghost"
          size="icon"
          className="text-wa-muted hover:text-wa-text hover:bg-wa-hover h-10 w-10 rounded-full transition-colors"
        >
          <Search className="h-5 w-5" />
        </Button>
      )}

      <Button
        variant="ghost"
        size="icon"
        className="text-wa-muted hover:text-wa-text hover:bg-wa-hover h-10 w-10 rounded-full transition-colors hidden sm:flex"
      >
        <Video className="h-5 w-5" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="text-wa-muted hover:text-wa-text hover:bg-wa-hover h-10 w-10 rounded-full transition-colors hidden sm:flex"
      >
        <Phone className="h-5 w-5" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={onContactInfoClick}
        className="text-wa-muted hover:text-wa-text hover:bg-wa-hover h-10 w-10 rounded-full transition-colors hidden sm:flex"
      >
        <Info className="h-5 w-5" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="text-wa-muted hover:text-wa-text hover:bg-wa-hover h-10 w-10 rounded-full transition-colors"
      >
        <MoreVertical className="h-5 w-5" />
      </Button>
    </div>
  );
}
