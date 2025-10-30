import React from 'react';
import { cn } from '@/lib/utils';

interface UserProfileProps {
  name: string;
  email?: string;
  avatar?: string;
  role?: string;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
  className?: string;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  name,
  email,
  avatar,
  role,
  size = 'md',
  showDetails = true,
  className
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base'
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className={cn(
        "rounded-full bg-gray-200 flex items-center justify-center font-medium text-gray-700",
        sizeClasses[size]
      )}>
        {avatar ? (
          <img 
            src={avatar} 
            alt={name}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          getInitials(name)
        )}
      </div>
      
      {showDetails && (
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900 truncate">
            {name}
          </div>
          {email && (
            <div className="text-xs text-gray-500 truncate">
              {email}
            </div>
          )}
          {role && (
            <div className="text-xs text-gray-400 truncate">
              {role}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
