/**
 * MobileHeader Component
 * Simple header for mobile views with back button and title
 * @module shared/ui/layout/header
 */

"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MobileHeaderProps {
  /** Header title */
  title: string;
  /** Subtitle text */
  subtitle?: string;
  /** Icon to show next to title */
  icon?: LucideIcon;
  /** Show back button */
  showBack?: boolean;
  /** Back button click handler */
  onBack?: () => void;
  /** Additional actions (right side) */
  actions?: React.ReactNode;
  /** Additional className */
  className?: string;
}

export function MobileHeader({
  title,
  subtitle,
  icon: Icon,
  showBack = true,
  onBack,
  actions,
  className,
}: MobileHeaderProps) {
  return (
    <div className={cn(
      "flex items-center gap-3 px-4 py-3 border-b bg-background shrink-0",
      className
    )}>
      {showBack && onBack && (
        <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
      )}
      
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {Icon && <Icon className="h-5 w-5 text-muted-foreground shrink-0" />}
        <div className="min-w-0">
          <h1 className="text-lg font-semibold truncate">{title}</h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
          )}
        </div>
      </div>
      
      {actions && (
        <div className="flex items-center gap-1 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
