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

interface DatabaseViewRendererProps {
  activeView: DatabaseViewType;
  record: DatabaseRecord;
  viewModel: DatabaseViewModel;
  mapping: FieldMapping | null;
  activeDbView: DatabaseView | null;
  tableId: Id<"dbTables">;
  // Row operations
  onAddRow: () => Promise<void>;
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
      // TODO: Implement UniversalCalendarView when ready
      return (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">Calendar view coming soon...</p>
        </div>
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
          onAddProperty={onAddProperty}
          onAddRow={onAddRow}
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
