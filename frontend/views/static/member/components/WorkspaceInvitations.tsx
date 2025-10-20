"use client";

import { useMemo } from "react";
import type { Id } from "@convex/_generated/dataModel";
import { useCancelInvitation, useWorkspaceInvitations } from "../api";
import { Mail, Clock, XCircle } from "lucide-react";

export function WorkspaceInvitations({ workspaceId }: { workspaceId: Id<"workspaces"> }) {
  const invitations = useWorkspaceInvitations(workspaceId, "pending") as any[] | undefined;
  const cancel = useCancelInvitation();

  const list = useMemo(() => invitations || [], [invitations]);

  if (!list.length) return null;

  return (
    <div className="mt-6 bg-background rounded-lg border border-gray-200">
      <div className="p-4 border-b border-gray-200 flex items-center gap-2">
        <Clock className="w-4 h-4 text-yellow-600" />
        <h2 className="font-semibold">Pending Invitations</h2>
        <span className="ml-auto text-xs text-gray-500">{list.length} pending</span>
      </div>
      <div className="divide-y divide-gray-100">
        {list.map((inv) => (
          <div key={String(inv._id)} className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <div className="font-medium">{inv.inviteeEmail}</div>
                <div className="text-xs text-gray-500">
                  Invited by {inv?.inviter?.name || "Unknown"}
                  {inv?.role?.name ? ` • Role: ${inv.role.name}` : ""}
                </div>
              </div>
            </div>
            <button
              className="text-destructive-600 hover:bg-red-50 p-2 rounded flex items-center gap-2 text-sm"
              onClick={async () => {
                if (!confirm("Cancel this invitation?")) return;
                await cancel({ invitationId: inv._id });
              }}
              title="Cancel invitation"
            >
              <XCircle className="w-4 h-4" />
              Cancel
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
