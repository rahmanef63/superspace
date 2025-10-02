"use client";

import { useState } from "react";
import type { Id } from "@convex/_generated/dataModel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DocumentsDbManagementView } from "../views/db-management";
import { DocumentsPageManagementView } from "../views/page-management";
import type { DocumentEditorMode } from "../shared";

interface DocumentsFeaturePageProps {
  workspaceId?: Id<"workspaces"> | null;
  editorMode?: DocumentEditorMode;
  initialTab?: "workspace" | "database";
}

export default function DocumentsFeaturePage({
  workspaceId,
  editorMode = "block",
  initialTab = "workspace",
}: DocumentsFeaturePageProps) {
  const [tab, setTab] = useState(initialTab);

  if (!workspaceId) {
    return (
      <div className="flex h-full items-center justify-center">
        Connect this view to a workspace to start managing documents.
      </div>
    );
  }

  return (
    <Tabs value={tab} onValueChange={(value) => setTab(value as typeof tab)} className="flex h-full flex-col">
      <div className="border-b bg-background px-6 py-4">
        <TabsList>
          <TabsTrigger value="workspace">Workspace</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="workspace" className="flex-1">
        <DocumentsPageManagementView workspaceId={workspaceId} editorMode={editorMode} />
      </TabsContent>

      <TabsContent value="database" className="flex-1">
        <DocumentsDbManagementView workspaceId={workspaceId} />
      </TabsContent>
    </Tabs>
  );
}
