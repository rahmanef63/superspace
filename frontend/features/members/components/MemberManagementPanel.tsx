"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/frontend/shared/ui/components/pages/PageHeader";
import type { Id } from "@convex/_generated/dataModel";
import { MemberList } from "./MemberList";
import { MemberView } from "./MemberView";
import { WorkspaceInvitations } from "./WorkspaceInvitations";
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
  const { canInvite } = useMemberGuards(workspaceId);
  const [showInvite, setShowInvite] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title={LABELS.title}
        subtitle={LABELS.subtitle}
        actions={
          canInvite ? (
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
          ) : undefined
        }
      />

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
