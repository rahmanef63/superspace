"use client";

import { useMemo } from "react";
import type { Id } from "@convex/_generated/dataModel";
import { ViewSystem } from "@/frontend/shared/ui";
import type { Member } from "../types";
import { RoleSelect } from "./RoleSelect";
import { useMemberCrud } from "../hooks/useMemberCrud";
import { useMemberGuards } from "../lib/guards";
import { useMembers, useRoles } from "../api";
import { Trash2, RotateCcw } from "lucide-react";

const { ViewProvider, ViewRenderer } = ViewSystem;

export function MemberView({ workspaceId }: { workspaceId: Id<"workspaces"> }) {
  const members = (useMembers(workspaceId, { includeInactive: true }) || []) as Member[];
  const roles = useRoles(workspaceId) as any[] | undefined;
  const { canManage, canManageRoles } = useMemberGuards(workspaceId);
  const { updateRole, createRole, remove, add } = useMemberCrud(workspaceId);

  // Define ViewConfig for the new view-system
  const config: ViewSystem.ViewConfig<Member> = useMemo(() => ({
    id: "members",
    type: ViewSystem.ViewType.TABLE,
    label: "Members",
    
    // Define fields (columns)
    fields: [
      {
        id: "name",
        label: "Name",
        type: "text",
        render: (m: Member) => (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-xs">
              {m.user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="min-w-0">
              <div className="font-medium truncate">{m.user?.name || "Unknown User"}</div>
              <div className="text-xs text-muted-foreground truncate">{m.user?.email}</div>
            </div>
          </div>
        ),
      },
      {
        id: "role",
        label: "Role",
        type: "text",
        render: (m: Member) => (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2 px-2 py-0.5 bg-muted rounded-full text-sm">
              {m.role?.name}
            </span>
            {canManage && (
              <RoleSelect
                roles={roles as any}
                value={String(m.roleId)}
                allowCreate={canManageRoles}
                onChange={async (val) => {
                  if (val === "__add_role__") {
                    const name = window.prompt("New role name:", "Custom Role");
                    if (!name || !name.trim()) return;
                    const levelStr = window.prompt("Level (0-99, lower = higher access):", "60");
                    if (!levelStr) return;
                    const level = Number(levelStr);
                    if (!Number.isFinite(level)) return;
                    const newRoleId = await createRole(name.trim(), level);
                    await updateRole(m.userId, newRoleId as Id<"roles">);
                    return;
                  }
                  await updateRole(m.userId, val as unknown as Id<"roles">);
                }}
              />
            )}
          </div>
        ),
      },
      {
        id: "status",
        label: "Status",
        type: "text",
        render: (m: Member) => (
          <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground capitalize">
            {m.status}
          </span>
        ),
      },
    ],
    
    // Define actions
    actions: canManage ? [
      {
        id: "remove",
        label: "Remove",
        icon: Trash2,
        onClick: async (m: Member) => {
          if (m.status !== "active") return;
          if (!confirm("Remove this member?")) return;
          await remove(m.userId);
        },
        hidden: (m: Member) => m.status !== "active",
      },
      {
        id: "reactivate",
        label: "Reactivate",
        icon: RotateCcw,
        onClick: async (m: Member) => {
          if (m.status === "active") return;
          await add(m.userId);
        },
        hidden: (m: Member) => m.status === "active",
      },
    ] : [],
    
    // Settings
    settings: {
      showSearch: true,
      sortable: true,
      selectable: false,
    },
  }), [roles, canManage, canManageRoles, updateRole, createRole, remove, add]);

  return (
    <ViewProvider
      data={members}
      config={config}
      initialView={ViewSystem.ViewType.TABLE}
      storageKey={`members.view.${workspaceId}`}
    >
      <ViewRenderer />
    </ViewProvider>
  );
}
