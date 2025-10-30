import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { UserProfile } from './UserProfile';
import type { LucideIcon } from 'lucide-react';
import { LogOut, Settings, User as UserIcon } from 'lucide-react';

interface MenuItem {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: LucideIcon;
  divider?: boolean;
}

interface UserMenuProps {
  user: {
    name: string;
    email?: string;
    avatar?: string;
    role?: string;
  };
  menuItems?: MenuItem[];
  className?: string;
}

export const UserMenu: React.FC<UserMenuProps> = ({ user, menuItems = [], className }) => {
  const [isOpen, setIsOpen] = useState(false);

  const defaultMenuItems: MenuItem[] = [
    { label: 'Profile', href: '/profile', icon: UserIcon },
    { label: 'Settings', href: '/settings', icon: Settings },
    { divider: true },
    { label: 'Sign out', onClick: () => console.log('Sign out'), icon: LogOut },
  ];

  const items = menuItems.length > 0 ? menuItems : defaultMenuItems;

  return (
    <div className={cn('relative', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <UserProfile {...user} size="sm" showDetails={false} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg border border-gray-200 shadow-lg z-20">
            <div className="p-3 border-b border-gray-100">
              <UserProfile {...user} size="sm" />
            </div>
            <div className="py-1">
              {items.map((item, index) =>
                item.divider ? (
                  <div key={`divider-${index}`} className="h-px bg-gray-200 my-1" />
                ) : (
                  <button
                    key={item.label}
                    onClick={() => {
                      item.onClick?.();
                      if (item.href) {
                        window.location.href = item.href;
                      }
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors text-left"
                  >
                    {item.icon && <item.icon size={16} />}
                    {item.label}
                  </button>
                )
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
