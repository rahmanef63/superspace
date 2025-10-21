"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Id } from "@convex/_generated/dataModel";
import {
  DatabaseShell,
  DatabaseSidebar,
  DatabaseToolbar,
  DatabaseGanttView,
  DatabaseCalendarView,
  DatabaseListView,
  DatabaseKanbanView,
  DatabaseTableView,
} from "../components";
import { DatabaseHeaderSection } from "../sections";
import { CreateDatabaseDialog } from "../dialog";
import {
  useDatabaseMutations,
  useDatabaseRecord,
  useDatabaseSidebar,
} from "../hooks";
import type {
  DatabaseFeature,
  DatabaseFieldType,
  DatabaseTable,
  DatabaseViewType,
} from "../types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { APP_VIEW_TYPE_TO_DB, DB_VIEW_TYPE_TO_APP } from "../constants";
import { DATABASE_FIELD_DEFINITIONS } from "../config/fields";

export interface DatabasePageProps {
  workspaceId: Id<"workspaces">;
}

const defaultYears = () => {
  const year = new Date().getFullYear();
  return { earliest: year, latest: year };
};

const computeYearRange = (features: DatabaseFeature[]) => {
  const years = features
    .flatMap((feature) =>
      [feature.startAt?.getFullYear(), feature.endAt?.getFullYear()].filter(
        (value): value is number => typeof value === "number",
      ),
    )
    .filter((value, index, arr) => arr.indexOf(value) === index)
    .sort();

  if (years.length === 0) {
    return defaultYears();
  }

  return {
    earliest: years[0],
    latest: years[years.length - 1],
  };
};

