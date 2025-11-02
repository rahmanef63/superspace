/**
 * Built-in Toolbar Tools
 *
 * Pre-defined tools for common use cases:
 * - search: Search input with debounce
 * - sort: Sort dropdown with direction
 * - filter: Filter options with badges
 * - view: View mode switcher
 * - actions: Action buttons with overflow
 * - tabs: Tab navigation
 * - breadcrumb: Breadcrumb navigation
 *
 * All tools are fully responsive by default.
 *
 * @author SuperSpace Team
 * @version 1.0.0
 */

import { z } from "zod";
import { useState, useEffect, useMemo } from "react";
import {
  Search,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  SlidersHorizontal,
  Check,
  MoreHorizontal,
  ChevronRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { createTool, toolbarRegistry, toolType } from "./toolbar-registry";
import type {
  SearchToolParams,
  SortToolParams,
  FilterToolParams,
  ViewToolParams,
  ActionsToolParams,
  TabsToolParams,
  BreadcrumbToolParams,
} from "./types";

/**
 * SEARCH TOOL
 * Search input with debounce and responsive sizing
 */
const SearchParamsSchema = z.object({
  value: z.string(),
  onChange: z.function(),
  placeholder: z.string().optional(),
  debounceMs: z.number().optional(),
  clearable: z.boolean().optional(),
  shortcuts: z.string().optional(),
});

export const searchTool = createTool({
  id: "search",
  title: "Search Tool",
  description: "Search input with debounce and keyboard shortcuts",
  paramsSchema: SearchParamsSchema,
  defaultResponsive: {
    collapseOnMobile: false, // Always show search
  },
  render: ({ tool, isMobile }) => {
    const params = tool.params as SearchToolParams;
    const [localValue, setLocalValue] = useState(params.value);

    // Debounce effect
    useEffect(() => {
      const timeout = setTimeout(() => {
        if (localValue !== params.value) {
          params.onChange(localValue);
        }
      }, params.debounceMs ?? 300);

      return () => clearTimeout(timeout);
    }, [localValue, params.debounceMs]);

    // Sync with external value
    useEffect(() => {
      setLocalValue(params.value);
    }, [params.value]);

    const handleClear = () => {
      setLocalValue("");
      params.onChange("");
    };

    return (
      <div className="relative flex-1 max-w-full sm:max-w-md md:max-w-lg">
        <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground md:left-3 md:h-4 md:w-4" />
        <Input
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          placeholder={params.placeholder ?? "Search..."}
          className={cn(
            "pl-8 pr-8 h-8 text-xs md:h-9 md:text-sm md:pl-9 md:pr-9",
            tool.className
          )}
        />
        {params.clearable && localValue && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-1/2 h-7 w-7 -translate-y-1/2 md:h-8 md:w-8"
            onClick={handleClear}
          >
            <X className="h-3 w-3 md:h-3.5 md:w-3.5" />
          </Button>
        )}
        {params.shortcuts && !isMobile && (
          <kbd className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            {params.shortcuts}
          </kbd>
        )}
      </div>
    );
  },
});

/**
 * SORT TOOL
 * Sort dropdown with direction toggle
 */
const SortParamsSchema = z.object({
  options: z.array(
    z.object({
      label: z.string(),
      value: z.string(),
      icon: z.any().optional(),
      direction: z.enum(["asc", "desc"]).optional(),
    })
  ),
  currentSort: z.string().optional(),
  currentDirection: z.enum(["asc", "desc"]).optional(),
  onChange: z.function(),
  showDirection: z.boolean().optional(),
});

