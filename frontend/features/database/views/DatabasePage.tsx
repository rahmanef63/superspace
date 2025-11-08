"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import type { Id } from "@convex/_generated/dataModel";
import {
  DatabaseShell,
  EmptyState,
  DatabaseSidebarSkeleton,
  DatabaseContentSkeleton,
} from "../components";
import { CreateDatabaseDialog } from "../dialog";
import {
  useDatabasePageHandlers,
} from "../hooks";
import {
  DatabaseSidebarContainer,
  DatabaseContentContainer,
} from "../containers";

export interface DatabasePageProps {
  workspaceId: Id<"workspaces">;
}

export function DatabasePage({ workspaceId }: DatabasePageProps) {
  const [selectedTableId, setSelectedTableId] = useState<Id<"dbTables"> | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Handlers - pass null values for now, will be updated by content container
  const handlers = useDatabasePageHandlers({
    record: null,
    activeDbView: null,
    mapping: null,
    viewModel: null,
    selectedTableId,
    activeView: "table",
    setActiveView: () => {},
    setSelectedTableId,
  });

  // Cleanup column sizing timeout on unmount
  useEffect(
    () => () => {
      if (handlers.columnSizingUpdateRef.current) {
        clearTimeout(handlers.columnSizingUpdateRef.current);
      }
    },
    [handlers.columnSizingUpdateRef]
  );

  // Render sidebar with Suspense
  const sidebar = (
    <Suspense fallback={<DatabaseSidebarSkeleton />}>
      <DatabaseSidebarContainer
        workspaceId={workspaceId}
        selectedTableId={selectedTableId}
        onSelectTable={setSelectedTableId}
        onCreateTable={() => setIsCreateOpen(true)}
        onRenameTable={handlers.handleRenameTable}
        onCopyTableId={handlers.handleCopyTableId}
        onDuplicateTable={handlers.handleDuplicateTable}
        onDeleteTable={handlers.handleDeleteTable}
      />
    </Suspense>
  );

  // Render content based on selection
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
  } else {
    content = (
      <Suspense fallback={<DatabaseContentSkeleton />}>
        <DatabaseContentContainer
          tableId={selectedTableId}
          handlers={handlers}
        />
      </Suspense>
    );
  }

  const header = !selectedTableId ? (
    <div className="border-b border-dashed px-6 py-4">
      <h1 className="text-xl font-semibold text-muted-foreground">
        Select or create a database
      </h1>
      <p className="text-sm text-muted-foreground">
        Choose a database from the sidebar to explore roadmap views.
      </p>
    </div>
  ) : null;

  return (
    <>
      <DatabaseShell header={header} sidebar={sidebar}>
        {content}
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
