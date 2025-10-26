// Centralized permission constants (SSOT)
// Use these everywhere instead of ad-hoc strings.

export const PERMS = {
  MANAGE_WORKSPACE: "manage_workspace",
  MANAGE_MEMBERS: "manage_members",
  INVITE_MEMBERS: "invite_members",
  MANAGE_ROLES: "manage_roles",
  MANAGE_MENUS: "manage_menus",
  MANAGE_INVITATIONS: "manage_invitations",

  DOCUMENTS_CREATE: "documents.create",
  DOCUMENTS_EDIT: "documents.edit",
  DOCUMENTS_DELETE: "documents.delete",
  DOCUMENTS_MANAGE: "documents.manage",
  DOCUMENTS_UPDATE: "documents.update",
  DOCUMENTS_PUBLISH: "documents.publish",

  // CMS Permissions
  SCHEMAS_CREATE: "schemas.create",
  SCHEMAS_UPDATE: "schemas.update",
  SCHEMAS_DELETE: "schemas.delete",
  SCHEMAS_MANAGE: "schemas.manage",

  ASSETS_UPLOAD: "assets.upload",
  ASSETS_DELETE: "assets.delete",
  ASSETS_MANAGE: "assets.manage",

  CREATE_CONVERSATIONS: "create_conversations",
  MANAGE_CONVERSATIONS: "manage_conversations",

  VIEW_WORKSPACE: "view_workspace",
} as const;

export type Permission = (typeof PERMS)[keyof typeof PERMS];

// Legacy alias for compatibility
export const PERMISSIONS = PERMS;
