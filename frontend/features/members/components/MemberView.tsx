"use client";

import { useMemo } from "react";
import type { Id } from "@convex/_generated/dataModel";
import { ViewSwitcher, type ViewConfig } from "@/frontend/shared/ui/layout/view";
import type { Member } from "../types";
import { RoleSelect } from "./RoleSelect";
import { useMemberCrud } from "../hooks/useMemberCrud";
import { useMemberGuards } from "../lib/guards";
import { useMembers, useRoles } from "../api";
import { Trash2, RotateCcw } from "lucide-react";

export function MemberView({ workspaceId }: { workspaceId: Id<"workspaces"> }) {
  const members = (useMembers(workspaceId, { includeInactive: true }) || []) as Member[];
  const roles = useRoles(workspaceId) as any[] | undefined;
  const { canManage, canManageRoles } = useMemberGuards(workspaceId);
  const { updateRole, createRole, remove, add } = useMemberCrud(workspaceId);

  const config: ViewConfig<Member> = useMemo(() => ({
    getId: (m: Member) => String(m._id),
    columns: [
      {
        id: "name",
        header: "Name",
        cell: (m: Member) => (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs">
              {m.user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="min-w-0">
              <div className="font-medium truncate">{m.user?.name || "Unknown User"}</div>
              <div className="text-xs text-gray-500 truncate">{m.user?.email}</div>
            </div>
          </div>
        ),
      },
      {
        id: "role",
        header: "Role",
        cell: (m: Member) => (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2 px-2 py-0.5 bg-gray-100 rounded-full text-sm">
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
        header: "Status",
        cell: (m: Member) => (
          <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600 capitalize">{m.status}</span>
        ),
        hideOnCard: true,
      },
    ],
    actions: [
      ...(canManage
        ? [
            {
              id: "remove",
              label: "Remove",
              icon: <Trash2 className="w-4 h-4" />,
              onClick: async (m: Member) => {
                if (m.status !== "active") return;
                if (!confirm("Remove this member?")) return;
                await remove(m.userId);
              },
              visible: (m: Member) => m.status === "active",
            },
            {
              id: "reactivate",
              label: "Reactivate",
              icon: <RotateCcw className="w-4 h-4" />,
              onClick: async (m: Member) => {
                if (m.status === "active") return;
                await add(m.userId);
              },
              visible: (m: Member) => m.status !== "active",
            },
          ]
        : []),
    ],
    card: {
      title: (m: Member) => m.user?.name || "Unknown",
      subtitle: (m: Member) => m.user?.email,
      extra: (m: Member) => m.role?.name,
      avatar: (m: Member) => (
        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs">
          {m.user?.name?.[0]?.toUpperCase() || "U"}
        </div>
      ),
    },
    details: {
      fields: [
        { label: "Name", value: (m: Member) => m.user?.name },
        { label: "Email", value: (m: Member) => m.user?.email },
        { label: "Role", value: (m: Member) => m.role?.name },
        { label: "Status", value: (m: Member) => m.status },
      ],
    },
    searchFn: (m: Member, q) =>
      Boolean(m.user?.name?.toLowerCase().includes(q) || m.user?.email?.toLowerCase().includes(q)),
  }), [roles, canManage, canManageRoles, updateRole, createRole, remove, add]);

  return (
    <ViewSwitcher
      storageKey={`members.view.${workspaceId}`}
      initialMode="table"
      data={members}
      config={config}
      searchable
      emptyState="No members found"
    />
  );
}