export function DatabasePage({ workspaceId }: DatabasePageProps) {
  const { tables, isLoading: isSidebarLoading } = useDatabaseSidebar(workspaceId);
  const [selectedTableId, setSelectedTableId] = useState<Id<"dbTables"> | null>(null);
  const [activeView, setActiveView] = useState<DatabaseViewType>("table");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const handleSelectTable = (tableId: Id<"dbTables">) => {
    setSelectedTableId(tableId);
  };

  useEffect(() => {
    if (!selectedTableId && tables.length > 0) {
      setSelectedTableId(tables[0]._id as Id<"dbTables">);
    }
  }, [selectedTableId, tables]);

  const { record, viewModel, mapping, isLoading } = useDatabaseRecord(selectedTableId);
  const {
    updateRow,
    setDefaultView,
    updateTable,
    deleteTable,
    duplicateTable,
    createField,
    createRow,
  } = useDatabaseMutations();

  const tableIdRef = useRef<string | null>(null);

  const defaultViewType = useMemo<DatabaseViewType>(() => {
    if (!record) {
      return "table";
    }
    const defaultView = record.views.find((view) => view.isDefault);
    if (defaultView) {
      return DB_VIEW_TYPE_TO_APP[defaultView.type] ?? "table";
    }
    const tableView = record.views.find((view) => view.type === "table");
    if (tableView) {
      return "table";
    }
    return "table";
  }, [record]);

  const currentTableId = record ? String(record.table._id) : null;

  useEffect(() => {
    if (!currentTableId) {
      tableIdRef.current = null;
      setActiveView("table");
      return;
    }

    if (tableIdRef.current !== currentTableId) {
      tableIdRef.current = currentTableId;
      setActiveView(defaultViewType);
    }
  }, [currentTableId, defaultViewType]);

  const activeDbView = useMemo(() => {
    if (!record) return null;
    const targetType = APP_VIEW_TYPE_TO_DB[activeView];
    return (
      record.views.find((view) => view.type === targetType) ?? null
    );
  }, [record, activeView]);

  const allViews = record?.views ?? [];

  const years = useMemo(() => {
    if (!viewModel) return defaultYears();
    return computeYearRange(viewModel.features);
  }, [viewModel]);

  const handleStatusChange = async (
    featureId: DatabaseFeature["id"],
    status: { id: string },
  ) => {
    if (!mapping?.statusField) return;
    await updateRow({
      id: featureId,
      data: { [mapping.statusField]: status.id },
    });
  };

  const handleMoveDates = async (
    featureId: DatabaseFeature["id"],
    startAt: Date,
    endAt: Date | null,
  ) => {
    if (!mapping) return;
    const updates: Record<string, unknown> = {};
    if (mapping.startDateField) {
      updates[mapping.startDateField] = startAt.getTime();
    }
    if (mapping.endDateField && endAt) {
      updates[mapping.endDateField] = endAt.getTime();
    }
    if (Object.keys(updates).length === 0) return;
    await updateRow({
      id: featureId,
      data: updates,
    });
  };

  const handleViewChange = (view: DatabaseViewType) => {
    setActiveView(view);
  };

  const handleMakeDefaultView = async (view: DatabaseViewType) => {
    if (!record) {
      toast.error("Select a database before setting a default view.");
      return;
    }

    const targetType = APP_VIEW_TYPE_TO_DB[view];
    const viewDoc = record.views.find((candidate) => candidate.type === targetType);

    if (!viewDoc) {
      toast.error("That view is not available yet.");
      return;
    }

    try {
      await setDefaultView({ id: viewDoc._id });
      setActiveView(view);
      toast.success(`${viewDoc.name ?? view.toUpperCase()} is now the default view.`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to update the default view.";
      toast.error(message);
    }
  };

  const handleManageViews = () => {
    toast.info("View management tools are coming soon.");
  };

  const handleCopyData = async () => {
    if (!viewModel) {
      toast.error("Nothing to copy yet.");
      return;
    }

    try {
      const payload = viewModel.features.map((feature) => ({
        id: String(feature.id),
        name: feature.name,
        metadata: feature.metadata,
      }));
      await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
      toast.success("Database data copied to your clipboard.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to copy data to clipboard.";
      toast.error(message);
    }
  };

  const handleGetLink = async () => {
    if (typeof window === "undefined" || !selectedTableId) {
      toast.error("Open a database before generating a link.");
      return;
    }

    try {
      const url = new URL(window.location.href);
      url.searchParams.set("table", String(selectedTableId));
      url.searchParams.set("view", activeView);
      await navigator.clipboard.writeText(url.toString());
      toast.success("View link copied to your clipboard.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to copy the view link.";
      toast.error(message);
    }
  };

  const handleExport = () => {
    toast.info("Export support is in progress.");
  };

  const handleImport = () => {
    toast.info("Import support is in progress.");
  };

  const handleRenameTable = async (table: DatabaseTable) => {
    const currentName = table.name || "Untitled database";
    const nextName = window.prompt("Rename database", currentName);
    if (nextName == null) {
      return;
    }

    const trimmed = nextName.trim();
    if (!trimmed || trimmed === currentName) {
      return;
    }

    try {
      await updateTable({ id: table._id, name: trimmed });
      toast.success("Database renamed.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to rename database.";
      toast.error(message);
    }
  };

  const handleCopyTableId = async (table: DatabaseTable) => {
    try {
      await navigator.clipboard.writeText(String(table._id));
      toast.success("Database ID copied to clipboard.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to copy database ID.";
      toast.error(message);
    }
  };

  const handleDuplicateTable = async (table: DatabaseTable) => {
    try {
      const newTableId = await duplicateTable({
        id: table._id,
        name: table.name ?? undefined,
      });
      if (newTableId) {
        setSelectedTableId(newTableId);
      }
      toast.success("Database duplicated.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to duplicate database.";
      toast.error(message);
    }
  };

  const handleDeleteTable = async (table: DatabaseTable) => {
    const confirmed = window.confirm(
      `Delete "${table.name || "Untitled database"}"? This cannot be undone.`,
    );
    if (!confirmed) {
      return;
    }

    try {
      await deleteTable({ id: table._id });
      if (selectedTableId && String(selectedTableId) === String(table._id)) {
        setSelectedTableId(null);
      }
      toast.success("Database deleted.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete database.";
      toast.error(message);
    }
  };

  const handleAddRow = async () => {
    if (!record) {
      toast.error("Select a database before adding rows.");
      return;
    }

    try {
      const primaryField = record.fields.find((field) => field.isPrimary);
      const titleFieldId =
        mapping?.titleField ?? (primaryField ? String(primaryField._id) : null);

      const data: Record<string, unknown> = {};
      if (titleFieldId) {
        data[titleFieldId] = "New page";
      }

      await createRow({
        tableId: record.table._id,
        data,
      });
      toast.success("Row added.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to add row.";
      toast.error(message);
    }
  };

  const handleAddProperty = async (type: DatabaseFieldType) => {
    if (!record) {
      toast.error("Select a database before adding properties.");
      return;
    }

    const definition = DATABASE_FIELD_DEFINITIONS[type];
    const defaultName =
      definition?.label
        ? `${definition.label} ${record.fields.length + 1}`
        : `Property ${record.fields.length + 1}`;

    const name = window.prompt("Property name", defaultName);
    if (name == null) {
      return;
    }

    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Property name cannot be empty.");
      return;
    }

    try {
      await createField({
        tableId: record.table._id,
        name: trimmed,
        type,
        isRequired: false,
      });
      toast.success(`${definition?.label ?? "Property"} added.`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to add property.";
      toast.error(message);
    }
  };

  const sidebar = (
    <DatabaseSidebar
      workspaceId={workspaceId}
      tables={tables}
      selectedTableId={selectedTableId}
      onSelectTable={handleSelectTable}
      onCreateTable={() => setIsCreateOpen(true)}
      isLoading={isSidebarLoading}
      onRenameTable={handleRenameTable}
      onCopyTableId={handleCopyTableId}
      onDuplicateTable={handleDuplicateTable}
      onDeleteTable={handleDeleteTable}
    />
  );

  const header = record ? (
    <div className="flex flex-col">
      <DatabaseHeaderSection record={record} />
      <DatabaseToolbar
        activeView={activeView}
        onViewChange={handleViewChange}
        views={allViews}
        defaultViewType={defaultViewType}
        onMakeDefaultView={handleMakeDefaultView}
        onManageViews={handleManageViews}
        onCopyData={handleCopyData}
        onGetLink={handleGetLink}
        onExport={handleExport}
        onImport={handleImport}
      />
    </div>
  ) : (
    <div className="border-b border-dashed px-6 py-4">
      <h1 className="text-xl font-semibold text-muted-foreground">
        Select or create a database
      </h1>
      <p className="text-sm text-muted-foreground">
        Choose a database from the sidebar to explore roadmap views.
      </p>
    </div>
  );

  let content: React.ReactNode = null;

  if (!selectedTableId) {
    content = (
      <EmptyState
        title="No databases yet"
        description="Create a database to begin organising your roadmap."
        actionLabel="Create database"
        onAction={() => setIsCreateOpen(true)}
      />
    );
  } else if (isLoading || !viewModel) {
    content = (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-muted-foreground">
          {isLoading ? "Loading database…" : "No data found for this database."}
        </p>
      </div>
    );
  } else {
    switch (activeView) {
      case "gantt":
        content = (
          <DatabaseGanttView
            features={viewModel.features}
            markers={viewModel.markers}
            onMoveFeature={handleMoveDates}
            onSelectFeature={() => undefined}
            onCopyLink={() => undefined}
            onRemoveFeature={() => undefined}
            onCreateMarker={() => undefined}
          />
        );
        break;
      case "calendar":
        content = (
          <DatabaseCalendarView features={viewModel.features} years={years} />
        );
        break;
      case "list":
        content = (
          <DatabaseListView
            features={viewModel.features}
            statuses={viewModel.statuses}
            onMove={handleStatusChange}
          />
        );
        break;
      case "kanban":
        content = (
          <DatabaseKanbanView
            features={viewModel.features}
            statuses={viewModel.statuses}
            onMove={handleStatusChange}
          />
        );
        break;
      case "table":
      default:
        content = (
          <DatabaseTableView
            features={viewModel.features}
            fields={record?.fields ?? []}
            mapping={mapping}
            activeView={activeDbView}
            onAddProperty={handleAddProperty}
            onAddRow={handleAddRow}
          />
        );
        break;
    }
  }

  return (
    <>
      <DatabaseShell header={header} sidebar={sidebar}>
        <div className="flex h-full flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-auto">{content}</div>
        </div>
      </DatabaseShell>

      <CreateDatabaseDialog
        workspaceId={workspaceId}
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onCreated={(tableId) => {
          setSelectedTableId(tableId);
          setIsCreateOpen(false);
        }}
      />
    </>
  );
}

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex h-full flex-1 flex-col items-center justify-center gap-3 text-center">
      <div className="rounded-full bg-muted px-3 py-1 text-xs font-medium uppercase text-muted-foreground">
        Databases
      </div>
      <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
      <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      {actionLabel ? (
        <button
          type="button"
          onClick={onAction}
          className={cn(
            "rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90",
          )}
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
