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
  COMMUNICATIONS_VIEW: "communications.view",
  COMMUNICATIONS_MANAGE: "communications.manage",

  // Content
  CONTENT_VIEW: "content.view",
  CONTENT_MANAGE: "content.manage",

  // Database Permissions
  DATABASE_READ: "database.read",
  DATABASE_CREATE: "database.create",
  DATABASE_UPDATE: "database.update",
  DATABASE_DELETE: "database.delete",
  DATABASE_MANAGE: "database.manage",

  // CRM
  CRM_VIEW: "crm.view",
  CRM_MANAGE: "crm.manage",

  // Tasks
  TASKS_VIEW: "tasks.view",
  TASKS_MANAGE: "tasks.manage",

  // Projects
  PROJECTS_VIEW: "projects.view",
  PROJECTS_MANAGE: "projects.manage",

  // Accounting
  ACCOUNTING_VIEW: "accounting.view",
  ACCOUNTING_MANAGE: "accounting.manage",

  // HR
  HR_VIEW: "hr.view",
  HR_MANAGE: "hr.manage",

  // Sales
  SALES_VIEW: "sales.view",
  SALES_MANAGE: "sales.manage",

  // Marketing
  MARKETING_VIEW: "marketing.view",
  MARKETING_MANAGE: "marketing.manage",

  // Automation
  AUTOMATION_VIEW: "automation.view",
  AUTOMATION_MANAGE: "automation.manage",

  // Analytics
  ANALYTICS_VIEW: "analytics.view",
  ANALYTICS_MANAGE: "analytics.manage",

  // Approvals
  APPROVALS_VIEW: "approvals.view",
  APPROVALS_MANAGE: "approvals.manage",

  // Inventory
  INVENTORY_VIEW: "inventory.view",
  INVENTORY_MANAGE: "inventory.manage",
} as const;

export type Permission = (typeof PERMS)[keyof typeof PERMS];

// Legacy alias for compatibility
export const PERMISSIONS = PERMS;
