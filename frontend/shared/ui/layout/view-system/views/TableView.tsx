"use client";

import React, { useMemo } from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  type ColumnDef,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
} from "lucide-react";
import type { ViewComponentProps } from "../types";
import { cn } from "@/lib/utils";

/**
 * Table View Component
 * 
 * Displays data in a tabular format with sorting, filtering, selection, and pagination.
 * Uses @tanstack/react-table for robust table functionality.
 * 
 * @example
 * ```tsx
 * const config: ViewConfig = {
 *   id: "users-table",
 *   title: "Users",
 *   fields: [
 *     { key: "name", label: "Name", type: "text", sortable: true },
 *     { key: "email", label: "Email", type: "email" },
 *     { key: "status", label: "Status", type: "badge" },
 *   ],
 *   settings: {
 *     selectable: true,
 *     sortable: true,
 *     showPagination: true,
 *   },
 * };
 * ```
 */
export function TableView<T extends Record<string, any>>({
  data,
  config,
  state,
  actions,
  className,
}: ViewComponentProps<T>) {
  // Convert config fields to TanStack Table columns
  const columns = useMemo<ColumnDef<T>[]>(() => {
    const cols: ColumnDef<T>[] = [];

    // Selection column
    if (config.settings?.selectable) {
      cols.push({
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => {
              table.toggleAllPageRowsSelected(!!value);
              if (value) {
                actions.selectItems(table.getRowModel().rows.map((row) => String(row.id)));
              } else {
                actions.clearSelection();
              }
            }}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => {
              row.toggleSelected(!!value);
              if (value) {
                actions.selectItem(String(row.id));
              } else {
                actions.deselectItem(String(row.id));
              }
            }}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 40,
      });
    }

    // Data columns
    config.fields?.forEach((field) => {
      cols.push({
        accessorKey: field.id as string,
        header: ({ column }) => {
          if (config.settings?.sortable) {
            return (
              <Button
                variant="ghost"
                size="sm"
                className="-ml-3 h-8 data-[state=open]:bg-accent"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              >
                <span>{field.label}</span>
                {column.getIsSorted() === "asc" ? (
                  <ArrowUp className="ml-2 h-4 w-4" />
                ) : column.getIsSorted() === "desc" ? (
                  <ArrowDown className="ml-2 h-4 w-4" />
                ) : (
                  <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
                )}
              </Button>
            );
          }
          return field.label;
        },
        cell: ({ row, getValue }) => {
          const value = getValue();
          
          // Custom render function
          if (field.render) {
            return field.render(row.original, value);
          }

          // Default formatters
          switch (field.type) {
            case "date":
              return value ? new Date(value as string | number).toLocaleDateString() : "-";
            case "number":
              return typeof value === "number" ? value.toLocaleString() : "-";
            case "boolean":
              return value ? "Yes" : "No";
            default:
              return value != null ? String(value) : "-";
          }
        },
        enableSorting: config.settings?.sortable,
      });
    });

    return cols;
  }, [config.fields, config.settings, actions]);

  // Convert view state to TanStack Table sorting state
  const sorting: SortingState = useMemo(() => {
    if (state.sort) {
      return [
        {
          id: state.sort.field,
          desc: state.sort.direction === "desc",
        },
      ];
    }
    return [];
  }, [state.sort]);

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!state.searchQuery) return data;

    const query = state.searchQuery.toLowerCase();
    return data.filter((item) =>
      config.fields?.some((field) => {
        const value = item[field.id as keyof T];
        return value != null && String(value).toLowerCase().includes(query);
      })
    );
  }, [data, state.searchQuery, config.fields]);

  // Initialize table
  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      pagination: {
        pageIndex: state.currentPage - 1,
        pageSize: state.pageSize,
      },
    },
    onSortingChange: (updaterOrValue) => {
      const newSorting =
        typeof updaterOrValue === "function"
          ? updaterOrValue(sorting)
          : updaterOrValue;

      if (newSorting.length > 0) {
        actions.setSort({
          field: newSorting[0].id,
          direction: newSorting[0].desc ? "desc" : "asc",
        });
      } else {
        actions.setSort(null);
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: false,
  });

  const pageCount = table.getPageCount();
  const canPreviousPage = table.getCanPreviousPage();
  const canNextPage = table.getCanNextPage();

  return (
    <div className={cn("flex h-full flex-col", className)}>
      {/* Table */}
      <div className="flex-1 overflow-auto border rounded-lg">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={cn(
                    config.onItemClick && "cursor-pointer hover:bg-muted/50"
                  )}
                  onClick={() => config.onItemClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {config.settings?.showPagination !== false && (
        <div className="flex items-center justify-between px-2 py-4 border-t">
          <div className="flex-1 text-sm text-muted-foreground">
            {state.selectedIds.size > 0 && (
              <span>
                {state.selectedIds.size} of {table.getFilteredRowModel().rows.length} row(s) selected
              </span>
            )}
          </div>
          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">Rows per page</p>
              <select
                value={state.pageSize}
                onChange={(e) => {
                  actions.setPageSize(Number(e.target.value));
                  table.setPageSize(Number(e.target.value));
                }}
                className="h-8 w-[70px] rounded-md border border-input bg-background px-2 text-sm"
              >
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <option key={pageSize} value={pageSize}>
                    {pageSize}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
              Page {state.currentPage} of {pageCount || 1}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => {
                  table.setPageIndex(0);
                  actions.setPage(1);
                }}
                disabled={!canPreviousPage}
              >
                <span className="sr-only">Go to first page</span>
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => {
                  table.previousPage();
                  actions.previousPage();
                }}
                disabled={!canPreviousPage}
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => {
                  table.nextPage();
                  actions.nextPage();
                }}
                disabled={!canNextPage}
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => {
                  table.setPageIndex(pageCount - 1);
                  actions.setPage(pageCount);
                }}
                disabled={!canNextPage}
              >
                <span className="sr-only">Go to last page</span>
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TableView;
