import type { ReactNode } from "react";
import { isValidElement } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import type { VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export interface SecondaryHeaderAction {
  label: string;
  icon?: React.ElementType;
  onClick?: () => void;
  buttonProps?: VariantProps<typeof buttonVariants> & ComponentProps<typeof Button>;
  disabled?: boolean;
}

export interface SecondarySidebarHeaderProps {
  title: string;
  description?: ReactNode;
  meta?: ReactNode;
  breadcrumbs?: ReactNode;
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

      {toolbar ? <div className="flex flex-col gap-3">{toolbar}</div> : null}
    </div>
  );
}
