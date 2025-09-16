import { Button } from "@/components/ui/button";
import { Search, Video, Phone, MoreVertical, Info } from "lucide-react";

interface TopBarActionsProps {
  showSearch?: boolean;
  onContactInfoClick: () => void;
}

export function TopBarActions({ showSearch, onContactInfoClick }: TopBarActionsProps) {
  return (
    <div className="flex items-center gap-0.5 md:gap-1 flex-shrink-0">
      {showSearch && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-wa-muted hover:text-wa-text hover:bg-wa-hover h-8 w-8 md:h-10 md:w-10"
        >
          <Search className="h-4 w-4 md:h-5 md:w-5" />
        </Button>
      )}
      
      <Button 
        variant="ghost" 
        size="icon" 
        className="text-wa-muted hover:text-wa-text hover:bg-wa-hover h-8 w-8 md:h-10 md:w-10"
      >
        <Video className="h-4 w-4 md:h-5 md:w-5" />
      </Button>
      
      <Button 
        variant="ghost" 
        size="icon" 
        className="text-wa-muted hover:text-wa-text hover:bg-wa-hover h-8 w-8 md:h-10 md:w-10"
      >
        <Phone className="h-4 w-4 md:h-5 md:w-5" />
      </Button>
      
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onContactInfoClick}
        className="text-wa-muted hover:text-wa-text hover:bg-wa-hover h-8 w-8 md:h-10 md:w-10"
      >
        <Info className="h-4 w-4 md:h-5 md:w-5" />
      </Button>
      
      <Button 
        variant="ghost" 
        size="icon" 
        className="text-wa-muted hover:text-wa-text hover:bg-wa-hover h-8 w-8 md:h-10 md:w-10"
      >
        <MoreVertical className="h-4 w-4 md:h-5 md:w-5" />
      </Button>
    </div>
  );
}
