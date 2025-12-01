"use client";

import { useState } from "react";
import { UserPlus, Users, Mail, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/frontend/shared/ui/components/pages/PageHeader";
import type { Id } from "@convex/_generated/dataModel";
import { MemberList } from "./MemberList";
import { MemberView } from "./MemberView";
import { MemberSearch } from "./MemberSearch";
import { InvitationsManagement } from "./InvitationsManagement";
import { BulkInviteDialog } from "./BulkInviteDialog";
import { LABELS } from "../config/labels";
import { useMemberGuards } from "../lib/guards";
import { InvitationModal } from "@/frontend/features/invitations/components/InvitationModal";

export function MemberManagementPanel({
  workspaceId,
  onInviteClick,
}: {
  workspaceId: Id<"workspaces">;
  onInviteClick?: () => void;
}) {
  const { canInvite, canManageMembers } = useMemberGuards(workspaceId);
  const [showInvite, setShowInvite] = useState(false);
  const [activeTab, setActiveTab] = useState("members");

  return (
    <div className="space-y-6">
      <PageHeader
        title={LABELS.title}
        subtitle={LABELS.subtitle}
        actions={
          canInvite ? (
            <div className="flex items-center gap-2">
              <BulkInviteDialog workspaceId={workspaceId} />
              <Button
                onClick={() => {
                  if (onInviteClick) return onInviteClick();
                  setShowInvite(true);
                }}
                className="gap-2"
              >
                <UserPlus className="h-4 w-4" />
                {LABELS.invite}
              </Button>
            </div>
          ) : undefined
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="members" className="gap-2">
            <Users className="h-4 w-4" />
            Members
          </TabsTrigger>
          <TabsTrigger value="search" className="gap-2">
            <Search className="h-4 w-4" />
            Search
          </TabsTrigger>
          {canInvite && (
            <TabsTrigger value="invitations" className="gap-2">
              <Mail className="h-4 w-4" />
              Invitations
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="members" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Workspace Members</CardTitle>
              <CardDescription>
                View and manage all members in this workspace
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MemberView workspaceId={workspaceId} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="search" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Search Members</CardTitle>
              <CardDescription>
                Search members by name, email, or filter by role and status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MemberSearch workspaceId={workspaceId} />
            </CardContent>
          </Card>
        </TabsContent>

        {canInvite && (
          <TabsContent value="invitations" className="mt-4">
            <InvitationsManagement workspaceId={workspaceId} />
          </TabsContent>
        )}
      </Tabs>

      {showInvite && (
        <InvitationModal
          workspaceId={workspaceId}
          type="workspace"
          onClose={() => setShowInvite(false)}
        />
      )}
    </div>
  );
}
