"use client";

import { Users, Plus, Search, Filter } from "lucide-react";
import { Id } from "@convex/_generated/dataModel";
import { FeatureHeader } from "@/frontend/shared/ui/layout/header";
import { PageContainer } from "@/frontend/shared/ui/layout/container";
import { Button } from "@/components/ui/button";

export interface CRMPageProps {
  workspaceId: Id<"workspaces"> | null;
}

export default function CRMPage({ workspaceId }: CRMPageProps) {
  if (!workspaceId) {
    return (
      <PageContainer className="flex items-center justify-center" fullHeight>
        <div className="text-center">
          <h2 className="text-xl font-semibold">No Workspace Selected</h2>
          <p className="mt-2 text-muted-foreground">
            Please select a workspace to access CRM
          </p>
        </div>
      </PageContainer>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <FeatureHeader
        icon={Users}
        title="CRM"
        subtitle="Manage customer conversations and relationships"
        badge={{ text: "Coming Soon", variant: "secondary" }}
        primaryAction={{
          label: "Add Contact",
          icon: Plus,
          onClick: () => {},
        }}
        secondaryActions={
          <>
            <Button variant="ghost" size="sm" disabled>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            <Button variant="ghost" size="sm" disabled>
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </>
        }
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="flex h-full items-center justify-center">
          <div className="text-center space-y-4">
            <Users className="h-16 w-16 mx-auto text-muted-foreground/30" />
            <div>
              <p className="text-lg font-medium">CRM feature is under development</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Expected Release: Q2 2025
              </p>
            </div>
            <p className="text-sm text-muted-foreground max-w-md">
              This page will display customer list with integrated chat,
              deal tracking, and relationship management tools.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
