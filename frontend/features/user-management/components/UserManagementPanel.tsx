/**
 * UserManagementPanel
 * 
 * Main panel component for unified user management.
 * Provides tabs for:
 * - Team: Contacts and teams management
 * - Matrix: User→workspace access visualization
 * - Invite: Quick invite features
 * - Roles: Visual role hierarchy (ReactFlow)
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Users, 
  Grid3X3, 
  UserPlus, 
  GitBranch, 
  RefreshCw,
  Plus,
  AlertCircle,
} from "lucide-react";
import type { Id } from "@convex/_generated/dataModel";
import type { UserManagementTab } from "../types";
import { 
  useHierarchyMemberOverview,
  useUserWorkspaceMatrix,
  useContactsForQuickInvite,
  useWorkspaceTeams,
  useRoleHierarchy,
} from "../api";

// Sub-components
import { TeamListPanel } from "./TeamListPanel";
import { AccessMatrixView } from "./AccessMatrixView";
import { QuickInvitePanel } from "./QuickInvitePanel";
// Lazy load ReactFlow canvas to reduce initial bundle (~200kb savings)
import { RoleHierarchyCanvasLazy as RoleHierarchyCanvas } from "./RoleHierarchyCanvasLazy";

interface UserManagementPanelProps {
  workspaceId: Id<"workspaces">;
  className?: string;
  defaultTab?: UserManagementTab;
  onTabChange?: (tab: UserManagementTab) => void;
}

export function UserManagementPanel({
  workspaceId,
  className,
  defaultTab = "team",
  onTabChange,
}: UserManagementPanelProps) {
  const [activeTab, setActiveTab] = React.useState<UserManagementTab>(defaultTab);

  // Fetch data
  const overview = useHierarchyMemberOverview(workspaceId);
  const matrix = useUserWorkspaceMatrix(workspaceId);
  const ContactsForInvite = useContactsForQuickInvite(workspaceId);
  const teams = useWorkspaceTeams(workspaceId);
  const roleHierarchy = useRoleHierarchy(workspaceId);

  const handleTabChange = (value: string) => {
    const tab = value as UserManagementTab;
    setActiveTab(tab);
    onTabChange?.(tab);
  };

  // Stats for badges
  const totalMembers = overview?.totalMembers ?? 0;
  const pendingInvites = overview?.pendingInvitations ?? 0;
  const ContactCount = ContactsForInvite?.length ?? 0;
  const teamCount = teams?.length ?? 0;

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header with stats */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            User Management
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage members, teams, and access across workspaces
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {totalMembers} members
          </Badge>
          {pendingInvites > 0 && (
            <Badge variant="outline" className="text-xs text-orange-600 border-orange-300">
              {pendingInvites} pending
            </Badge>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs 
        value={activeTab} 
        onValueChange={handleTabChange}
        className="flex-1 flex flex-col"
      >
        <TabsList className="w-full justify-start mb-4">
          <TabsTrigger value="team" className="gap-1.5">
            <Users className="w-4 h-4" />
            Team
            {teamCount > 0 && (
              <Badge variant="secondary" className="ml-1 text-[10px] px-1 py-0">
                {teamCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="matrix" className="gap-1.5">
            <Grid3X3 className="w-4 h-4" />
            Access Matrix
          </TabsTrigger>
          <TabsTrigger value="invite" className="gap-1.5">
            <UserPlus className="w-4 h-4" />
            Quick Invite
            {ContactCount > 0 && (
              <Badge variant="secondary" className="ml-1 text-[10px] px-1 py-0">
                {ContactCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="roles" className="gap-1.5">
            <GitBranch className="w-4 h-4" />
            Role Hierarchy
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="team" className="h-full m-0">
            <TeamListPanel 
              workspaceId={workspaceId}
              teams={teams ?? []}
              overview={overview}
            />
          </TabsContent>

          <TabsContent value="matrix" className="h-full m-0">
            <AccessMatrixView 
              workspaceId={workspaceId}
              matrix={matrix}
            />
          </TabsContent>

          <TabsContent value="invite" className="h-full m-0">
            <QuickInvitePanel 
              workspaceId={workspaceId}
              Contacts={ContactsForInvite ?? []}
              teams={teams ?? []}
            />
          </TabsContent>

          <TabsContent value="roles" className="h-full m-0">
            <RoleHierarchyCanvas 
              workspaceId={workspaceId}
              roleHierarchy={roleHierarchy}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

export default UserManagementPanel;
