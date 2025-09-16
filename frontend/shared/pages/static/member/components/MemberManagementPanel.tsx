"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Id } from "@convex/_generated/dataModel";
import { MemberList } from "./MemberList";
import { MemberView } from "./MemberView";
import { WorkspaceInvitations } from "./WorkspaceInvitations";
import { LABELS } from "../config/labels";
import { useMemberGuards } from "../lib/guards";
import { InvitationModal } from "@/frontend/shared/pages/static/invitations/components/InvitationModal";

export function MemberManagementPanel({
  workspaceId,
  onInviteClick,
}: {
  workspaceId: Id<"workspaces">;
  onInviteClick?: () => void;
}) {
  const { canInvite } = useMemberGuards(workspaceId);
  const [showInvite, setShowInvite] = useState(false);
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{LABELS.title}</h1>
          <p className="text-muted-foreground">{LABELS.subtitle}</p>
        </div>
        {canInvite && (
          <Button
            onClick={() => {
              if (onInviteClick) return onInviteClick();
              setShowInvite(true);
            }}
            className="gap-2 self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4" />
            {LABELS.invite}
          </Button>
        )}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Workspace Members</CardTitle>
        </CardHeader>
        <CardContent>
          <MemberView workspaceId={workspaceId} />
        </CardContent>
      </Card>

      {canInvite && <WorkspaceInvitations workspaceId={workspaceId} />}

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
