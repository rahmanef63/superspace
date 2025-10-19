import { Users } from "lucide-react";

interface GroupsSectionProps {
  isMobile: boolean;
}

export function GroupsSection({ isMobile }: GroupsSectionProps) {
  // Check if we should show groups list or empty state
  const hasGroups = true; // This would come from props/context in real app
  
  if (!hasGroups) {
    return (
      <div className={`text-center ${isMobile ? 'py-8' : 'py-12'}`}>
        <Users className={`text-wa-muted mx-auto mb-4 ${isMobile ? 'h-12 w-12' : 'h-16 w-16'}`} />
        <p className={`text-wa-muted ${isMobile ? 'text-base' : 'text-lg'}`}>No groups in common</p>
      </div>
    );
  }

  const groups = [
    { id: '1', name: 'Alamat', members: 2, avatar: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=40&h=40&fit=crop' },
    { id: '2', name: 'Berkas', members: 2, avatar: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=40&h=40&fit=crop' },
    { id: '3', name: 'Deadline', members: 2, avatar: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=40&h=40&fit=crop' },
    { id: '4', name: 'Faza', members: 18, avatar: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=40&h=40&fit=crop' },
    { id: '5', name: 'Home 🏠', members: 2, avatar: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=40&h=40&fit=crop' },
    { id: '6', name: 'kokas', members: 2 },
    { id: '7', name: 'TRIP 3 NEGARA 18-24 Juni', members: 29 },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-wa-text font-medium">Groups in common ({groups.length})</h3>
      </div>
      
      <div className="space-y-2">
        {groups.map((group) => (
          <div 
            key={group.id}
            className="flex items-center gap-3 p-3 rounded-wa-lg bg-wa-surface hover:bg-wa-hover cursor-pointer transition-colors border border-wa-border"
          >
            <div className={`flex-shrink-0 rounded-full overflow-hidden bg-wa-muted ${
              isMobile ? 'w-10 h-10' : 'w-12 h-12'
            }`}>
              {group.avatar ? (
                <img src={group.avatar} alt={group.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Users className={`text-wa-muted ${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-wa-text font-medium truncate">{group.name}</p>
              <p className="text-wa-muted text-sm">{group.members} members</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
