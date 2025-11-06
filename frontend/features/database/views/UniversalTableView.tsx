/**
 * Universal Database Table View
 * 
 * Modern table view implementation that works with all 23 property types.
 * Uses TanStack Table for robust table functionality with sorting, filtering,
 * column resizing, inline editing, and more.
 * 
 * Features:
 * - Auto-discovery of property renderers/editors
 * - Inline editing with validation
 * - Column sorting and filtering
 * - Column reordering (drag & drop)
 * - Column resizing
 * - Row selection
 * - Pagination
 * - Keyboard navigation
 */

import React, { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  type ColumnDef,
  type SortingState,
  type VisibilityState,
  type ColumnFiltersState,
  useReactTable,
  type RowSelectionState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Settings2,
  Plus,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  createTableColumns,
  type PropertyColumnConfig,
  type PropertyRowData,
  type ColumnFactoryOptions,
} from "./table-columns";

/**
 * Universal Table View Props
 */
export interface UniversalTableViewProps {
  /** Table data rows */
  data: PropertyRowData[];

  /** Property column configurations */
  properties: PropertyColumnConfig[];

  /** Callback when cell value is updated */
  onCellUpdate?: (rowId: string, propertyKey: string, value: any) => Promise<void>;

  /** Callback when row is deleted */
  onRowDelete?: (rowId: string) => Promise<void>;

  /** Callback when new row is added */
  onRowAdd?: () => Promise<void>;

  /** Enable row selection */
  enableRowSelection?: boolean;

  /** Enable row actions dropdown */
  enableRowActions?: boolean;

  /** Enable drag handle for reordering */
  enableDragHandle?: boolean;

  /** Enable pagination */
  enablePagination?: boolean;

  /** Enable column visibility toggle */
  enableColumnVisibility?: boolean;

  /** Enable global search */
  enableGlobalSearch?: boolean;

  /** Initial page size */
  pageSize?: number;

  /** Custom CSS class */
  className?: string;

  /** Callback when selection changes */
  onSelectionChange?: (selectedIds: string[]) => void;
}

/**
 * Universal Table View Component
 */
export function UniversalTableView({
  data,
  properties,
  onCellUpdate,
  onRowDelete,
  onRowAdd,
  enableRowSelection = true,
  enableRowActions = true,
  enableDragHandle = false,
  enablePagination = true,
  enableColumnVisibility = true,
  enableGlobalSearch = true,
  pageSize = 50,
  className,
  onSelectionChange,
}: UniversalTableViewProps) {
  // Table state
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = useState("");

  // Generate table columns from property configurations
  const columns = useMemo<ColumnDef<PropertyRowData>[]>(() => {
    const options: ColumnFactoryOptions = {
      onCellUpdate,
      onRowDelete,
      enableRowSelection,
      enableRowActions,
      enableDragHandle,
    };

    return createTableColumns(properties, options);
  }, [
    properties,
    onCellUpdate,
    onRowDelete,
    enableRowSelection,
    enableRowActions,
    enableDragHandle,
  ]);

  // Create TanStack Table instance
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
    enableRowSelection: enableRowSelection,
    initialState: {
      pagination: {
        pageSize,
      },
    },
  });

  // Track selection changes
  React.useEffect(() => {
    if (onSelectionChange) {
      const selectedIds = Object.keys(rowSelection).filter((key) => rowSelection[key]);
      onSelectionChange(selectedIds);
    }
  }, [rowSelection, onSelectionChange]);

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        {/* Left side - Search */}
        <div className="flex items-center gap-2 flex-1">
          {enableGlobalSearch && (
            <div className="relative max-w-sm">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search all columns..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-8"
              />
            </div>
          )}

          {/* Selection info */}
          {enableRowSelection && Object.keys(rowSelection).length > 0 && (
            <div className="text-sm text-muted-foreground">
              {Object.keys(rowSelection).length} of {table.getFilteredRowModel().rows.length} row(s) selected
            </div>
          )}
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2">
          {/* Add row button */}
          {onRowAdd && (
            <Button onClick={onRowAdd} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add row
            </Button>
          )}

          {/* Column visibility toggle */}
          {enableColumnVisibility && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings2 className="h-4 w-4 mr-2" />
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      style={{
                        width: header.getSize(),
                        minWidth: header.column.columnDef.minSize,
                        maxWidth: header.column.columnDef.maxSize,
                      }}
                      className="relative"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}

                      {/* Column resizer */}
                      {header.column.getCanResize() && (
                        <div
                          className="absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none hover:bg-primary/20 active:bg-primary/30"
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                        />
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="group"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {enablePagination && (
        <div className="flex items-center justify-between gap-2 p-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="text-sm text-muted-foreground">
            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{" "}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length
            )}{" "}
            of {table.getFilteredRowModel().rows.length} rows
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              aria-label="Go to first page"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              aria-label="Go to last page"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UniversalTableView;
