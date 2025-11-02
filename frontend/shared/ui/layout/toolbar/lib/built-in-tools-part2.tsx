/**
 * Built-in Toolbar Tools - Part 2
 * View, Actions, Tabs, and Breadcrumb tools
 *
 * @author SuperSpace Team
 * @version 1.0.0
 */

import { z } from "zod";
import {
  Grid3x3,
  List,
  LayoutGrid,
  Table,
  Kanban,
  Calendar,
  Eye,
  Image as ImageIcon,
  FileText,
  MoreVertical,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";
import { createTool, toolbarRegistry } from "./toolbar-registry";
import type {
  ViewToolParams,
  ActionsToolParams,
  TabsToolParams,
  BreadcrumbToolParams,
  ViewMode,
} from "./types";

/**
 * VIEW TOOL
 * View mode switcher with responsive layout
 */
const ViewParamsSchema = z.object({
  options: z.array(
    z.object({
      label: z.string(),
      value: z.string(),
      icon: z.any(),
      description: z.string().optional(),
    })
  ),
  currentView: z.string(),
  onChange: z.function(),
  layout: z.enum(["buttons", "dropdown", "segmented"]).optional(),
  showLabels: z.boolean().optional(),
});

// Default view mode icons
const VIEW_MODE_ICONS: Record<ViewMode, React.ElementType> = {
  grid: Grid3x3,
  list: List,
  tiles: LayoutGrid,
  detail: Eye,
  thumbnails: ImageIcon,
  content: FileText,
  table: Table,
  kanban: Kanban,
  calendar: Calendar,
};

export const viewTool = createTool({
  id: "view",
  title: "View Tool",
  description: "View mode switcher with multiple layout options",
  paramsSchema: ViewParamsSchema,
  defaultResponsive: {
    hideMobile: false,
  },
  render: ({ tool, isMobile, isTablet }) => {
    const params = tool.params as ViewToolParams;
    const layout = params.layout ?? (isMobile ? "dropdown" : "buttons");
    const showLabels = params.showLabels ?? !isMobile;

    // Dropdown layout (mobile-friendly)
    if (layout === "dropdown" || (isMobile && params.options.length > 3)) {
      const currentOption = params.options.find((o) => o.value === params.currentView);
      const CurrentIcon = currentOption?.icon ?? Eye;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size={isMobile ? "sm" : "default"}
              className={cn("gap-1.5 h-8 md:h-9", tool.className)}
            >
              <CurrentIcon className="h-3.5 w-3.5 md:h-4 md:w-4" />
              {!isMobile && currentOption && <span className="text-xs md:text-sm">{currentOption.label}</span>}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>View mode</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {params.options.map((option) => {
              const Icon = option.icon;
              const isActive = option.value === params.currentView;
              return (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => params.onChange(option.value as ViewMode)}
                  className={cn(isActive && "bg-accent")}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  <div className="flex-1">
                    <div className="font-medium">{option.label}</div>
                    {option.description && (
                      <div className="text-xs text-muted-foreground">
                        {option.description}
                      </div>
                    )}
                  </div>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    // Segmented control layout (tablet/desktop)
    if (layout === "segmented") {
      return (
        <div className="inline-flex h-8 items-center justify-center rounded-md bg-muted p-1 md:h-9">
          {params.options.map((option) => {
            const Icon = option.icon;
            const isActive = option.value === params.currentView;
            return (
              <button
                key={option.value}
                onClick={() => params.onChange(option.value as ViewMode)}
                className={cn(
                  "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-2 py-1 text-xs font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 md:px-3 md:text-sm",
                  isActive
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-3.5 w-3.5 md:h-4 md:w-4" />
                {showLabels && <span className="ml-1.5 hidden sm:inline">{option.label}</span>}
              </button>
            );
          })}
        </div>
      );
    }

    // Buttons layout (default for desktop)
    return (
      <div className="flex items-center gap-0.5 rounded-md border p-1">
        {params.options.map((option) => {
          const Icon = option.icon;
          const isActive = option.value === params.currentView;
          return (
            <Button
              key={option.value}
              variant={isActive ? "secondary" : "ghost"}
              size={isMobile ? "sm" : "default"}
              className={cn(
                "h-6 w-6 p-0 md:h-7 md:w-7",
                showLabels && !isMobile && "w-auto px-2 md:px-3",
                tool.className
              )}
              onClick={() => params.onChange(option.value as ViewMode)}
            >
              <Icon className="h-3.5 w-3.5 md:h-4 md:w-4" />
              {showLabels && !isMobile && (
                <span className="ml-1.5 text-xs md:text-sm">{option.label}</span>
              )}
            </Button>
          );
        })}
      </div>
    );
  },
});

/**
 * ACTIONS TOOL
 * Action buttons with overflow menu
 */
const ActionsParamsSchema = z.object({
  actions: z.array(
    z.object({
      label: z.string(),
      icon: z.any().optional(),
      onClick: z.function(),
      variant: z.enum(["default", "destructive", "outline", "secondary", "ghost", "link"]).optional(),
      disabled: z.boolean().optional(),
      loading: z.boolean().optional(),
      shortcut: z.string().optional(),
    })
  ),
  layout: z.enum(["inline", "dropdown", "menu"]).optional(),
  primary: z.string().optional(),
  maxVisible: z.number().optional(),
});

export const actionsTool = createTool({
  id: "actions",
  title: "Actions Tool",
  description: "Action buttons with responsive overflow menu",
  paramsSchema: ActionsParamsSchema,
  defaultResponsive: {
    collapseOnMobile: true,
  },
  render: ({ tool, isMobile, isTablet }) => {
    const params = tool.params as ActionsToolParams;
    const maxVisible = params.maxVisible ?? (isMobile ? 1 : isTablet ? 2 : 3);
    const visibleActions = params.actions.slice(0, maxVisible);
    const overflowActions = params.actions.slice(maxVisible);

    return (
      <div className="flex items-center gap-1 md:gap-2">
        {visibleActions.map((action, idx) => {
          const Icon = action.icon;
          const isPrimary = action.label === params.primary;
          return (
            <Button
              key={action.label}
              variant={isPrimary ? "default" : action.variant ?? "outline"}
              size={isMobile ? "sm" : "default"}
              onClick={action.onClick}
              disabled={action.disabled || action.loading}
              className={cn(
                "gap-1.5 h-8 text-xs md:h-9 md:text-sm",
                isMobile && !Icon && "px-2",
                tool.className
              )}
            >
              {action.loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin md:h-4 md:w-4" />
              ) : Icon ? (
                <Icon className="h-3.5 w-3.5 md:h-4 md:w-4" />
              ) : null}
              {(!isMobile || isPrimary) && <span>{action.label}</span>}
            </Button>
          );
        })}

        {overflowActions.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size={isMobile ? "sm" : "default"}
                className="h-8 w-8 p-0 md:h-9 md:w-9"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {overflowActions.map((action) => {
                const Icon = action.icon;
                return (
                  <DropdownMenuItem
                    key={action.label}
                    onClick={action.onClick}
                    disabled={action.disabled || action.loading}
                  >
                    {Icon && <Icon className="mr-2 h-4 w-4" />}
                    <span className="flex-1">{action.label}</span>
                    {action.shortcut && !isMobile && (
                      <span className="ml-4 text-xs text-muted-foreground">
                        {action.shortcut}
                      </span>
                    )}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    );
  },
});

/**
 * TABS TOOL
 * Tab navigation with responsive design
 */
const TabsParamsSchema = z.object({
  tabs: z.array(
    z.object({
      label: z.string(),
      value: z.string(),
      icon: z.any().optional(),
      count: z.number().optional(),
      disabled: z.boolean().optional(),
    })
  ),
  currentTab: z.string(),
  onChange: z.function(),
  variant: z.enum(["default", "pills", "underline"]).optional(),
});

export const tabsTool = createTool({
  id: "tabs",
  title: "Tabs Tool",
  description: "Tab navigation with count badges",
  paramsSchema: TabsParamsSchema,
  defaultResponsive: {
    hideMobile: false,
  },
  render: ({ tool, isMobile }) => {
    const params = tool.params as TabsToolParams;

    return (
      <Tabs value={params.currentTab} onValueChange={params.onChange} className="w-full">
        <TabsList className={cn("h-8 md:h-9", isMobile && "w-full grid", `grid-cols-${params.tabs.length}`)}>
          {params.tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                disabled={tab.disabled}
                className="gap-1.5 text-xs data-[state=active]:text-foreground md:text-sm"
              >
                {Icon && <Icon className="h-3.5 w-3.5 md:h-4 md:w-4" />}
                <span className={cn(isMobile && "truncate")}>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <Badge variant="secondary" className="ml-1 h-4 px-1 text-[10px] md:h-5 md:px-1.5">
                    {tab.count}
                  </Badge>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>
    );
  },
});

/**
 * BREADCRUMB TOOL  
 * Breadcrumb navigation with collapse support
 */
const BreadcrumbParamsSchema = z.object({
  items: z.array(
    z.object({
      label: z.string(),
      href: z.string().optional(),
      onClick: z.function().optional(),
      icon: z.any().optional(),
    })
  ),
  separator: z.any().optional(),
  maxItems: z.number().optional(),
  collapseBefore: z.number().optional(),
});

export const breadcrumbTool = createTool({
  id: "breadcrumb",
  title: "Breadcrumb Tool",
  description: "Breadcrumb navigation with responsive collapse",
  paramsSchema: BreadcrumbParamsSchema,
  defaultResponsive: {
    hideMobile: false,
  },
  render: ({ tool, isMobile }) => {
    const params = tool.params as BreadcrumbToolParams;
    const maxItems = params.maxItems ?? (isMobile ? 2 : 4);
    const items = params.items;

    // Collapse logic for many items
    const displayItems = items.length > maxItems
      ? [
          ...items.slice(0, 1),
          { label: "...", value: "ellipsis" },
          ...items.slice(-(maxItems - 1)),
        ]
      : items;

    return (
      <Breadcrumb>
        <BreadcrumbList className="flex-nowrap">
          {displayItems.map((item: any, idx) => {
            const Icon = item.icon;
            const isLast = idx === displayItems.length - 1;

            if (item.value === "ellipsis") {
              return (
                <BreadcrumbItem key="ellipsis">
                  <span className="text-muted-foreground">...</span>
                </BreadcrumbItem>
              );
            }

            return (
              <BreadcrumbItem key={item.label + idx}>
                {isLast ? (
                  <BreadcrumbPage className="flex items-center gap-1.5 text-xs md:text-sm">
                    {Icon && <Icon className="h-3.5 w-3.5 md:h-4 md:w-4" />}
                    <span className="truncate max-w-[120px] md:max-w-[200px]">{item.label}</span>
                  </BreadcrumbPage>
                ) : (
                  <>
                    <BreadcrumbLink
                      href={item.href}
                      onClick={item.onClick}
                      className="flex items-center gap-1.5 text-xs md:text-sm"
                    >
                      {Icon && <Icon className="h-3.5 w-3.5 md:h-4 md:w-4" />}
                      <span className="truncate max-w-[100px] md:max-w-[150px]">{item.label}</span>
                    </BreadcrumbLink>
                    <BreadcrumbSeparator />
                  </>
                )}
              </BreadcrumbItem>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    );
  },
});

// Auto-register on import
toolbarRegistry.register(viewTool);
toolbarRegistry.register(actionsTool);
toolbarRegistry.register(tabsTool);
toolbarRegistry.register(breadcrumbTool);

export const builtInToolsPart2 = {
  view: viewTool,
  actions: actionsTool,
  tabs: tabsTool,
  breadcrumb: breadcrumbTool,
};
