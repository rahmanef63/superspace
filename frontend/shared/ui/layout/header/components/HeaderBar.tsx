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
import type { BreadcrumbItem } from "../types";
import { Header } from "..";

export interface Breadcrumb extends BreadcrumbItem {}

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
  return (
    <Header
      variant={variant === "minimal" ? "minimal" : "default"}
      layout="standard"
      className={className}
      size={variant === "minimal" ? "sm" : "lg"}
    >
      {/* Left Section */}
      <div className="flex flex-1 items-center gap-4 overflow-hidden">
        {left}
        
        <div className="flex flex-col gap-1 overflow-hidden">
          {breadcrumbs && breadcrumbs.length > 0 && (
            <Header.Breadcrumbs items={breadcrumbs} />
          )}
          
          {title && (
            <Header.Title title={title} size="lg" />
          )}
        </div>
      </div>

      {/* Center Section (Search) */}
      {search && (
        <div className="flex-1 max-w-md px-4">
          {search}
        </div>
      )}

      {/* Right Section */}
      <Header.Actions>
        {actions}
        {right}
      </Header.Actions>
    </Header>
  );
}
