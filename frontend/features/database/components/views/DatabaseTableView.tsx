"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@/components/kibo-ui/table";
import {
  TableProvider,
  TableHeader,
  TableHeaderGroup,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableColumnHeader,
} from "@/components/kibo-ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronRightIcon,
  FileSpreadsheet,
} from "lucide-react";
import type {
  DatabaseFeature,
  DatabaseField,
  DatabaseFieldType,
  DatabaseView,
  FieldMapping,
} from "../../types";
import { DATABASE_FIELD_DEFINITIONS } from "../../config/fields";
import { FieldValue } from "../FieldValue";

const getFieldKey = (fieldId: unknown) => String(fieldId);

const getFieldValue = (
  feature: DatabaseFeature,
  field: DatabaseField,
): unknown => {
  const key = getFieldKey(field._id);
  return feature.metadata[key];
};

export interface DatabaseTableViewProps {
  features: DatabaseFeature[];
  fields: DatabaseField[];
  mapping?: FieldMapping | null;
  activeView?: DatabaseView | null;
  onAddProperty?: (type: DatabaseFieldType) => void;
  onAddRow?: () => void;
}

const formatRowId = (id: DatabaseFeature["id"]) => {
  const value = String(id);
  if (value.length <= 6) return value.toUpperCase();
  return value.slice(-6).toUpperCase();
};

export function DatabaseTableView({
  features,
  fields,
  mapping,
  activeView,
  onAddProperty,
  onAddRow,
}: DatabaseTableViewProps) {
  const titleFieldId = mapping?.titleField ? String(mapping.titleField) : null;

  const orderedFields = useMemo(
    () => [...fields].sort((a, b) => a.position - b.position),
    [fields],
  );

  const visibleFieldIds = activeView
    ? activeView.settings.visibleFields.map((id) => String(id))
    : null;

  const fieldById = useMemo(
    () => new Map(orderedFields.map((field) => [String(field._id), field])),
    [orderedFields],
  );

  const displayFields: DatabaseField[] = visibleFieldIds
    ? visibleFieldIds
        .map((id) => fieldById.get(id))
        .filter((field): field is DatabaseField => {
          if (!field) return false;
          if (titleFieldId && String(field._id) === titleFieldId) {
            return false;
          }
          return true;
        })
    : orderedFields.filter(
        (field) => !titleFieldId || String(field._id) !== titleFieldId,
      );

  const columns: ColumnDef<DatabaseFeature>[] = [
    {
      id: "name",
      enableResizing: true,
      minSize: 240,
      header: () => (
        <div className="flex items-center gap-2 text-xs font-medium uppercase text-muted-foreground">
          <span className="rounded border border-dashed px-1.5 py-0.5 font-semibold leading-none">
            Aa
          </span>
          <span>Name</span>
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-md border border-transparent p-1 text-muted-foreground transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring hover:border-border hover:bg-muted hover:text-foreground"
            aria-label="Open row preview"
          >
            <FileSpreadsheet className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="size-7">
                {row.original.owner?.avatarUrl ? (
                  <AvatarImage src={row.original.owner.avatarUrl} />
                ) : null}
                <AvatarFallback>
                  {row.original.owner?.label.slice(0, 2).toUpperCase() ?? "DB"}
                </AvatarFallback>
              </Avatar>
              {row.original.status?.color ? (
                <div
                  className="absolute right-0 bottom-0 h-2 w-2 rounded-full ring-2 ring-background"
                  style={{
                    backgroundColor: row.original.status.color,
                  }}
                />
              ) : null}
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-medium leading-none text-foreground">
                {row.original.name || "Untitled"}
              </span>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="font-mono uppercase tracking-wide">
                  {formatRowId(row.original.id)}
                </span>
                {row.original.product ? (
                  <>
                    <span aria-hidden="true">{`\u2022`}</span>
                    <span>{row.original.product}</span>
                  </>
                ) : null}
                {row.original.group ? (
                  <>
                    <ChevronRightIcon className="h-3 w-3" />
                    <span>{row.original.group}</span>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ),
    },
    ...displayFields.map(
      (field): ColumnDef<DatabaseFeature> => ({
        id: String(field._id),
        enableResizing: true,
        accessorFn: (feature) => getFieldValue(feature, field),
        header: ({ column }) => (
          <TableColumnHeader column={column} title={field.name} />
        ),
        cell: ({ row }) => (
          <FieldValue
            field={field}
            value={getFieldValue(row.original, field)}
          />
        ),
      }),
    ),
  ];

  if (onAddProperty) {
    columns.push({
      id: "addProperty",
      enableResizing: false,
      header: () => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-full justify-start gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              + Add property
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="bottom" className="w-60 p-2">
            <DropdownMenuLabel className="px-2 py-1 text-xs font-semibold uppercase text-muted-foreground">
              Select type
            </DropdownMenuLabel>
            {Object.values(DATABASE_FIELD_DEFINITIONS).map((definition) => (
              <DropdownMenuItem
                key={definition.type}
                onClick={() => onAddProperty(definition.type)}
                className="flex items-start gap-2"
              >
                <definition.icon className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{definition.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {definition.description}
                  </span>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      cell: () => <span />,
      enableSorting: false,
      size: 200,
    });
  }

  return (
    <div className="size-full overflow-auto">
      <TableProvider columns={columns} data={features} className="table-fixed">
        <TableHeader>
          {({ headerGroup }) => (
            <TableHeaderGroup headerGroup={headerGroup} key={headerGroup.id}>
              {({ header }) => (
                <TableHead header={header} key={header.id} />
              )}
            </TableHeaderGroup>
          )}
        </TableHeader>
        <TableBody className={features.length === 0 ? "[&>tr]:hidden" : undefined}>
          {({ row }) => (
            <TableRow key={row.id} row={row} className="group">
              {({ cell }) => <TableCell cell={cell} key={cell.id} />}
            </TableRow>
          )}
        </TableBody>
      </TableProvider>
      {onAddRow ? (
        <div className="border-t border-border px-6 py-3">
          <button
            type="button"
            onClick={onAddRow}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
          >
            <span className="text-lg leading-none">+</span>
            <span>New page</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}
