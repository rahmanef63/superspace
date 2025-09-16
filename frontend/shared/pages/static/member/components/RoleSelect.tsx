"use client";

import type { Id } from "@convex/_generated/dataModel";
import type { Role } from "../types";
import { sortRolesAsc } from "../utils/sort";

export function RoleSelect({
  roles,
  value,
  onChange,
  allowCreate,
}: {
  roles: Role[] | undefined;
  value: string;
  onChange: (value: string) => void;
  allowCreate?: boolean;
}) {
  return (
    <select
      className="text-sm border rounded px-2 py-1"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {(roles || [])
        .slice()
        .sort(sortRolesAsc as any)
        .map((r: any) => (
          <option key={String(r._id)} value={String(r._id)}>
            {r.name} {typeof r.level === "number" ? `(L${r.level})` : ""}
          </option>
        ))}
      {allowCreate && <option value="__add_role__">+ Add role…</option>}
    </select>
  );
}
