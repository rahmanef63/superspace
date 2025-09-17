"use client";

import { useState } from "react";
import type { Id } from "@convex/_generated/dataModel";
import { Database, FileText, MessageCircle, Settings } from "lucide-react";
import {
  DocumentEditor,
  DocumentsBrowser,
  CreateDocumentDialog,
  useDocumentsManager,
} from "../shared";
import type { DocumentEditorMode } from "../shared";

export interface DocumentsPageManagementViewProps {
  workspaceId: Id<"workspaces">;
  editorMode?: DocumentEditorMode;
  storageKey?: string;
}

type AppMode = "documents" | "chat" | "db" | "settings";

export function DocumentsPageManagementView({
  workspaceId,
  editorMode = "block",
  storageKey,
}: DocumentsPageManagementViewProps) {
  const [appMode, setAppMode] = useState<AppMode>("documents");
  const manager = useDocumentsManager({ workspaceId });

  return (
    <div className="flex h-full bg-muted/30">
      <div className="w-16 bg-gray-900 flex flex-col items-center py-4 space-y-4 text-gray-400">
        <SidebarIcon
          icon={FileText}
          isActive={appMode === "documents"}
          label="Documents"
          onClick={() => setAppMode("documents")}
        />
        <SidebarIcon
          icon={Database}
          isActive={appMode === "db"}
          label="Database"
          onClick={() => setAppMode("db")}
        />
        <div className="flex-1" />
        <SidebarIcon
          icon={Settings}
          isActive={appMode === "settings"}
          label="Settings"
          onClick={() => setAppMode("settings")}
        />
      </div>

      <div className="flex-1 flex">
        {appMode === "documents" && (
          <div className="flex flex-1">
            <div className="w-[360px] border-r bg-white">
              <DocumentsBrowser
                documents={manager.documents}
                filteredDocuments={manager.filteredDocuments}
                isLoading={manager.isLoading}
                onSelect={manager.selectDocument}
                onCreate={manager.openCreateDialog}
                search={manager.search}
                onSearch={manager.setSearch}
                visibility={manager.visibility}
                onVisibilityChange={manager.setVisibility}
                stats={manager.stats}
                storageKey={storageKey ?? `documents.panel.view.${workspaceId}`}
              />
            </div>

            <div className="flex-1 flex items-stretch">
              {manager.state.selectedDocumentId ? (
                <DocumentEditor
                  documentId={manager.state.selectedDocumentId}
                  mode={editorMode}
                  onBack={() => manager.selectDocument(null)}
                  className="w-full"
                />
              ) : (
                <div className="flex-1 flex items-center justify-center bg-white">
                  <div className="text-center space-y-3">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto" />
                    <h2 className="text-xl font-semibold text-gray-900">Welcome to your workspace</h2>
                    <p className="text-gray-600">
                      Select a document from the left panel or create a new one to get started.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {appMode === "db" && (
          <PlaceholderView
            icon={Database}
            title="CMS"
            message="Database builder is in progress."
          />
        )}
        {appMode === "settings" && (
          <PlaceholderView
            icon={Settings}
            title="Settings"
            message="Tune your workspace preferences here soon."
          />
        )}
      </div>

      <CreateDocumentDialog
        open={manager.state.createOpen}
        onOpenChange={manager.toggleCreateDialog}
        workspaceId={workspaceId}
        onCreated={(documentId) => {
          manager.toggleCreateDialog(false);
          manager.selectDocument(documentId);
        }}
      />
    </div>
  );
}

interface SidebarIconProps {
  icon: typeof FileText;
  isActive: boolean;
  label: string;
  onClick: () => void;
}

function SidebarIcon({ icon: Icon, isActive, label, onClick }: SidebarIconProps) {
  return (
    <button
      onClick={onClick}
      className={`p-3 rounded-lg transition-colors ${
        isActive ? "bg-blue-600 text-white" : "hover:text-white hover:bg-gray-800"
      }`}
      aria-label={label}
    >
      <Icon className="w-6 h-6" />
    </button>
  );
}

interface PlaceholderViewProps {
  icon: typeof FileText;
  title: string;
  message: string;
}

function PlaceholderView({ icon: Icon, title, message }: PlaceholderViewProps) {
  return (
    <div className="flex-1 flex items-center justify-center bg-white">
      <div className="text-center space-y-3">
        <Icon className="w-16 h-16 text-gray-300 mx-auto" />
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
}
