import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { UserProfile } from './UserProfile';
import type { LucideIcon } from 'lucide-react';
import { LogOut, Settings, User as UserIcon } from 'lucide-react';

type MenuItem =
  | {
    label: string;
    href?: string;
    onClick?: () => void;
    icon?: LucideIcon;
    divider?: false;
  }
  | {
    divider: true;
    label?: never;
    href?: never;
    onClick?: never;
    icon?: never;
  };

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
    { label: 'Sign out', onClick: () => { }, icon: LogOut },
  ];

  const items = menuItems.length > 0 ? menuItems : defaultMenuItems;

  return (
    <div className={cn('relative', className)}>
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 h-auto"
      >
        <UserProfile {...user} size="sm" showDetails={false} />
      </Button>

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
                  <Button
                    key={item.label}
                    variant="ghost"
                    onClick={() => {
                      item.onClick?.();
                      if (item.href) {
                        window.location.href = item.href;
                      }
                      setIsOpen(false);
                    }}
                    className="w-full justify-start h-auto px-3 py-2 text-sm"
                  >
                    {item.icon && <item.icon size={16} className="mr-2" />}
                    {item.label}
                  </Button>
                )
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
