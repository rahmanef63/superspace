"use client";

import { useMemo } from "react";
import type { Id } from "@convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Globe, Lock, TableProperties } from "lucide-react";
import {
  DocumentsBrowser,
  CreateDocumentDialog,
  TiptapCanvas,
  useDocumentsManager,
} from "../shared";

export interface DocumentsDbManagementViewProps {
  workspaceId: Id<"workspaces">;
  storageKey?: string;
}

export function DocumentsDbManagementView({ workspaceId, storageKey }: DocumentsDbManagementViewProps) {
  const manager = useDocumentsManager({ workspaceId });

  const selectedDocument = useMemo(
    () => manager.documents.find((doc) => doc._id === manager.state.selectedDocumentId),
    [manager.documents, manager.state.selectedDocumentId]
  );

  return (
    <div className="flex h-full bg-muted/20">
      <div className="flex-1 flex flex-col border-r bg-background">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Knowledge Base</h1>
              <p className="text-gray-600">
                Curate structured documents, track visibility, and surface insights at a glance.
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <Badge variant="secondary">{manager.stats.total} documents</Badge>
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                {manager.stats.publicCount} public
              </Badge>
              <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">
                {manager.stats.privateCount} private
              </Badge>
            </div>
          </div>
        </div>

        <Tabs defaultValue="table" className="flex-1 flex flex-col">
          <div className="p-4 border-b bg-background">
            <TabsList>
              <TabsTrigger value="table" className="flex items-center gap-2">
                <TableProperties className="w-4 h-4" /> Table
              </TabsTrigger>
              <TabsTrigger value="gallery" disabled>
                Gallery
              </TabsTrigger>
              <TabsTrigger value="timeline" disabled>
                Timeline
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="table" className="flex-1 overflow-hidden">
            <DocumentsBrowser
              documents={manager.documents}
              filteredDocuments={manager.filteredDocuments}
              isLoading={manager.isLoading}
              onSelect={manager.selectDocument}
              onCreate={manager.openCreateDialog}
              selectedDocumentId={manager.state.selectedDocumentId}
              search={manager.search}
              onSearch={manager.setSearch}
              visibility={manager.visibility}
              onVisibilityChange={manager.setVisibility}
              stats={manager.stats}
              workspaceId={workspaceId}
            />
          </TabsContent>

          <TabsContent value="gallery" className="flex-1 flex items-center justify-center text-gray-500">
            Gallery view is coming soon.
          </TabsContent>

          <TabsContent value="timeline" className="flex-1 flex items-center justify-center text-gray-500">
            Timeline view is coming soon.
          </TabsContent>
        </Tabs>
      </div>

      <aside className="w-[340px] bg-white flex flex-col border-l">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Inspector</h2>
          <p className="text-sm text-muted-foreground">
            Preview metadata and last activity for the selected document.
          </p>
        </div>

        {selectedDocument ? (
          <ScrollArea className="flex-1">
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <h3 className="text-base font-semibold text-gray-900">
                    {selectedDocument.title}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Created {new Date(selectedDocument._creationTime).toLocaleString()}
                </p>
                <Badge variant="outline" className="gap-1">
                  {selectedDocument.isPublic ? (
                    <>
                      <Globe className="w-3 h-3" /> Public
                    </>
                  ) : (
                    <>
                      <Lock className="w-3 h-3" /> Private
                    </>
                  )}
                </Badge>
              </div>

              <Separator />

              <Card>
                <CardContent className="p-0">
                  <TiptapCanvas
                    documentId={selectedDocument._id}
                    content={selectedDocument.content || ""}
                    editable={false}
                  />
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
            Select a document to see its details.
          </div>
        )}
      </aside>

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
