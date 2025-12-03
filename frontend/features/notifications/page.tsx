"use client";

import { Bell, CheckCheck, Settings } from "lucide-react";
import { Id } from "@convex/_generated/dataModel";
import { FeatureHeader } from "@/frontend/shared/ui/layout/header";
import { PageContainer } from "@/frontend/shared/ui/layout/container";
import { Button } from "@/components/ui/button";

export interface NotificationsPageProps {
  workspaceId: Id<"workspaces"> | null;
}

export default function NotificationsPage({ workspaceId }: NotificationsPageProps) {
  if (!workspaceId) {
    return (
      <PageContainer className="flex items-center justify-center" fullHeight>
        <div className="text-center">
          <h2 className="text-xl font-semibold">No Workspace Selected</h2>
          <p className="mt-2 text-muted-foreground">
            Please select a workspace to view notifications
          </p>
        </div>
      </PageContainer>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <FeatureHeader
        icon={Bell}
        title="Notifications"
        subtitle="System notifications and activity feed"
        badge={{ text: "Coming Soon", variant: "secondary" }}
        secondaryActions={
          <>
            <Button variant="ghost" size="sm" disabled>
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark all read
            </Button>
            <Button variant="ghost" size="sm" disabled>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </>
        }
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="flex h-full items-center justify-center">
          <div className="text-center space-y-4">
            <Bell className="h-16 w-16 mx-auto text-muted-foreground/30" />
            <div>
              <p className="text-lg font-medium">Notifications feature is under development</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Expected Release: Q1 2025
              </p>
            </div>
            <p className="text-sm text-muted-foreground max-w-md">
              This page will display your activity feed, system notifications,
              and important updates from your workspace.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
