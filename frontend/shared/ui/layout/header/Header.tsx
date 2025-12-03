/**
 * Header Components
 * 
 * Compound component pattern for the unified header system.
 * Provides flexible, composable header building blocks.
 */

"use client"

import * as React from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Search, X, MoreHorizontal } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { HeaderProvider, useHeaderContext, useHeaderContextSafe } from "./context"
import {
  getHeaderContainerClasses,
  getHeaderSectionClasses,
  getTitleWrapperClasses,
  getTitleClasses,
  getSubtitleClasses,
  getIconContainerClasses,
  getIconSizeClass,
  getIconSizePixels,
  getActionsContainerClasses,
  getBreadcrumbsContainerClasses,
  getBreadcrumbItemClasses,
  getBreadcrumbSeparatorClasses,
  getSearchContainerClasses,
  getSearchInputClasses,
  getHeaderBadgeClasses,
  getMetaContainerClasses,
  getMetaItemClasses,
  getMetaSeparatorClasses,
  getToolbarClasses,
  getBackButtonClasses,
} from "./styles"
import type {
  HeaderRootProps,
  HeaderTitleProps,
  HeaderActionsProps,
  HeaderBreadcrumbsProps,
  HeaderSearchProps,
  HeaderToolbarProps,
  HeaderSectionProps,
  HeaderBackProps,
  HeaderBadgeProps,
  HeaderMetaProps,
  HeaderAction,
  HeaderActionGroup,
  HeaderSize,
  HeaderVariant,
  HeaderLayout,
  BreadcrumbItem,
  HeaderMetaItem,
} from "./types"

// ============================================================================
// Header Root
// ============================================================================

export const HeaderRoot = React.forwardRef<HTMLDivElement, HeaderRootProps>(
  (
    {
      variant = "default",
      size = "md",
      layout = "standard",
      background = true,
      border = true,
      shadow = false,
      sticky = false,
      fullWidth = true,
      className,
      children,
    },
    ref
  ) => {
    return (
      <HeaderProvider
        variant={variant}
        size={size}
        layout={layout}
        sticky={sticky}
        background={background}
        border={border}
      >
        <header
          ref={ref}
          className={getHeaderContainerClasses({
            variant,
            size,
            layout,
            background,
            border,
            shadow,
            sticky,
            fullWidth,
            className,
          })}
        >
          {children}
        </header>
      </HeaderProvider>
    )
  }
)
HeaderRoot.displayName = "HeaderRoot"

// ============================================================================
// Header Section (for split layout)
// ============================================================================

export const HeaderSection = React.forwardRef<HTMLDivElement, HeaderSectionProps>(
  ({ position, align, className, children }, ref) => {
    return (
      <div
        ref={ref}
        className={getHeaderSectionClasses({ position, align, className })}
      >
        {children}
      </div>
    )
  }
)
HeaderSection.displayName = "HeaderSection"

// ============================================================================
// Header Title
// ============================================================================

