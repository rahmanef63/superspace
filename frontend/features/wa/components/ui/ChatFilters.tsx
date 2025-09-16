import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, MessageCircle, Archive, Star } from "lucide-react";

interface ChatFiltersProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  unreadCount?: number;
  groupCount?: number;
  archivedCount?: number;
  starredCount?: number;
}

export function ChatFilters({
  activeFilter,
  onFilterChange,
  unreadCount = 0,
  groupCount = 0,
  archivedCount = 0,
  starredCount = 0
}: ChatFiltersProps) {
  const filters = [
    {
      id: 'all',
      label: 'All',
      icon: MessageCircle,
      count: undefined
    },
    {
      id: 'unread',
      label: 'Unread',
      icon: MessageCircle,
      count: unreadCount
    },
    {
      id: 'groups',
      label: 'Groups',
      icon: Users,
      count: groupCount
    },
    {
      id: 'starred',
      label: 'Starred',
      icon: Star,
      count: starredCount
    },
    {
      id: 'archived',
      label: 'Archived',
      icon: Archive,
      count: archivedCount
    }
  ];

  return (
    <div className="flex gap-2 p-4 overflow-x-auto scrollbar-hide">
      {filters.map((filter) => (
        <Button
          key={filter.id}
          variant={activeFilter === filter.id ? "default" : "outline"}
          size="sm"
          onClick={() => onFilterChange(filter.id)}
          className="flex items-center gap-2 whitespace-nowrap"
        >
          <filter.icon className="h-4 w-4" />
          <span>{filter.label}</span>
          {filter.count !== undefined && filter.count > 0 && (
            <Badge 
              variant={activeFilter === filter.id ? "secondary" : "default"}
              className="ml-1 px-1.5 py-0.5 text-xs min-w-[1.25rem] h-5"
            >
              {filter.count > 99 ? '99+' : filter.count}
            </Badge>
          )}
        </Button>
      ))}
    </div>
  );
}
