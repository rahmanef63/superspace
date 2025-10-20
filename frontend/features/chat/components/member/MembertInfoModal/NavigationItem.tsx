import { cn } from "@/lib/utils";

interface NavigationItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isActive?: boolean;
  onClick: () => void;
  isMobile: boolean;
}

export function NavigationItem({ 
  icon: Icon, 
  label, 
  isActive, 
  onClick, 
  isMobile 
}: NavigationItemProps) {
  if (isMobile) {
    return (
      <button
        onClick={onClick}
        className={cn(
          "flex items-center gap-2 p-2 rounded-wa-md text-xs font-medium whitespace-nowrap transition-colors",
          isActive 
            ? 'bg-wa-active text-white shadow-wa-sm' 
            : 'text-wa-muted hover:bg-wa-hover hover:text-wa-text'
        )}
      >
        <Icon className="h-4 w-4 flex-shrink-0" />
        <span>{label}</span>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 p-3 rounded-wa-lg text-left transition-colors",
        isActive 
          ? 'bg-wa-active text-white shadow-wa-sm' 
          : 'text-wa-muted hover:bg-wa-hover hover:text-wa-text'
      )}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      <span className="font-medium">{label}</span>
    </button>
  );
}
