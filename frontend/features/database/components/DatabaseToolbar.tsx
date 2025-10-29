"use client";

import { useMemo, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  CalendarIcon,
  Check,
  Copy,
  Filter,
  GanttChartSquareIcon,
  KanbanSquareIcon,
  LayoutListIcon,
  Link2,
  ListIcon,
  Menu,
  Settings2,
  SortAsc,
  TableIcon,
  Download,
  Upload,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { DatabaseView, DatabaseViewType } from "../types";
import { DATABASE_VIEW_ORDER, DB_VIEW_TYPE_TO_APP } from "../constants";
import {
  ExportControl,
  ImportControl,
} from "@/frontend/shared/ui/components/controls";

const VIEW_ICONS: Record<
  DatabaseViewType,
  (props: { size?: number; className?: string }) => JSX.Element
> = {
  gantt: ({ size, className }) => <GanttChartSquareIcon size={size} className={className} />,
  calendar: ({ size, className }) => <CalendarIcon size={size} className={className} />,
  list: ({ size, className }) => <ListIcon size={size} className={className} />,
  kanban: ({ size, className }) => <KanbanSquareIcon size={size} className={className} />,
  table: ({ size, className }) => <TableIcon size={size} className={className} />,
};

const VIEW_LABELS: Record<DatabaseViewType, string> = {
  gantt: "Gantt",
  calendar: "Calendar",
  list: "List",
  kanban: "Kanban",
  table: "Table",
};

export interface DatabaseToolbarProps {
  activeView: DatabaseViewType;
  onViewChange: (view: DatabaseViewType) => void;
  views: DatabaseView[];
  defaultViewType: DatabaseViewType;
  onMakeDefaultView: (view: DatabaseViewType) => void;
  onManageViews: () => void;
  onCopyData: () => void;
  onGetLink: () => void;
  onExport: () => void;
  onImport: () => void;
}

export function DatabaseToolbar({
  activeView,
  onViewChange,
  views,
  defaultViewType,
  onMakeDefaultView,
  onManageViews,
  onCopyData,
  onGetLink,
  onExport,
  onImport,
}: DatabaseToolbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const viewMap = useMemo(() => {
    const map = new Map<DatabaseViewType, DatabaseView>();
    views.forEach((view) => {
      const mapped = DB_VIEW_TYPE_TO_APP[view.type];
      if (mapped && !map.has(mapped)) {
        map.set(mapped, view);
      }
    });
    return map;
  }, [views]);

  const orderedViews = useMemo(
    () => DATABASE_VIEW_ORDER.map((view) => view as DatabaseViewType),
    [],
  );

  const getViewLabel = (view: DatabaseViewType) => {
    const base = VIEW_LABELS[view] ?? view;
    const doc = viewMap.get(view);
    const docName = doc?.name?.trim();
    if (!docName || docName.toLowerCase() === base.toLowerCase()) {
      return base;
    }
    return `${base} (${docName})`;
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-3">
      <Tabs
        value={activeView}
        onValueChange={(value) => onViewChange(value as DatabaseViewType)}
        className="flex-1"
      >
        <TabsList className="ml-[-0.25rem] justify-start gap-1">
          {orderedViews.map((view) => {
            const Icon =
              VIEW_ICONS[view] ??
              ((props: { size?: number; className?: string }) => (
                <LayoutListIcon size={props.size} className={props.className} />
              ));
            const label = getViewLabel(view);
            return (
              <TabsTrigger key={view} value={view} className="gap-2">
                <Icon size={16} />
                {label}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
        <Button variant="ghost" size="sm" className="gap-2">
          <SortAsc className="h-4 w-4" />
          Sort
        </Button>
        <ExportControl size="sm" onExport={onExport}>
          <Download className="h-4 w-4" />
          Export
        </ExportControl>
        <ImportControl size="sm" onImport={onImport}>
          <Upload className="h-4 w-4" />
          Import
        </ImportControl>
        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onMouseEnter={() => setMenuOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-64"
            onMouseLeave={() => setMenuOpen(false)}
            onPointerLeave={() => setMenuOpen(false)}
          >
            <DropdownMenuLabel>View options</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {orderedViews.map((view) => {
                const isActive = activeView === view;
                const label = getViewLabel(view);
                return (
                  <DropdownMenuItem
                    key={`switch-${view}`}
                    onClick={() => onViewChange(view)}
                  >
                    {isActive ? (
                      <Check className="h-4 w-4 text-primary" />
                    ) : (
                      <span className="h-4 w-4" />
                    )}
                    <span>{label}</span>
                    {defaultViewType === view ? (
                      <DropdownMenuShortcut>Default</DropdownMenuShortcut>
                    ) : null}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Set default view</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {orderedViews.map((view) => {
                  const label = getViewLabel(view);
                  const isDefault = defaultViewType === view;
                  return (
                    <DropdownMenuItem
                      key={`default-${view}`}
                      onClick={() => onMakeDefaultView(view)}
                    >
                      {isDefault ? (
                        <Check className="h-4 w-4 text-primary" />
                      ) : (
                        <span className="h-4 w-4" />
                      )}
                      <span>{label}</span>
                      {isDefault ? (
                        <DropdownMenuShortcut>Selected</DropdownMenuShortcut>
                      ) : null}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onManageViews} className="gap-2">
              <Settings2 className="h-4 w-4" />
              Manage views (CRUD)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onCopyData} className="gap-2">
              <Copy className="h-4 w-4" />
              Copy data
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onGetLink} className="gap-2">
              <Link2 className="h-4 w-4" />
              Copy view link
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
