"use client";

import { Trash2, RotateCcw, Search } from "lucide-react";
import type { Id } from "@convex/_generated/dataModel";
import type { Member } from "../types";
import { useMembers, useRoles } from "../api";
import { useMemberCrud } from "../hooks/useMemberCrud";
import { useMemberGuards } from "../lib/guards";
import { RoleSelect } from "./RoleSelect";
import { LABELS } from "../config/labels";
import { useMemo, useState } from "react";

export function MemberList({ workspaceId }: { workspaceId: Id<"workspaces"> }) {
  const [includeInactive, setIncludeInactive] = useState(false);
  const [query, setQuery] = useState("");
  const members = useMembers(workspaceId, { includeInactive }) as any as Member[] | undefined;
  const roles = useRoles(workspaceId) as any;
  const { updateRole, createRole, remove, add } = useMemberCrud(workspaceId);
  const { canManage, canManageRoles } = useMemberGuards(workspaceId);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = members || [];
    if (!q) return list;
    return list.filter((m) =>
      (m.user?.name?.toLowerCase().includes(q) || m.user?.email?.toLowerCase().includes(q))
    );
  }, [members, query]);

  return (
    <div>
      <div className="flex items-center justify-between p-4 gap-3 border-b border-gray-200">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search members by name or email"
            className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm"
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={includeInactive}
            onChange={(e) => setIncludeInactive(e.target.checked)}
          />
          Show inactive
        </label>
      </div>

      <div className="divide-y divide-gray-200">
      {(filtered || []).map((member) => (
        <div key={String(member._id)} className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              {member.user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
              <div className="font-medium">{member.user?.name || "Unknown User"}</div>
              <div className="text-sm text-muted-foreground">{member.user?.email}</div>
              {member.status !== "active" && (
                <div className="mt-1 inline-block text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                  {member.status}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
                <span className="text-sm">{member.role?.name}</span>
              </div>
              {canManage && (
                <RoleSelect
                  roles={roles}
                  value={String(member.roleId)}
                  allowCreate={canManageRoles}
                  onChange={async (val) => {
                    if (val === "__add_role__") {
                      const name = window.prompt(LABELS.roleAddPrompt, "Custom Role");
                      if (!name || !name.trim()) return;
                      const levelStr = window.prompt(LABELS.roleLevelPrompt, "60");
                      if (!levelStr) return;
                      const level = Number(levelStr);
                      if (!Number.isFinite(level)) return;
                      const newRoleId = (await createRole(name.trim(), level)) as Id<"roles">;
                      await updateRole(member.userId, newRoleId);
                      return;
                    }
                    await updateRole(member.userId, val as unknown as Id<"roles">);
                  }}
                />
              )}
            </div>
            {canManage && member.status === "active" && (
              <button
                className="p-2 hover:bg-red-50 rounded text-destructive-600"
                title="Remove member"
                onClick={async () => {
                  if (!confirm(LABELS.removeConfirm)) return;
                  await remove(member.userId);
                }}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            {canManage && member.status !== "active" && (
              <button
                className="p-2 hover:bg-blue-50 rounded text-blue-600"
                title="Reactivate member"
                onClick={async () => {
                  await add(member.userId);
                }}
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ))}
      </div>
    </div>
  );
}
