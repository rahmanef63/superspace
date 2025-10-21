import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { SecondarySidebarHeader, type SecondarySidebarHeaderProps } from "./SecondarySidebarHeader";
import { SecondarySidebar, type SecondarySidebarProps } from "./SecondarySidebar";

export interface SecondarySidebarLayoutProps {
  header?: ReactNode;
  sidebar?: ReactNode;
  children: ReactNode;
  className?: string;
  headerClassName?: string;
  sidebarClassName?: string;
  contentClassName?: string;
  bodyClassName?: string;
  headerProps?: SecondarySidebarHeaderProps;
  sidebarProps?: SecondarySidebarProps;
}

function SecondarySidebarLayoutBase({
  header,
  sidebar,
  children,
  className,
  headerClassName,
  sidebarClassName,
  contentClassName,
  bodyClassName,
  headerProps,
  sidebarProps,
}: SecondarySidebarLayoutProps) {
  const resolvedHeader = header ?? (headerProps ? <SecondarySidebarHeader {...headerProps} /> : null);
  const resolvedSidebar = sidebar ?? (sidebarProps ? <SecondarySidebar {...sidebarProps} /> : null);

  return (
    <div className={cn("flex min-h-0 flex-col", className)}>
      {resolvedHeader ? (
        <header className={cn("shrink-0", headerClassName)}>
          {resolvedHeader}
        </header>
      ) : null}

      <div className={cn("flex min-h-0 flex-1 overflow-hidden", bodyClassName)}>
        {resolvedSidebar ? (
          <aside
            className={cn(
              "w-80 shrink-0 overflow-y-auto border-r bg-muted/30",
              sidebarClassName,
            )}
          >
            {resolvedSidebar}
          </aside>
        ) : null}

        <main className={cn("flex-1 min-h-0", contentClassName)}>
          {children}
        </main>
      </div>
    </div>
  );
}

type SecondarySidebarLayoutComponent = ((
  props: SecondarySidebarLayoutProps
) => JSX.Element) & {
  Header: typeof SecondarySidebarHeader;
  Sidebar: typeof SecondarySidebar;
};

export const SecondarySidebarLayout = Object.assign(SecondarySidebarLayoutBase, {
  Header: SecondarySidebarHeader,
  Sidebar: SecondarySidebar,
}) as SecondarySidebarLayoutComponent;

// Re-export types and components
export type {
  SecondarySidebarHeaderProps,
  SecondaryHeaderAction,
} from "./SecondarySidebarHeader";

export type {
  SecondarySidebarProps,
  SecondarySidebarSectionProps,
  SecondarySidebarItem,
} from "./SecondarySidebar";

export { SecondarySidebarHeader } from "./SecondarySidebarHeader";
export { SecondarySidebar } from "./SecondarySidebar";
