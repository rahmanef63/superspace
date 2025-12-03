"use client";

import { FolderKanban, Plus, LayoutGrid } from "lucide-react";
import { Id } from "@convex/_generated/dataModel";
import { FeatureHeader } from "@/frontend/shared/ui/layout/header";
import { PageContainer } from "@/frontend/shared/ui/layout/container";

export interface ProjectsPageProps {
  workspaceId: Id<"workspaces"> | null;
}

export default function ProjectsPage({ workspaceId }: ProjectsPageProps) {
  if (!workspaceId) {
    return (
      <PageContainer centered>
        <div className="text-center">
          <h2 className="text-xl font-semibold">No Workspace Selected</h2>
          <p className="mt-2 text-muted-foreground">
            Please select a workspace to view projects
          </p>
        </div>
      </PageContainer>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <FeatureHeader
        icon={FolderKanban}
        title="Projects"
        subtitle="Manage your workspace projects and task discussions"
        badge={{ text: "Coming Soon", variant: "secondary" }}
        primaryAction={{
          label: "New Project",
          icon: Plus,
          onClick: () => {},
          disabled: true,
        }}
        secondaryActions={[
          {
            id: "view",
            label: "View",
            icon: LayoutGrid,
            onClick: () => {},
          },
        ]}
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="flex h-full items-center justify-center">
          <div className="text-center space-y-4">
            <FolderKanban className="h-16 w-16 mx-auto text-muted-foreground/30" />
            <div>
              <p className="text-lg font-medium">Projects feature is under development</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Expected Release: Q2 2025
              </p>
            </div>
            <p className="text-sm text-muted-foreground max-w-md">
              This page will display all projects with discussion capabilities,
              milestones, and team collaboration tools.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
