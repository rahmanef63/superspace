"use client";

import { useMemo } from "react";
import type { Id } from "@convex/_generated/dataModel";
import { useDatabaseRecord } from "../hooks/useDatabase";
import { useDatabaseViewState } from "../hooks";
import { DatabaseToolbar, DatabaseViewRenderer } from "../components";
import { DatabaseHeaderSection } from "../sections";
import { findActiveDbView } from "../utils";
import type { DatabaseViewType } from "../types";

interface DatabaseContentContainerProps {
  tableId: Id<"dbTables">;
  handlers: any; // Pass all handlers from parent
}

/**
 * Suspense-wrapped content container that fetches and displays database content
 * This component can be wrapped in Suspense to enable partial rendering
 */
export function DatabaseContentContainer({
  tableId,
  handlers,
}: DatabaseContentContainerProps) {
  const { record, viewModel, mapping, isLoading } = useDatabaseRecord(tableId);

  const { activeView, setActiveView, defaultViewType } = useDatabaseViewState({
    record,
    selectedTableId: tableId,
  });

  const activeDbView = useMemo(() => {
    if (!record) return null;
    return findActiveDbView(record.views, activeView);
  }, [record, activeView]);

  if (isLoading || !viewModel || !record) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col">
        <DatabaseHeaderSection record={record} />
        <DatabaseToolbar
          activeView={activeView}
          onViewChange={handlers.handleViewChange}
          views={record.views}
          defaultViewType={defaultViewType}
          onMakeDefaultView={handlers.handleMakeDefaultView}
          onManageViews={handlers.handleManageViews}
          onCopyData={handlers.handleCopyData}
          onGetLink={handlers.handleGetLink}
          onExport={handlers.handleExport}
          onImport={handlers.handleImport}
        />
      </div>
      <DatabaseViewRenderer
        activeView={activeView}
        record={record}
        viewModel={viewModel}
        mapping={mapping}
        activeDbView={activeDbView}
        tableId={record.table._id}
        onAddRow={handlers.handleAddRow}
        onUpdateCell={handlers.handleUpdateCell}
        onDeleteRow={handlers.handleDeleteRow}
        onReorderRows={handlers.handleReorderRows}
        onAddProperty={handlers.handleAddProperty}
        onRenameField={handlers.handleRenameField}
        onToggleFieldRequired={handlers.handleToggleFieldRequired}
        onDeleteField={handlers.handleDeleteField}
        onUpdateFieldOptions={handlers.handleUpdateFieldOptions}
        onToggleFieldVisibility={handlers.handleToggleFieldVisibility}
        onReorderFields={handlers.handleReorderFields}
        onColumnSizingChange={handlers.handleColumnSizingChange}
        onStatusChange={handlers.handleStatusChange}
        onMoveDates={handlers.handleMoveDates}
      />
    </>
  );
}
