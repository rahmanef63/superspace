import type { Role } from "../types";

export const sortRolesAsc = (a: Role, b: Role) => (a.level ?? 999) - (b.level ?? 999);
