import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { isValidElement } from "react";
import { Search } from "lucide-react";

import { Button, type ButtonProps } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

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

export interface SecondaryHeaderAction {
  label: string;
  icon?: React.ElementType;
  onClick?: () => void;
  buttonProps?: ButtonProps;
  disabled?: boolean;
}

export interface SecondaryHeaderSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  inputProps?: Omit<ComponentProps<typeof Input>, "value" | "onChange" | "placeholder">;
}

export interface SecondarySidebarHeaderProps {
  title: string;
  description?: ReactNode;
  meta?: ReactNode;
  breadcrumbs?: ReactNode;
  search?: SecondaryHeaderSearchProps;
  toolbar?: ReactNode;
  primaryAction?: SecondaryHeaderAction | ReactNode;
  secondaryActions?: ReactNode;
  children?: ReactNode;
  className?: string;
}

function renderPrimaryAction(primaryAction?: SecondarySidebarHeaderProps["primaryAction"]) {
  if (!primaryAction) {
    return null;
  }

  if (isValidElement(primaryAction)) {
    return primaryAction;
  }

  const { label, icon: Icon, onClick, buttonProps, disabled } = primaryAction as SecondaryHeaderAction;
  const { className: buttonClassName, ...restButtonProps } = buttonProps ?? {};

  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className={cn("gap-2", buttonClassName)}
      {...restButtonProps}
    >
      {Icon ? <Icon className="h-4 w-4" /> : null}
      <span>{label}</span>
    </Button>
  );
}

export function SecondarySidebarHeader({
  title,
  description,
  meta,
  breadcrumbs,
  search,
  toolbar,
  primaryAction,
  secondaryActions,
  children,
  className,
}: SecondarySidebarHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-4 border-b bg-background p-6", className)}>
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          {description ? (
            <div className="text-sm text-muted-foreground">{description}</div>
          ) : null}
          {meta ? <div className="text-xs text-muted-foreground">{meta}</div> : null}
        </div>

        {secondaryActions || primaryAction ? (
          <div className="flex flex-wrap items-center justify-end gap-2">
            {secondaryActions}
            {renderPrimaryAction(primaryAction)}
          </div>
        ) : null}
      </div>

      {breadcrumbs ? (
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          {breadcrumbs}
        </div>
      ) : null}

      {children ? <div className="flex flex-col gap-3">{children}</div> : null}

      {search ? (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search.value}
            onChange={(event) => search.onChange(event.target.value)}
            placeholder={search.placeholder}
            className={cn("pl-10", search.inputProps?.className)}
            {...search.inputProps}
          />
        </div>
      ) : null}

      {toolbar ? <div className="flex flex-col gap-3">{toolbar}</div> : null}
    </div>
  );
}

export interface SecondarySidebarItem {
  id: string | number;
  label: string;
  icon?: React.ElementType;
  badge?: ReactNode;
  description?: ReactNode;
  trailing?: ReactNode;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
  className?: string;
}

export interface SecondarySidebarSectionProps {
  id?: string;
  title?: string;
  icon?: React.ElementType;
  description?: ReactNode;
  action?: ReactNode;
  items?: SecondarySidebarItem[];
  content?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export interface SecondarySidebarProps {
  sections?: SecondarySidebarSectionProps[];
  header?: ReactNode;
  footer?: ReactNode;
  className?: string;
  headerClassName?: string;
  footerClassName?: string;
  contentClassName?: string;
  variant?: "panel" | "minimal";
}

function SecondarySidebarListItem({
  label,
  icon: Icon,
  badge,
  description,
  trailing,
  href,
  onClick,
  disabled,
  active,
  className,
}: SecondarySidebarItem) {
  const content = (
    <div className="flex w-full items-center gap-2">
      {Icon ? <Icon className="h-4 w-4 shrink-0" /> : null}
      <div className="flex flex-1 flex-col overflow-hidden text-left">
        <span className="truncate text-sm font-medium">{label}</span>
        {description ? (
          <span className="truncate text-xs text-muted-foreground">{description}</span>
        ) : null}
      </div>
      {badge ? <span className="shrink-0">{badge}</span> : null}
      {trailing ? <span className="shrink-0">{trailing}</span> : null}
    </div>
  );

  const buttonClass = cn(
    "w-full justify-start px-2 py-2 text-sm",
    description ? "items-start gap-3" : "items-center gap-2",
    className,
  );

  if (href) {
    return (
      <Button
        asChild
        variant={active ? "secondary" : "ghost"}
        size="sm"
        className={buttonClass}
        disabled={disabled}
      >
        <Link href={href}>{content}</Link>
      </Button>
    );
  }

  return (
    <Button
      variant={active ? "secondary" : "ghost"}
      size="sm"
      className={buttonClass}
      onClick={onClick}
      disabled={disabled}
    >
      {content}
    </Button>
  );
}

function SecondarySidebarSection({
  title,
  icon: Icon,
  description,
  action,
  items,
  content,
  footer,
  className,
  variant,
}: SecondarySidebarSectionProps & { variant: "panel" | "minimal" }) {
  return (
    <section className={cn(variant === "minimal" ? "space-y-2" : "space-y-3", className)}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            {Icon ? <Icon className="h-4 w-4 text-muted-foreground" /> : null}
            {title ? <span>{title}</span> : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      )}
      {description ? <div className="text-xs text-muted-foreground">{description}</div> : null}
      {content}
      {items ? (
        <div className="space-y-1">
          {items.map((item) => (
            <SecondarySidebarListItem key={item.id ?? item.label} {...item} />
          ))}
        </div>
      ) : null}
      {footer}
    </section>
  );
}

export function SecondarySidebar({
  sections = [],
  header,
  footer,
  className,
  headerClassName,
  footerClassName,
  contentClassName,
  variant = "panel",
}: SecondarySidebarProps) {
  const headerClasses =
    variant === "panel"
      ? cn("border-b border-border bg-background p-4", headerClassName)
      : cn("p-2", headerClassName);
  const contentClasses =
    variant === "panel"
      ? cn("flex-1 space-y-6 overflow-y-auto p-4", contentClassName)
      : cn("flex-1 space-y-4 overflow-y-auto px-2 py-2", contentClassName);
  const footerClasses =
    variant === "panel"
      ? cn("border-t border-border bg-background p-4", footerClassName)
      : cn("p-2", footerClassName);

  return (
    <div className={cn("flex h-full flex-col", className)}>
      {header ? <div className={headerClasses}>{header}</div> : null}
      <div className={contentClasses}>
        {sections.map((section, index) => (
          <SecondarySidebarSection
            key={section.id ?? `${section.title ?? "section"}-${index}`}
            variant={variant}
            {...section}
          />
        ))}
      </div>
      {footer ? <div className={footerClasses}>{footer}</div> : null}
    </div>
  );
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

export type {
  SecondarySidebarHeaderProps,
  SecondarySidebarProps,
  SecondarySidebarSectionProps,
  SecondarySidebarItem,
  SecondaryHeaderSearchProps,
  SecondaryHeaderAction,
};
