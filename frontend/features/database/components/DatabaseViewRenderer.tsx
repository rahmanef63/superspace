/**
 * DatabaseViewRenderer Component
 * Renders the appropriate view based on the active view type
 */

import React, { useMemo } from "react";
import type { Id } from "@convex/_generated/dataModel";
import type {
  DatabaseRecord,
  DatabaseViewModel,
  DatabaseView,
  DatabaseFeature,
  FieldMapping,
  DatabaseViewType,
  DatabaseFieldType,
} from "../types";
import { DatabaseTableView } from "./views/table";
import { computeYearRange } from "../utils/date-helpers";
import { UniversalCalendarView } from "../views/UniversalCalendarView";
import { convertFieldsToProperties } from "../lib/field-converter";

interface DatabaseViewRendererProps {
  activeView: DatabaseViewType;
  record: DatabaseRecord;
  viewModel: DatabaseViewModel;
  mapping: FieldMapping | null;
  activeDbView: DatabaseView | null;
  tableId: Id<"dbTables">;
  filterQuery?: any | null; // ConvexQueryFilter from filters
  // Row operations
  onAddRow: (initialData?: Record<string, unknown>) => Promise<void>; // Updated signature
  onUpdateCell: (rowId: DatabaseFeature["id"], updates: Record<string, unknown>) => Promise<void>;
  onDeleteRow: (rowId: DatabaseFeature["id"]) => Promise<void>;
  onReorderRows: (orderedIds: string[]) => Promise<void>;
  // Field operations
  onAddProperty: (type: DatabaseFieldType) => Promise<void>;
  onRenameField: (fieldId: string, name: string) => Promise<void>;
  onToggleFieldRequired: (fieldId: string, required: boolean) => Promise<void>;
  onDeleteField: (fieldId: string) => Promise<void>;
  onUpdateFieldOptions: (fieldId: string, options: Partial<any>) => Promise<void>;
  onToggleFieldVisibility: (fieldId: string, visible: boolean) => Promise<void>;
  onReorderFields: (orderedIds: string[]) => Promise<void>;
  // View operations
  onColumnSizingChange: (sizes: Record<string, number>) => void;
  // Legacy handlers for gantt/calendar
  onStatusChange?: (featureId: DatabaseFeature["id"], status: { id: string }) => Promise<void>;
  onMoveDates?: (featureId: DatabaseFeature["id"], startAt: Date, endAt: Date | null) => Promise<void>;
}

export function DatabaseViewRenderer({
  activeView,
  record,
  viewModel,
  mapping,
  activeDbView,
  tableId,
  filterQuery,
  onAddRow,
  onUpdateCell,
  onDeleteRow,
  onReorderRows,
  onAddProperty,
  onRenameField,
  onToggleFieldRequired,
  onDeleteField,
  onUpdateFieldOptions,
  onToggleFieldVisibility,
  onReorderFields,
  onColumnSizingChange,
  onStatusChange,
  onMoveDates,
}: DatabaseViewRendererProps) {
  const years = useMemo(() => {
    return computeYearRange(viewModel.features);
  }, [viewModel.features]);

  switch (activeView) {
    case "gantt":
      // TODO: Implement UniversalTimelineView when ready
      return (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">Gantt view coming soon...</p>
        </div>
      );

    case "calendar":
      return (
        <UniversalCalendarView
          records={viewModel.features.map(f => {
            // Map metadata to properties, and inject Name/Title
            const properties = { ...f.metadata };

            // Find primary field (Name) and inject if missing from metadata
            // Usually name is stored in f.name, not metadata.
            const primaryField = record.fields.find(field => field.isPrimary);
            if (primaryField && !properties[primaryField._id]) {
              properties[primaryField._id] = f.name;
            }

            return {
              id: String(f.id),
              properties
            };
          })}
          properties={convertFieldsToProperties(record.fields)}
          dateProperty={(activeDbView?.settings as any)?.calendarDateProperty}
          onDateChange={async (recordId, newDate, propertyKey) => {
            if (propertyKey) {
              // Cast recordId to DatabaseFeature["id"] (Id<"dbRows">)
              // Assuming recordId comes from f.id which is Id<"dbRows">
              await onUpdateCell(recordId as DatabaseFeature["id"], { [propertyKey]: newDate.getTime() });
            }
          }}
          onRecordClick={(row) => {
            console.log("Record clicked", row);
          }}
          onAddRecord={(date, propertyKey) => {
            if (propertyKey) {
              onAddRow({ [propertyKey]: date.getTime() });
            } else {
              onAddRow();
            }
          }}
        />
      );

    case "list":
      // TODO: Implement UniversalListView when ready
      return (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">List view coming soon...</p>
        </div>
      );

    case "kanban":
      // TODO: Implement UniversalBoardView when ready
      return (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">Kanban view coming soon...</p>
        </div>
      );

    case "table":
    default:
      return (
        <DatabaseTableView
          tableId={record.table._id}
          features={viewModel.features}
          fields={record.fields}
          mapping={mapping}
          activeView={activeDbView}
          // filterQuery removed as it's not in props
          onAddProperty={onAddProperty}
          onAddRow={() => onAddRow()} // Fix to void
          onUpdateCell={onUpdateCell}
          onDeleteRow={onDeleteRow}
          onRenameField={onRenameField}
          onToggleFieldRequired={onToggleFieldRequired}
          onDeleteField={onDeleteField}
          onToggleFieldVisibility={onToggleFieldVisibility}
          onReorderFields={onReorderFields}
          onReorderRows={onReorderRows}
          onColumnSizingChange={onColumnSizingChange}
          onUpdateFieldOptions={onUpdateFieldOptions}
        />
      );
  }
}
