"use client";

import { useState } from "react";
import type { Id } from "@convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  AlertCircle, 
  BookOpen, 
  FileText, 
  User, 
  Building2,
  Brain,
  Sparkles
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { DocumentEditorMode } from "../types";

// Import the documents view for document/article sections
import { DocumentsView } from "@/frontend/features/documents/shared/components";

// Import profile from knowledge feature
import { ProfileDataForm } from "@/frontend/features/knowledge/features/profile/components/ProfileDataForm";

// Import workspace context page
import WorkspaceContextPage from "@/frontend/features/knowledge/features/workspace-context/page";

type KnowledgeTab = "articles" | "documents" | "profile" | "workspace";

interface KnowledgeViewProps {
  workspaceId: Id<"workspaces"> | null;
  editorMode?: DocumentEditorMode;
  initialTab?: KnowledgeTab;
}

export function KnowledgeViewTabs({
  workspaceId,
  editorMode = "block",
  initialTab = "articles",
}: KnowledgeViewProps) {
  const [activeTab, setActiveTab] = useState<KnowledgeTab>(initialTab);

  // Get document counts for badges
  const documentCounts = useQuery(
    (api as any)["features/knowledge/api/knowledgeForAI"].getDocumentCounts,
    workspaceId ? { workspaceId } : "skip"
  );

  if (!workspaceId) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No workspace selected. Please select a workspace to manage knowledge.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header with AI indicator */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-500" />
          <h1 className="text-lg font-semibold">Knowledge Base</h1>
          <Badge variant="secondary" className="gap-1 text-xs">
            <Sparkles className="h-3 w-3" />
            AI Context
          </Badge>
        </div>
        <div className="text-xs text-muted-foreground">
          {documentCounts?.total ?? 0} items available for AI
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs 
        value={activeTab} 
        onValueChange={(v) => setActiveTab(v as KnowledgeTab)}
        className="flex-1 flex flex-col min-h-0"
      >
        <div className="border-b bg-muted/30">
          <TabsList className="w-full justify-start h-auto p-0 bg-transparent rounded-none">
            <TabsTrigger
              value="articles"
              className={cn(
                "relative px-4 py-3 rounded-none border-b-2 border-transparent",
                "data-[state=active]:border-primary data-[state=active]:bg-background",
                "flex items-center gap-2"
              )}
            >
              <BookOpen className="h-4 w-4" />
              <span>Articles</span>
              {documentCounts?.articles !== undefined && documentCounts.articles > 0 && (
                <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                  {documentCounts.articles}
                </Badge>
              )}
            </TabsTrigger>
            
            <TabsTrigger
              value="documents"
              className={cn(
                "relative px-4 py-3 rounded-none border-b-2 border-transparent",
                "data-[state=active]:border-primary data-[state=active]:bg-background",
                "flex items-center gap-2"
              )}
            >
              <FileText className="h-4 w-4" />
              <span>Documents</span>
              {documentCounts?.documents !== undefined && documentCounts.documents > 0 && (
                <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                  {documentCounts.documents}
                </Badge>
              )}
            </TabsTrigger>
            
            <TabsTrigger
              value="profile"
              className={cn(
                "relative px-4 py-3 rounded-none border-b-2 border-transparent",
                "data-[state=active]:border-primary data-[state=active]:bg-background",
                "flex items-center gap-2"
              )}
            >
              <User className="h-4 w-4" />
              <span>My Profile</span>
            </TabsTrigger>
            
            <TabsTrigger
              value="workspace"
              className={cn(
                "relative px-4 py-3 rounded-none border-b-2 border-transparent",
                "data-[state=active]:border-primary data-[state=active]:bg-background",
                "flex items-center gap-2"
              )}
            >
              <Building2 className="h-4 w-4" />
              <span>Workspace</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab Contents */}
        <TabsContent value="articles" className="flex-1 m-0 min-h-0">
          <DocumentsView 
            workspaceId={workspaceId} 
            editorMode={editorMode}
            storageKey="knowledge-articles"
            category="article"
          />
        </TabsContent>

        <TabsContent value="documents" className="flex-1 m-0 min-h-0">
          <DocumentsView 
            workspaceId={workspaceId} 
            editorMode={editorMode}
            storageKey="knowledge-documents"
            category="document"
          />
        </TabsContent>

        <TabsContent value="profile" className="flex-1 m-0 overflow-auto">
          <ProfileDataForm />
        </TabsContent>

        <TabsContent value="workspace" className="flex-1 m-0 overflow-auto">
          <WorkspaceContextPage workspaceId={workspaceId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