export const sortTool = createTool({
  id: "sort",
  title: "Sort Tool",
  description: "Sort dropdown with ascending/descending toggle",
  paramsSchema: SortParamsSchema,
  defaultResponsive: {
    collapseOnMobile: true,
  },
  render: ({ tool, isMobile }) => {
    const params = tool.params as SortToolParams;
    const currentOption = params.options.find((o) => o.value === params.currentSort);
    const direction = params.currentDirection ?? "asc";

    const toggleDirection = () => {
      if (params.currentSort) {
        params.onChange(params.currentSort, direction === "asc" ? "desc" : "asc");
      }
    };

    return (
      <div className="flex items-center gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size={isMobile ? "sm" : "default"}
              className={cn(
                "gap-1.5 h-8 text-xs md:h-9 md:text-sm",
                tool.className
              )}
            >
              <ArrowUpDown className="h-3.5 w-3.5 md:h-4 md:w-4" />
              {!isMobile && <span>Sort</span>}
              {currentOption && !isMobile && (
                <>
                  <span className="text-muted-foreground">·</span>
                  <span className="font-medium">{currentOption.label}</span>
                </>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuLabel>Sort by</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {params.options.map((option) => {
              const Icon = option.icon;
              const isActive = option.value === params.currentSort;
              return (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => params.onChange(option.value, direction)}
                  className={cn(isActive && "bg-accent")}
                >
                  {Icon && <Icon className="mr-2 h-4 w-4" />}
                  <span className="flex-1">{option.label}</span>
                  {isActive && <Check className="h-4 w-4 text-primary" />}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        {params.showDirection && params.currentSort && (
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 md:h-9 md:w-9"
            onClick={toggleDirection}
          >
            {direction === "asc" ? (
              <ArrowUp className="h-3.5 w-3.5 md:h-4 md:w-4" />
            ) : (
              <ArrowDown className="h-3.5 w-3.5 md:h-4 md:w-4" />
            )}
          </Button>
        )}
      </div>
    );
  },
});

/**
 * FILTER TOOL
 * Filter options with active badge count
 */
const FilterParamsSchema = z.object({
  options: z.array(
    z.object({
      label: z.string(),
      value: z.string(),
      icon: z.any().optional(),
      active: z.boolean().optional(),
      count: z.number().optional(),
      color: z.string().optional(),
    })
  ),
  onToggle: z.function(),
  mode: z.enum(["single", "multiple"]).optional(),
  showCount: z.boolean().optional(),
  showClearAll: z.boolean().optional(),
});

export const filterTool = createTool({
  id: "filter",
  title: "Filter Tool",
  description: "Filter options with active count badge",
  paramsSchema: FilterParamsSchema,
  defaultResponsive: {
    collapseOnMobile: true,
  },
  render: ({ tool, isMobile }) => {
    const params = tool.params as FilterToolParams;
    const activeCount = params.options.filter((o) => o.active).length;
    const showCount = params.showCount ?? true;

    const handleClearAll = () => {
      params.options.forEach((option) => {
        if (option.active) {
          params.onToggle(option.value);
        }
      });
    };

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size={isMobile ? "sm" : "default"}
            className={cn(
              "gap-1.5 h-8 text-xs md:h-9 md:text-sm",
              tool.className
            )}
          >
            <SlidersHorizontal className="h-3.5 w-3.5 md:h-4 md:w-4" />
            {!isMobile && <span>Filter</span>}
            {activeCount > 0 && (
              <Badge
                variant="default"
                className="ml-0.5 h-4 w-4 p-0 text-[10px] flex items-center justify-center md:h-5 md:w-5"
              >
                {activeCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel className="flex items-center justify-between">
            <span>Filters</span>
            {params.showClearAll && activeCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={handleClearAll}
              >
                Clear all
              </Button>
            )}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {params.options.map((option) => {
            const Icon = option.icon;
            return (
              <DropdownMenuCheckboxItem
                key={option.value}
                checked={option.active ?? false}
                onCheckedChange={() => params.onToggle(option.value)}
              >
                {Icon && <Icon className="mr-2 h-4 w-4" />}
                <span className="flex-1">{option.label}</span>
                {showCount && option.count !== undefined && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    {option.count}
                  </span>
                )}
              </DropdownMenuCheckboxItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
});

// Export for auto-registration
export const builtInTools = {
  search: searchTool,
  sort: sortTool,
  filter: filterTool,
};

// Auto-register on import
toolbarRegistry.register(searchTool);
toolbarRegistry.register(sortTool);
toolbarRegistry.register(filterTool);
