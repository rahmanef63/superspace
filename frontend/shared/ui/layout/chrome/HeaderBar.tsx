/**
 * HeaderBar - Top chrome component
 * 
 * Main header for application pages with title, breadcrumbs, and actions.
 * 
 * @example
 * ```tsx
 * <HeaderBar
 *   title="Inbox"
 *   breadcrumbs={[{ label: "Home", href: "/" }, { label: "Inbox" }]}
 *   actions={<Button>New Message</Button>}
 * />
 * ```
 */

import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Breadcrumb {
  label: string;
  href?: string;
  icon?: React.ElementType;
}

export interface HeaderBarProps {
  title?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: ReactNode;
  search?: ReactNode;
  left?: ReactNode;
  right?: ReactNode;
  className?: string;
  variant?: "default" | "minimal";
}

export function HeaderBar({
  title,
  breadcrumbs,
  actions,
  search,
  left,
  right,
  className,
  variant = "default",
}: HeaderBarProps) {
  const showBreadcrumbs = breadcrumbs && breadcrumbs.length > 0;

  return (
    <header
      className={cn(
        "flex items-center justify-between gap-4",
        variant === "default"
          ? "border-b border-border bg-background px-6 py-4"
          : "px-4 py-2",
        className
      )}
    >
      {/* Left Section */}
      <div className="flex flex-1 items-center gap-4 overflow-hidden">
        {left}
        
        <div className="flex flex-col gap-1 overflow-hidden">
          {showBreadcrumbs && (
            <nav className="flex items-center gap-1 text-sm text-muted-foreground">
              {breadcrumbs.map((crumb, index) => (
                <div key={index} className="flex items-center gap-1">
                  {index > 0 && <ChevronRight className="h-3 w-3" />}
                  {crumb.icon && <crumb.icon className="h-3 w-3" />}
                  {crumb.href ? (
                    <Link
                      href={crumb.href}
                      className="hover:text-foreground transition-colors"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="font-medium text-foreground">{crumb.label}</span>
                  )}
                </div>
              ))}
            </nav>
          )}
          
          {title && (
            <h1 className="truncate text-xl font-semibold tracking-tight">
              {title}
            </h1>
          )}
        </div>
      </div>

      {/* Center Section (Search) */}
      {search && (
        <div className="flex-1 max-w-md">
          {search}
        </div>
      )}

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {actions}
        {right}
      </div>
    </header>
  );
}
