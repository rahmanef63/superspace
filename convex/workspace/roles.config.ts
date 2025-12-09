import { PERMS } from "./permissions";

type WorkspacePermission = (typeof PERMS)[keyof typeof PERMS] | "*";

export type RoleTemplate = {
  slug: "owner" | "admin" | "manager" | "staff" | "client" | "guest";
  name: string;
  description: string;
  color: string;
  level: number;
  isDefault: boolean;
  workspacePermissions: readonly WorkspacePermission[];
  cmsPermissions: readonly string[];
};

export const ROLE_TEMPLATES: readonly RoleTemplate[] = [
  {
    slug: "owner",
    name: "Owner",
    description: "Workspace owner (super admin)",
    color: "#111827",
    level: 0,
    isDefault: false,
    workspacePermissions: ["*"],
    cmsPermissions: [
      "system.admin",
      "system.manage_users",
      "workspace.manage",
      "workspace.invite_members",
      "content.create",
      "content.edit",
      "content.publish",
      "content.delete",
      "features.manage",
      "features.install",
      "users.view",
      "users.manage",
      "settings.view",
      "settings.manage",
      "navigation.manage",
      "storage.upload",
      "storage.manage",
      "storage.view",
      "cart.use",
      "cart.checkout",
      "currency.manage",
      "currency.update_rates",
      "wishlist:manage",
    ],
  },
  {
    slug: "admin",
    name: "Admin",
    description: "Full access except system-level actions",
    color: "#dc2626",
    level: 10,
    isDefault: false,
    workspacePermissions: [
      PERMS.MANAGE_WORKSPACE,
      PERMS.MANAGE_MEMBERS,
      PERMS.INVITE_MEMBERS,
      PERMS.MANAGE_ROLES,
      PERMS.MANAGE_MENUS,
      PERMS.DOCUMENTS_CREATE,
      PERMS.DOCUMENTS_EDIT,
      PERMS.DOCUMENTS_DELETE,
      PERMS.DOCUMENTS_MANAGE,
      PERMS.CREATE_CONVERSATIONS,
      PERMS.MANAGE_CONVERSATIONS,
      PERMS.VIEW_WORKSPACE,
      PERMS.COMMUNICATIONS_VIEW,
    ],
    cmsPermissions: [
      "system.manage_users",
      "workspace.manage",
      "workspace.invite_members",
      "content.create",
      "content.edit",
      "content.publish",
      "content.delete",
      "features.manage",
      "features.install",
      "users.view",
      "users.manage",
      "settings.view",
      "settings.manage",
      "navigation.manage",
      "storage.upload",
      "storage.manage",
      "storage.view",
      "cart.use",
      "cart.checkout",
      "currency.manage",
      "currency.update_rates",
      "wishlist:manage",
    ],
  },
  {
    slug: "manager",
    name: "Manager",
    description: "Manage content and conversations",
    color: "#2563eb",
    level: 30,
    isDefault: false,
    workspacePermissions: [
      PERMS.DOCUMENTS_CREATE,
      PERMS.DOCUMENTS_EDIT,
      PERMS.CREATE_CONVERSATIONS,
      PERMS.MANAGE_CONVERSATIONS,
      PERMS.VIEW_WORKSPACE,
      PERMS.COMMUNICATIONS_VIEW,
    ],
    cmsPermissions: [
      "workspace.manage",
      "workspace.invite_members",
      "content.create",
      "content.edit",
      "content.publish",
      "features.manage",
      "settings.view",
      "navigation.manage",
      "storage.upload",
      "storage.manage",
      "storage.view",
      "cart.use",
      "currency.manage",
      "currency.update_rates",
      "wishlist:manage",
    ],
  },
  {
    slug: "staff",
    name: "Staff",
    description: "Contribute content and chat",
    color: "#10b981",
    level: 50,
    isDefault: false,
    workspacePermissions: [
      PERMS.DOCUMENTS_CREATE,
      PERMS.DOCUMENTS_EDIT,
      PERMS.CREATE_CONVERSATIONS,
      PERMS.VIEW_WORKSPACE,
      PERMS.COMMUNICATIONS_VIEW,
    ],
    cmsPermissions: [
      "content.create",
      "content.edit",
      "settings.view",
      "navigation.manage",
      "storage.upload",
      "storage.view",
      "cart.use",
      "wishlist:manage",
    ],
  },
  {
    slug: "client",
    name: "Client",
    description: "Limited access; cannot view member list",
    color: "#6b7280",
    level: 70,
    isDefault: true,
    workspacePermissions: [PERMS.CREATE_CONVERSATIONS, PERMS.VIEW_WORKSPACE, PERMS.COMMUNICATIONS_VIEW],
    cmsPermissions: ["settings.view", "storage.view", "cart.use"],
  },
  {
    slug: "guest",
    name: "Guest",
    description: "Read-only viewer",
    color: "#9ca3af",
    level: 90,
    isDefault: false,
    workspacePermissions: [PERMS.VIEW_WORKSPACE],
    cmsPermissions: ["settings.view"],
  },
] as const;

export const ROLE_TEMPLATE_MAP = new Map(
  ROLE_TEMPLATES.map((template) => [template.slug, template]),
);

export const CMS_ROLE_PERMISSIONS = ROLE_TEMPLATES.reduce(
  (acc, template) => {
    acc[template.slug] = template.cmsPermissions;
    return acc;
  },
  {} as Record<RoleTemplate["slug"], readonly string[]>,
) as Readonly<Record<RoleTemplate["slug"], readonly string[]>>;