export const HeaderTitle = React.forwardRef<HTMLDivElement, HeaderTitleProps>(
  ({ title, subtitle, icon: Icon, iconSize, size, className, children }, ref) => {
    const context = useHeaderContextSafe()
    const effectiveSize = size ?? context?.size ?? "md"

    return (
      <div
        ref={ref}
        className={getTitleWrapperClasses({
          layout: context?.layout,
          hasIcon: !!Icon,
          className,
        })}
      >
        {Icon && (
          <div className={getIconContainerClasses({ size: iconSize ?? effectiveSize })}>
            <Icon className={getIconSizeClass(iconSize ?? effectiveSize)} />
          </div>
        )}
        <div className="min-w-0 flex-1">
          {(title || children) && (
            <h1 className={getTitleClasses({ size: effectiveSize })}>
              {children ?? title}
            </h1>
          )}
          {subtitle && (
            <p className={getSubtitleClasses({ size: effectiveSize })}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
    )
  }
)
HeaderTitle.displayName = "HeaderTitle"

// ============================================================================
// Header Actions
// ============================================================================

export const HeaderActions = React.forwardRef<HTMLDivElement, HeaderActionsProps>(
  ({ actions, primaryAction, className, children }, ref) => {
    const context = useHeaderContextSafe()
    const size = context?.size ?? "md"

    const renderAction = (action: HeaderAction) => {
      const ActionIcon = action.icon

      const buttonContent = (
        <Button
          key={action.id}
          variant={action.variant ?? "outline"}
          size={action.size ?? "default"}
          onClick={action.onClick}
          disabled={action.disabled || action.loading}
          className={action.className}
          asChild={!!action.href}
        >
          {action.href ? (
            <Link href={action.href}>
              {ActionIcon && <ActionIcon className="h-4 w-4" />}
              {!action.iconOnly && action.label}
            </Link>
          ) : (
            <>
              {ActionIcon && <ActionIcon className="h-4 w-4" />}
              {!action.iconOnly && action.label}
            </>
          )}
        </Button>
      )

      if (action.tooltip) {
        return (
          <Tooltip key={action.id}>
            <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
            <TooltipContent>
              <p>{action.tooltip}</p>
              {action.shortcut && (
                <kbd className="ml-2 text-xs">{action.shortcut}</kbd>
              )}
            </TooltipContent>
          </Tooltip>
        )
      }

      return buttonContent
    }

    return (
      <div
        ref={ref}
        className={getActionsContainerClasses({ size, className })}
      >
        {children}
        {actions?.map(renderAction)}
        {primaryAction && renderAction(primaryAction)}
      </div>
    )
  }
)
HeaderActions.displayName = "HeaderActions"

// ============================================================================
// Header Action Group (Dropdown)
// ============================================================================

interface HeaderActionGroupProps {
  group: HeaderActionGroup
  className?: string
}

export const HeaderActionGroupMenu: React.FC<HeaderActionGroupProps> = ({
  group,
  className,
}) => {
  const TriggerIcon = group.trigger?.icon ?? MoreHorizontal

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="default" className={className}>
          <TriggerIcon className="h-4 w-4" />
          {!group.trigger?.iconOnly && group.trigger?.label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {group.label && <DropdownMenuLabel>{group.label}</DropdownMenuLabel>}
        {group.label && <DropdownMenuSeparator />}
        <DropdownMenuGroup>
          {group.actions.map((action) => {
            const ActionIcon = action.icon
            return (
              <DropdownMenuItem
                key={action.id}
                onClick={action.onClick}
                disabled={action.disabled}
              >
                {ActionIcon && <ActionIcon className="mr-2 h-4 w-4" />}
                {action.label}
                {action.shortcut && (
                  <span className="ml-auto text-xs text-muted-foreground">
                    {action.shortcut}
                  </span>
                )}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
HeaderActionGroupMenu.displayName = "HeaderActionGroupMenu"

// ============================================================================
// Header Breadcrumbs
// ============================================================================

export const HeaderBreadcrumbs = React.forwardRef<HTMLDivElement, HeaderBreadcrumbsProps>(
  ({ items, separator, maxItems = 5, className }, ref) => {
    const context = useHeaderContextSafe()
    const size = context?.size ?? "md"

    // Collapse breadcrumbs if too many
    const displayItems = React.useMemo(() => {
      if (items.length <= maxItems) return items
      
      const first = items.slice(0, 1)
      const last = items.slice(-2)
      return [...first, { label: "...", isCurrent: false }, ...last]
    }, [items, maxItems])

    const defaultSeparator = <ChevronRight className="h-3.5 w-3.5" />

    return (
      <nav
        ref={ref}
        aria-label="Breadcrumb"
        className={getBreadcrumbsContainerClasses({ size, className })}
      >
        <ol className="flex items-center gap-1">
          {displayItems.map((item, index) => {
            const ItemIcon = item.icon
            const isLast = index === displayItems.length - 1
            const isLink = !!(item.href || item.onClick)

            return (
              <li key={index} className="flex items-center">
                {index > 0 && (
                  <span className={getBreadcrumbSeparatorClasses()}>
                    {separator ?? defaultSeparator}
                  </span>
                )}
                {isLink && !item.isCurrent ? (
                  item.href ? (
                    <Link
                      href={item.href}
                      className={getBreadcrumbItemClasses({ isLink: true, isCurrent: item.isCurrent })}
                    >
                      {ItemIcon && <ItemIcon className="h-3.5 w-3.5" />}
                      <span>{item.label}</span>
                    </Link>
                  ) : (
                    <button
                      onClick={item.onClick}
                      className={getBreadcrumbItemClasses({ isLink: true, isCurrent: item.isCurrent })}
                    >
                      {ItemIcon && <ItemIcon className="h-3.5 w-3.5" />}
                      <span>{item.label}</span>
                    </button>
                  )
                ) : (
                  <span
                    className={getBreadcrumbItemClasses({
                      isLink: false,
                      isCurrent: item.isCurrent || isLast,
                    })}
                    aria-current={item.isCurrent || isLast ? "page" : undefined}
                  >
                    {ItemIcon && <ItemIcon className="h-3.5 w-3.5" />}
                    <span>{item.label}</span>
                  </span>
                )}
              </li>
            )
          })}
        </ol>
      </nav>
    )
  }
)
HeaderBreadcrumbs.displayName = "HeaderBreadcrumbs"

// ============================================================================
// Header Search
// ============================================================================

export const HeaderSearch = React.forwardRef<HTMLDivElement, HeaderSearchProps>(
  (
    {
      value,
      onChange,
      placeholder = "Search...",
      icon: CustomIcon,
      clearable = true,
      onClear,
      onSubmit,
      shortcut,
      expandable,
      position = "left",
      className,
    },
    ref
  ) => {
    const context = useHeaderContextSafe()
    const size = context?.size ?? "md"
    const [isExpanded, setIsExpanded] = React.useState(!expandable)
    const inputRef = React.useRef<HTMLInputElement>(null)

    const SearchIcon = CustomIcon ?? Search

    const handleClear = () => {
      onChange("")
      onClear?.()
      inputRef.current?.focus()
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && onSubmit) {
        onSubmit(value)
      }
      if (e.key === "Escape" && expandable) {
        setIsExpanded(false)
      }
    }

    if (expandable && !isExpanded) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setIsExpanded(true)
                setTimeout(() => inputRef.current?.focus(), 0)
              }}
            >
              <SearchIcon className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            Search {shortcut && <kbd className="ml-2">{shortcut}</kbd>}
          </TooltipContent>
        </Tooltip>
      )
    }

    return (
      <div
        ref={ref}
        className={getSearchContainerClasses({ size, expanded: !expandable, className })}
      >
        <SearchIcon className="absolute left-3 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={getSearchInputClasses({ size, hasIcon: true })}
        />
        {clearable && value && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 h-6 w-6"
            onClick={handleClear}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    )
  }
)
HeaderSearch.displayName = "HeaderSearch"

// ============================================================================
// Header Badge
// ============================================================================

export const HeaderBadge = React.forwardRef<HTMLSpanElement, HeaderBadgeProps>(
  ({ text, variant = "default", icon: Icon, className }, ref) => {
    const context = useHeaderContextSafe()
    const size = context?.size ?? "md"

    return (
      <span
        ref={ref}
        className={getHeaderBadgeClasses({ variant, size, className })}
      >
        {Icon && <Icon className="mr-1 h-3 w-3" />}
        {text}
      </span>
    )
  }
)
HeaderBadge.displayName = "HeaderBadge"

// ============================================================================
// Header Meta
// ============================================================================

export const HeaderMeta = React.forwardRef<HTMLDivElement, HeaderMetaProps>(
  ({ items, separator = "dot", className }, ref) => {
    const context = useHeaderContextSafe()
    const size = context?.size ?? "md"

    const getSeparatorContent = () => {
      switch (separator) {
        case "dot":
          return "•"
        case "pipe":
          return "|"
        case "slash":
          return "/"
        default:
          return null
      }
    }

    return (
      <div
        ref={ref}
        className={getMetaContainerClasses({ size, className })}
      >
        {items.map((item, index) => {
          const ItemIcon = item.icon
          return (
            <React.Fragment key={index}>
              {index > 0 && separator !== "none" && (
                <span className={getMetaSeparatorClasses({ separator })}>
                  {getSeparatorContent()}
                </span>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className={getMetaItemClasses()}>
                    {ItemIcon && <ItemIcon className="h-3.5 w-3.5" />}
                    <span>{item.label}:</span>
                    <span className="font-medium text-foreground">{item.value}</span>
                  </span>
                </TooltipTrigger>
                {item.tooltip && <TooltipContent>{item.tooltip}</TooltipContent>}
              </Tooltip>
            </React.Fragment>
          )
        })}
      </div>
    )
  }
)
HeaderMeta.displayName = "HeaderMeta"

// ============================================================================
// Header Toolbar
// ============================================================================

export const HeaderToolbar = React.forwardRef<HTMLDivElement, HeaderToolbarProps>(
  ({ className, children }, ref) => {
    const context = useHeaderContextSafe()
    const size = context?.size ?? "md"

    return (
      <div
        ref={ref}
        className={getToolbarClasses({ size, border: true, className })}
      >
        {children}
      </div>
    )
  }
)
HeaderToolbar.displayName = "HeaderToolbar"

// ============================================================================
// Header Back Button
// ============================================================================

export const HeaderBack = React.forwardRef<HTMLButtonElement, HeaderBackProps>(
  ({ onClick, href, label = "Back", icon: CustomIcon, className }, ref) => {
    const context = useHeaderContextSafe()
    const size = context?.size ?? "md"
    const BackIcon = CustomIcon ?? ChevronLeft

    const content = (
      <>
        <BackIcon className="h-4 w-4" />
        {label && <span>{label}</span>}
      </>
    )

    if (href) {
      return (
        <Link
          href={href}
          className={getBackButtonClasses({ size, className })}
        >
          {content}
        </Link>
      )
    }

    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        className={getBackButtonClasses({ size, className })}
      >
        {content}
      </button>
    )
  }
)
HeaderBack.displayName = "HeaderBack"

// ============================================================================
// Compound Export
// ============================================================================

export const Header = Object.assign(HeaderRoot, {
  Root: HeaderRoot,
  Section: HeaderSection,
  Title: HeaderTitle,
  Actions: HeaderActions,
  ActionGroup: HeaderActionGroupMenu,
  Breadcrumbs: HeaderBreadcrumbs,
  Search: HeaderSearch,
  Badge: HeaderBadge,
  Meta: HeaderMeta,
  Toolbar: HeaderToolbar,
  Back: HeaderBack,
})
