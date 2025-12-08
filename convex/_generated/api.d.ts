/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth_api_actions from "../auth/api/actions.js";
import type * as auth_api_migrations from "../auth/api/migrations.js";
import type * as auth_api_mutations from "../auth/api/mutations.js";
import type * as auth_api_queries from "../auth/api/queries.js";
import type * as auth_auth from "../auth/auth.js";
import type * as auth_helpers from "../auth/helpers.js";
import type * as components_registry from "../components/registry.js";
import type * as crons from "../crons.js";
import type * as dev_platformAdmin from "../dev/platformAdmin.js";
import type * as dev_seedFeatures from "../dev/seedFeatures.js";
import type * as features__schema from "../features/_schema.js";
import type * as features_accounting_mutations from "../features/accounting/mutations.js";
import type * as features_accounting_queries from "../features/accounting/queries.js";
import type * as features_ai_actions from "../features/ai/actions.js";
import type * as features_ai_mutations from "../features/ai/mutations.js";
import type * as features_ai_queries from "../features/ai/queries.js";
import type * as features_approvals_mutations from "../features/approvals/mutations.js";
import type * as features_approvals_queries from "../features/approvals/queries.js";
import type * as features_auditLog_queries from "../features/auditLog/queries.js";
import type * as features_bi_mutations from "../features/bi/mutations.js";
import type * as features_bi_queries from "../features/bi/queries.js";
import type * as features_bundles_mutations from "../features/bundles/mutations.js";
import type * as features_calendar_index from "../features/calendar/index.js";
import type * as features_calendar_mutations from "../features/calendar/mutations.js";
import type * as features_calendar_queries from "../features/calendar/queries.js";
import type * as features_calls_index from "../features/calls/index.js";
import type * as features_calls_mutations from "../features/calls/mutations.js";
import type * as features_calls_queries from "../features/calls/queries.js";
import type * as features_chat_conversations from "../features/chat/conversations.js";
import type * as features_chat_messageReactions from "../features/chat/messageReactions.js";
import type * as features_chat_messages from "../features/chat/messages.js";
import type * as features_cms_actions from "../features/cms/actions.js";
import type * as features_cms_mutations from "../features/cms/mutations.js";
import type * as features_cms_queries from "../features/cms/queries.js";
import type * as features_cms_scheduler from "../features/cms/scheduler.js";
import type * as features_cms_lite__generated from "../features/cms_lite/_generated.js";
import type * as features_cms_lite_activityEvents_api_actions from "../features/cms_lite/activityEvents/api/actions.js";
import type * as features_cms_lite_activityEvents_api_mutations from "../features/cms_lite/activityEvents/api/mutations.js";
import type * as features_cms_lite_activityEvents_api_queries from "../features/cms_lite/activityEvents/api/queries.js";
import type * as features_cms_lite_activityEvents_lib_audit from "../features/cms_lite/activityEvents/lib/audit.js";
import type * as features_cms_lite_cart_api_actions from "../features/cms_lite/cart/api/actions.js";
import type * as features_cms_lite_cart_api_mutations from "../features/cms_lite/cart/api/mutations.js";
import type * as features_cms_lite_cart_api_queries from "../features/cms_lite/cart/api/queries.js";
import type * as features_cms_lite_cart_constants from "../features/cms_lite/cart/constants.js";
import type * as features_cms_lite_comments_api_actions from "../features/cms_lite/comments/api/actions.js";
import type * as features_cms_lite_comments_api_mutations from "../features/cms_lite/comments/api/mutations.js";
import type * as features_cms_lite_comments_api_queries from "../features/cms_lite/comments/api/queries.js";
import type * as features_cms_lite_copies_api_actions from "../features/cms_lite/copies/api/actions.js";
import type * as features_cms_lite_copies_api_mutations from "../features/cms_lite/copies/api/mutations.js";
import type * as features_cms_lite_copies_api_queries from "../features/cms_lite/copies/api/queries.js";
import type * as features_cms_lite_currency_api_actions from "../features/cms_lite/currency/api/actions.js";
import type * as features_cms_lite_currency_api_mutations from "../features/cms_lite/currency/api/mutations.js";
import type * as features_cms_lite_currency_api_queries from "../features/cms_lite/currency/api/queries.js";
import type * as features_cms_lite_currency_constants from "../features/cms_lite/currency/constants.js";
import type * as features_cms_lite_features_api_actions from "../features/cms_lite/features/api/actions.js";
import type * as features_cms_lite_features_api_mutations from "../features/cms_lite/features/api/mutations.js";
import type * as features_cms_lite_features_api_queries from "../features/cms_lite/features/api/queries.js";
import type * as features_cms_lite_landing_api_actions from "../features/cms_lite/landing/api/actions.js";
import type * as features_cms_lite_landing_api_mutations from "../features/cms_lite/landing/api/mutations.js";
import type * as features_cms_lite_landing_api_queries from "../features/cms_lite/landing/api/queries.js";
import type * as features_cms_lite_navigation_api_actions from "../features/cms_lite/navigation/api/actions.js";
import type * as features_cms_lite_navigation_api_mutations from "../features/cms_lite/navigation/api/mutations.js";
import type * as features_cms_lite_navigation_api_queries from "../features/cms_lite/navigation/api/queries.js";
import type * as features_cms_lite_navigation_types from "../features/cms_lite/navigation/types.js";
import type * as features_cms_lite_pages_api_internalMutations from "../features/cms_lite/pages/api/internalMutations.js";
import type * as features_cms_lite_pages_api_mutations from "../features/cms_lite/pages/api/mutations.js";
import type * as features_cms_lite_pages_api_queries from "../features/cms_lite/pages/api/queries.js";
import type * as features_cms_lite_permissions_api_queries from "../features/cms_lite/permissions/api/queries.js";
import type * as features_cms_lite_portfolio_api_mutations from "../features/cms_lite/portfolio/api/mutations.js";
import type * as features_cms_lite_portfolio_api_queries from "../features/cms_lite/portfolio/api/queries.js";
import type * as features_cms_lite_posts_api_mutations from "../features/cms_lite/posts/api/mutations.js";
import type * as features_cms_lite_posts_api_queries from "../features/cms_lite/posts/api/queries.js";
import type * as features_cms_lite_products_api_mutations from "../features/cms_lite/products/api/mutations.js";
import type * as features_cms_lite_products_api_queries from "../features/cms_lite/products/api/queries.js";
import type * as features_cms_lite_queries from "../features/cms_lite/queries.js";
import type * as features_cms_lite_quicklinks_api_mutations from "../features/cms_lite/quicklinks/api/mutations.js";
import type * as features_cms_lite_quicklinks_api_queries from "../features/cms_lite/quicklinks/api/queries.js";
import type * as features_cms_lite_services_api_actions from "../features/cms_lite/services/api/actions.js";
import type * as features_cms_lite_services_api_mutations from "../features/cms_lite/services/api/mutations.js";
import type * as features_cms_lite_services_api_queries from "../features/cms_lite/services/api/queries.js";
import type * as features_cms_lite_settings_api_actions from "../features/cms_lite/settings/api/actions.js";
import type * as features_cms_lite_settings_api_mutations from "../features/cms_lite/settings/api/mutations.js";
import type * as features_cms_lite_settings_api_queries from "../features/cms_lite/settings/api/queries.js";
import type * as features_cms_lite_shared_audit from "../features/cms_lite/shared/audit.js";
import type * as features_cms_lite_shared_auth from "../features/cms_lite/shared/auth.js";
import type * as features_cms_lite_storage_api_actions from "../features/cms_lite/storage/api/actions.js";
import type * as features_cms_lite_storage_api_mutations from "../features/cms_lite/storage/api/mutations.js";
import type * as features_cms_lite_storage_api_queries from "../features/cms_lite/storage/api/queries.js";
import type * as features_cms_lite_users_api_actions from "../features/cms_lite/users/api/actions.js";
import type * as features_cms_lite_users_api_mutations from "../features/cms_lite/users/api/mutations.js";
import type * as features_cms_lite_users_api_queries from "../features/cms_lite/users/api/queries.js";
import type * as features_cms_lite_website_settings_api_mutations from "../features/cms_lite/website_settings/api/mutations.js";
import type * as features_cms_lite_website_settings_api_queries from "../features/cms_lite/website_settings/api/queries.js";
import type * as features_cms_lite_wishlist_api_actions from "../features/cms_lite/wishlist/api/actions.js";
import type * as features_cms_lite_wishlist_api_mutations from "../features/cms_lite/wishlist/api/mutations.js";
import type * as features_cms_lite_wishlist_api_queries from "../features/cms_lite/wishlist/api/queries.js";
import type * as features_comments_index from "../features/comments/index.js";
import type * as features_comments_mutations from "../features/comments/mutations.js";
import type * as features_comments_queries from "../features/comments/queries.js";
import type * as features_contacts_mutations from "../features/contacts/mutations.js";
import type * as features_contacts_queries from "../features/contacts/queries.js";
import type * as features_crm_index from "../features/crm/index.js";
import type * as features_crm_mutations from "../features/crm/mutations.js";
import type * as features_crm_queries from "../features/crm/queries.js";
import type * as features_custom_admin from "../features/custom/admin.js";
import type * as features_database__mutations_createUniversal from "../features/database/_mutations/createUniversal.js";
import type * as features_database__mutations_updateUniversal from "../features/database/_mutations/updateUniversal.js";
import type * as features_database__queries_getUniversal from "../features/database/_queries/getUniversal.js";
import type * as features_database__queries_listUniversal from "../features/database/_queries/listUniversal.js";
import type * as features_database_changeType from "../features/database/changeType.js";
import type * as features_database_databases from "../features/database/databases.js";
import type * as features_database_fields from "../features/database/fields.js";
import type * as features_database_fixTableNames from "../features/database/fixTableNames.js";
import type * as features_database_index from "../features/database/index.js";
import type * as features_database_mutations from "../features/database/mutations.js";
import type * as features_database_queries from "../features/database/queries.js";
import type * as features_database_rows from "../features/database/rows.js";
import type * as features_database_tables from "../features/database/tables.js";
import type * as features_database_transformations from "../features/database/transformations.js";
import type * as features_database_utils from "../features/database/utils.js";
import type * as features_docs_documents from "../features/docs/documents.js";
import type * as features_docs_presence from "../features/docs/presence.js";
import type * as features_docs_prosemirror from "../features/docs/prosemirror.js";
import type * as features_forms_mutations from "../features/forms/mutations.js";
import type * as features_forms_queries from "../features/forms/queries.js";
import type * as features_hr_mutations from "../features/hr/mutations.js";
import type * as features_hr_queries from "../features/hr/queries.js";
import type * as features_importExport_mutations from "../features/importExport/mutations.js";
import type * as features_importExport_queries from "../features/importExport/queries.js";
import type * as features_integrations_mutations from "../features/integrations/mutations.js";
import type * as features_integrations_queries from "../features/integrations/queries.js";
import type * as features_knowledge_api_knowledgeForAI from "../features/knowledge/api/knowledgeForAI.js";
import type * as features_knowledge_api_workspaceContext from "../features/knowledge/api/workspaceContext.js";
import type * as features_knowledge_index from "../features/knowledge/index.js";
import type * as features_lib_audit from "../features/lib/audit.js";
import type * as features_lib_rbac from "../features/lib/rbac.js";
import type * as features_marketing_mutations from "../features/marketing/mutations.js";
import type * as features_marketing_queries from "../features/marketing/queries.js";
import type * as features_menus_itemComponents from "../features/menus/itemComponents.js";
import type * as features_menus_menuItems from "../features/menus/menuItems.js";
import type * as features_menus_menu_manifest_data from "../features/menus/menu_manifest_data.js";
import type * as features_menus_menus from "../features/menus/menus.js";
import type * as features_menus_optional_features_catalog from "../features/menus/optional_features_catalog.js";
import type * as features_menus_sets from "../features/menus/sets.js";
import type * as features_notifications_index from "../features/notifications/index.js";
import type * as features_notifications_mutations from "../features/notifications/mutations.js";
import type * as features_notifications_queries from "../features/notifications/queries.js";
import type * as features_pos_mutations from "../features/pos/mutations.js";
import type * as features_pos_queries from "../features/pos/queries.js";
import type * as features_projects_index from "../features/projects/index.js";
import type * as features_projects_mutations from "../features/projects/mutations.js";
import type * as features_projects_queries from "../features/projects/queries.js";
import type * as features_reports_index from "../features/reports/index.js";
import type * as features_reports_mutations from "../features/reports/mutations.js";
import type * as features_reports_queries from "../features/reports/queries.js";
import type * as features_search_mutations from "../features/search/mutations.js";
import type * as features_search_queries from "../features/search/queries.js";
import type * as features_status_index from "../features/status/index.js";
import type * as features_status_mutations from "../features/status/mutations.js";
import type * as features_status_queries from "../features/status/queries.js";
import type * as features_support_index from "../features/support/index.js";
import type * as features_support_mutations from "../features/support/mutations.js";
import type * as features_support_queries from "../features/support/queries.js";
import type * as features_system_admin from "../features/system/admin.js";
import type * as features_tags_mutations from "../features/tags/mutations.js";
import type * as features_tags_queries from "../features/tags/queries.js";
import type * as features_tasks_index from "../features/tasks/index.js";
import type * as features_tasks_mutations from "../features/tasks/mutations.js";
import type * as features_tasks_queries from "../features/tasks/queries.js";
import type * as features_userManagement_api_mutations from "../features/userManagement/api/mutations.js";
import type * as features_userManagement_api_queries from "../features/userManagement/api/queries.js";
import type * as features_userManagement_index from "../features/userManagement/index.js";
import type * as features_wiki_index from "../features/wiki/index.js";
import type * as features_wiki_mutations from "../features/wiki/mutations.js";
import type * as features_wiki_queries from "../features/wiki/queries.js";
import type * as features_workflows_index from "../features/workflows/index.js";
import type * as features_workflows_mutations from "../features/workflows/mutations.js";
import type * as features_workflows_queries from "../features/workflows/queries.js";
import type * as http from "../http.js";
import type * as lib_audit_logger from "../lib/audit/logger.js";
import type * as lib_converters_databaseConverter from "../lib/converters/databaseConverter.js";
import type * as lib_converters_index from "../lib/converters/index.js";
import type * as lib_filters from "../lib/filters.js";
import type * as lib_platformAdmin from "../lib/platformAdmin.js";
import type * as lib_rbac_permissions from "../lib/rbac/permissions.js";
import type * as lib_utils from "../lib/utils.js";
import type * as payment_paymentAttemptTypes from "../payment/paymentAttemptTypes.js";
import type * as payment_paymentAttempts from "../payment/paymentAttempts.js";
import type * as router from "../router.js";
import type * as shared_activity_feed from "../shared/activity/feed.js";
import type * as shared_attachments_attachments from "../shared/attachments/attachments.js";
import type * as shared_audit from "../shared/audit.js";
import type * as shared_auth from "../shared/auth.js";
import type * as shared_automation_engine from "../shared/automation/engine.js";
import type * as shared_automation_rules from "../shared/automation/rules.js";
import type * as shared_bulk_operations from "../shared/bulk/operations.js";
import type * as shared_comments_comments from "../shared/comments/comments.js";
import type * as shared_customFields_fields from "../shared/customFields/fields.js";
import type * as shared_favorites_favorites from "../shared/favorites/favorites.js";
import type * as shared_search_search from "../shared/search/search.js";
import type * as shared_storage from "../shared/storage.js";
import type * as user_friends from "../user/friends.js";
import type * as user_memberActions from "../user/memberActions.js";
import type * as user_users from "../user/users.js";
import type * as workspace_activity from "../workspace/activity.js";
import type * as workspace_debug from "../workspace/debug.js";
import type * as workspace_health from "../workspace/health.js";
import type * as workspace_hierarchy from "../workspace/hierarchy.js";
import type * as workspace_invitations from "../workspace/invitations.js";
import type * as workspace_notifications from "../workspace/notifications.js";
import type * as workspace_overview from "../workspace/overview.js";
import type * as workspace_permissions from "../workspace/permissions.js";
import type * as workspace_roleMenuPermissions from "../workspace/roleMenuPermissions.js";
import type * as workspace_roles from "../workspace/roles.js";
import type * as workspace_search from "../workspace/search.js";
import type * as workspace_settings from "../workspace/settings.js";
import type * as workspace_workspaces from "../workspace/workspaces.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "auth/api/actions": typeof auth_api_actions;
  "auth/api/migrations": typeof auth_api_migrations;
  "auth/api/mutations": typeof auth_api_mutations;
  "auth/api/queries": typeof auth_api_queries;
  "auth/auth": typeof auth_auth;
  "auth/helpers": typeof auth_helpers;
  "components/registry": typeof components_registry;
  crons: typeof crons;
  "dev/platformAdmin": typeof dev_platformAdmin;
  "dev/seedFeatures": typeof dev_seedFeatures;
  "features/_schema": typeof features__schema;
  "features/accounting/mutations": typeof features_accounting_mutations;
  "features/accounting/queries": typeof features_accounting_queries;
  "features/ai/actions": typeof features_ai_actions;
  "features/ai/mutations": typeof features_ai_mutations;
  "features/ai/queries": typeof features_ai_queries;
  "features/approvals/mutations": typeof features_approvals_mutations;
  "features/approvals/queries": typeof features_approvals_queries;
  "features/auditLog/queries": typeof features_auditLog_queries;
  "features/bi/mutations": typeof features_bi_mutations;
  "features/bi/queries": typeof features_bi_queries;
  "features/bundles/mutations": typeof features_bundles_mutations;
  "features/calendar/index": typeof features_calendar_index;
  "features/calendar/mutations": typeof features_calendar_mutations;
  "features/calendar/queries": typeof features_calendar_queries;
  "features/calls/index": typeof features_calls_index;
  "features/calls/mutations": typeof features_calls_mutations;
  "features/calls/queries": typeof features_calls_queries;
  "features/chat/conversations": typeof features_chat_conversations;
  "features/chat/messageReactions": typeof features_chat_messageReactions;
  "features/chat/messages": typeof features_chat_messages;
  "features/cms/actions": typeof features_cms_actions;
  "features/cms/mutations": typeof features_cms_mutations;
  "features/cms/queries": typeof features_cms_queries;
  "features/cms/scheduler": typeof features_cms_scheduler;
  "features/cms_lite/_generated": typeof features_cms_lite__generated;
  "features/cms_lite/activityEvents/api/actions": typeof features_cms_lite_activityEvents_api_actions;
  "features/cms_lite/activityEvents/api/mutations": typeof features_cms_lite_activityEvents_api_mutations;
  "features/cms_lite/activityEvents/api/queries": typeof features_cms_lite_activityEvents_api_queries;
  "features/cms_lite/activityEvents/lib/audit": typeof features_cms_lite_activityEvents_lib_audit;
  "features/cms_lite/cart/api/actions": typeof features_cms_lite_cart_api_actions;
  "features/cms_lite/cart/api/mutations": typeof features_cms_lite_cart_api_mutations;
  "features/cms_lite/cart/api/queries": typeof features_cms_lite_cart_api_queries;
  "features/cms_lite/cart/constants": typeof features_cms_lite_cart_constants;
  "features/cms_lite/comments/api/actions": typeof features_cms_lite_comments_api_actions;
  "features/cms_lite/comments/api/mutations": typeof features_cms_lite_comments_api_mutations;
  "features/cms_lite/comments/api/queries": typeof features_cms_lite_comments_api_queries;
  "features/cms_lite/copies/api/actions": typeof features_cms_lite_copies_api_actions;
  "features/cms_lite/copies/api/mutations": typeof features_cms_lite_copies_api_mutations;
  "features/cms_lite/copies/api/queries": typeof features_cms_lite_copies_api_queries;
  "features/cms_lite/currency/api/actions": typeof features_cms_lite_currency_api_actions;
  "features/cms_lite/currency/api/mutations": typeof features_cms_lite_currency_api_mutations;
  "features/cms_lite/currency/api/queries": typeof features_cms_lite_currency_api_queries;
  "features/cms_lite/currency/constants": typeof features_cms_lite_currency_constants;
  "features/cms_lite/features/api/actions": typeof features_cms_lite_features_api_actions;
  "features/cms_lite/features/api/mutations": typeof features_cms_lite_features_api_mutations;
  "features/cms_lite/features/api/queries": typeof features_cms_lite_features_api_queries;
  "features/cms_lite/landing/api/actions": typeof features_cms_lite_landing_api_actions;
  "features/cms_lite/landing/api/mutations": typeof features_cms_lite_landing_api_mutations;
  "features/cms_lite/landing/api/queries": typeof features_cms_lite_landing_api_queries;
  "features/cms_lite/navigation/api/actions": typeof features_cms_lite_navigation_api_actions;
  "features/cms_lite/navigation/api/mutations": typeof features_cms_lite_navigation_api_mutations;
  "features/cms_lite/navigation/api/queries": typeof features_cms_lite_navigation_api_queries;
  "features/cms_lite/navigation/types": typeof features_cms_lite_navigation_types;
  "features/cms_lite/pages/api/internalMutations": typeof features_cms_lite_pages_api_internalMutations;
  "features/cms_lite/pages/api/mutations": typeof features_cms_lite_pages_api_mutations;
  "features/cms_lite/pages/api/queries": typeof features_cms_lite_pages_api_queries;
  "features/cms_lite/permissions/api/queries": typeof features_cms_lite_permissions_api_queries;
  "features/cms_lite/portfolio/api/mutations": typeof features_cms_lite_portfolio_api_mutations;
  "features/cms_lite/portfolio/api/queries": typeof features_cms_lite_portfolio_api_queries;
  "features/cms_lite/posts/api/mutations": typeof features_cms_lite_posts_api_mutations;
  "features/cms_lite/posts/api/queries": typeof features_cms_lite_posts_api_queries;
  "features/cms_lite/products/api/mutations": typeof features_cms_lite_products_api_mutations;
  "features/cms_lite/products/api/queries": typeof features_cms_lite_products_api_queries;
  "features/cms_lite/queries": typeof features_cms_lite_queries;
  "features/cms_lite/quicklinks/api/mutations": typeof features_cms_lite_quicklinks_api_mutations;
  "features/cms_lite/quicklinks/api/queries": typeof features_cms_lite_quicklinks_api_queries;
  "features/cms_lite/services/api/actions": typeof features_cms_lite_services_api_actions;
  "features/cms_lite/services/api/mutations": typeof features_cms_lite_services_api_mutations;
  "features/cms_lite/services/api/queries": typeof features_cms_lite_services_api_queries;
  "features/cms_lite/settings/api/actions": typeof features_cms_lite_settings_api_actions;
  "features/cms_lite/settings/api/mutations": typeof features_cms_lite_settings_api_mutations;
  "features/cms_lite/settings/api/queries": typeof features_cms_lite_settings_api_queries;
  "features/cms_lite/shared/audit": typeof features_cms_lite_shared_audit;
  "features/cms_lite/shared/auth": typeof features_cms_lite_shared_auth;
  "features/cms_lite/storage/api/actions": typeof features_cms_lite_storage_api_actions;
  "features/cms_lite/storage/api/mutations": typeof features_cms_lite_storage_api_mutations;
  "features/cms_lite/storage/api/queries": typeof features_cms_lite_storage_api_queries;
  "features/cms_lite/users/api/actions": typeof features_cms_lite_users_api_actions;
  "features/cms_lite/users/api/mutations": typeof features_cms_lite_users_api_mutations;
  "features/cms_lite/users/api/queries": typeof features_cms_lite_users_api_queries;
  "features/cms_lite/website_settings/api/mutations": typeof features_cms_lite_website_settings_api_mutations;
  "features/cms_lite/website_settings/api/queries": typeof features_cms_lite_website_settings_api_queries;
  "features/cms_lite/wishlist/api/actions": typeof features_cms_lite_wishlist_api_actions;
  "features/cms_lite/wishlist/api/mutations": typeof features_cms_lite_wishlist_api_mutations;
  "features/cms_lite/wishlist/api/queries": typeof features_cms_lite_wishlist_api_queries;
  "features/comments/index": typeof features_comments_index;
  "features/comments/mutations": typeof features_comments_mutations;
  "features/comments/queries": typeof features_comments_queries;
  "features/contacts/mutations": typeof features_contacts_mutations;
  "features/contacts/queries": typeof features_contacts_queries;
  "features/crm/index": typeof features_crm_index;
  "features/crm/mutations": typeof features_crm_mutations;
  "features/crm/queries": typeof features_crm_queries;
  "features/custom/admin": typeof features_custom_admin;
  "features/database/_mutations/createUniversal": typeof features_database__mutations_createUniversal;
  "features/database/_mutations/updateUniversal": typeof features_database__mutations_updateUniversal;
  "features/database/_queries/getUniversal": typeof features_database__queries_getUniversal;
  "features/database/_queries/listUniversal": typeof features_database__queries_listUniversal;
  "features/database/changeType": typeof features_database_changeType;
  "features/database/databases": typeof features_database_databases;
  "features/database/fields": typeof features_database_fields;
  "features/database/fixTableNames": typeof features_database_fixTableNames;
  "features/database/index": typeof features_database_index;
  "features/database/mutations": typeof features_database_mutations;
  "features/database/queries": typeof features_database_queries;
  "features/database/rows": typeof features_database_rows;
  "features/database/tables": typeof features_database_tables;
  "features/database/transformations": typeof features_database_transformations;
  "features/database/utils": typeof features_database_utils;
  "features/docs/documents": typeof features_docs_documents;
  "features/docs/presence": typeof features_docs_presence;
  "features/docs/prosemirror": typeof features_docs_prosemirror;
  "features/forms/mutations": typeof features_forms_mutations;
  "features/forms/queries": typeof features_forms_queries;
  "features/hr/mutations": typeof features_hr_mutations;
  "features/hr/queries": typeof features_hr_queries;
  "features/importExport/mutations": typeof features_importExport_mutations;
  "features/importExport/queries": typeof features_importExport_queries;
  "features/integrations/mutations": typeof features_integrations_mutations;
  "features/integrations/queries": typeof features_integrations_queries;
  "features/knowledge/api/knowledgeForAI": typeof features_knowledge_api_knowledgeForAI;
  "features/knowledge/api/workspaceContext": typeof features_knowledge_api_workspaceContext;
  "features/knowledge/index": typeof features_knowledge_index;
  "features/lib/audit": typeof features_lib_audit;
  "features/lib/rbac": typeof features_lib_rbac;
  "features/marketing/mutations": typeof features_marketing_mutations;
  "features/marketing/queries": typeof features_marketing_queries;
  "features/menus/itemComponents": typeof features_menus_itemComponents;
  "features/menus/menuItems": typeof features_menus_menuItems;
  "features/menus/menu_manifest_data": typeof features_menus_menu_manifest_data;
  "features/menus/menus": typeof features_menus_menus;
  "features/menus/optional_features_catalog": typeof features_menus_optional_features_catalog;
  "features/menus/sets": typeof features_menus_sets;
  "features/notifications/index": typeof features_notifications_index;
  "features/notifications/mutations": typeof features_notifications_mutations;
  "features/notifications/queries": typeof features_notifications_queries;
  "features/pos/mutations": typeof features_pos_mutations;
  "features/pos/queries": typeof features_pos_queries;
  "features/projects/index": typeof features_projects_index;
  "features/projects/mutations": typeof features_projects_mutations;
  "features/projects/queries": typeof features_projects_queries;
  "features/reports/index": typeof features_reports_index;
  "features/reports/mutations": typeof features_reports_mutations;
  "features/reports/queries": typeof features_reports_queries;
  "features/search/mutations": typeof features_search_mutations;
  "features/search/queries": typeof features_search_queries;
  "features/status/index": typeof features_status_index;
  "features/status/mutations": typeof features_status_mutations;
  "features/status/queries": typeof features_status_queries;
  "features/support/index": typeof features_support_index;
  "features/support/mutations": typeof features_support_mutations;
  "features/support/queries": typeof features_support_queries;
  "features/system/admin": typeof features_system_admin;
  "features/tags/mutations": typeof features_tags_mutations;
  "features/tags/queries": typeof features_tags_queries;
  "features/tasks/index": typeof features_tasks_index;
  "features/tasks/mutations": typeof features_tasks_mutations;
  "features/tasks/queries": typeof features_tasks_queries;
  "features/userManagement/api/mutations": typeof features_userManagement_api_mutations;
  "features/userManagement/api/queries": typeof features_userManagement_api_queries;
  "features/userManagement/index": typeof features_userManagement_index;
  "features/wiki/index": typeof features_wiki_index;
  "features/wiki/mutations": typeof features_wiki_mutations;
  "features/wiki/queries": typeof features_wiki_queries;
  "features/workflows/index": typeof features_workflows_index;
  "features/workflows/mutations": typeof features_workflows_mutations;
  "features/workflows/queries": typeof features_workflows_queries;
  http: typeof http;
  "lib/audit/logger": typeof lib_audit_logger;
  "lib/converters/databaseConverter": typeof lib_converters_databaseConverter;
  "lib/converters/index": typeof lib_converters_index;
  "lib/filters": typeof lib_filters;
  "lib/platformAdmin": typeof lib_platformAdmin;
  "lib/rbac/permissions": typeof lib_rbac_permissions;
  "lib/utils": typeof lib_utils;
  "payment/paymentAttemptTypes": typeof payment_paymentAttemptTypes;
  "payment/paymentAttempts": typeof payment_paymentAttempts;
  router: typeof router;
  "shared/activity/feed": typeof shared_activity_feed;
  "shared/attachments/attachments": typeof shared_attachments_attachments;
  "shared/audit": typeof shared_audit;
  "shared/auth": typeof shared_auth;
  "shared/automation/engine": typeof shared_automation_engine;
  "shared/automation/rules": typeof shared_automation_rules;
  "shared/bulk/operations": typeof shared_bulk_operations;
  "shared/comments/comments": typeof shared_comments_comments;
  "shared/customFields/fields": typeof shared_customFields_fields;
  "shared/favorites/favorites": typeof shared_favorites_favorites;
  "shared/search/search": typeof shared_search_search;
  "shared/storage": typeof shared_storage;
  "user/friends": typeof user_friends;
  "user/memberActions": typeof user_memberActions;
  "user/users": typeof user_users;
  "workspace/activity": typeof workspace_activity;
  "workspace/debug": typeof workspace_debug;
  "workspace/health": typeof workspace_health;
  "workspace/hierarchy": typeof workspace_hierarchy;
  "workspace/invitations": typeof workspace_invitations;
  "workspace/notifications": typeof workspace_notifications;
  "workspace/overview": typeof workspace_overview;
  "workspace/permissions": typeof workspace_permissions;
  "workspace/roleMenuPermissions": typeof workspace_roleMenuPermissions;
  "workspace/roles": typeof workspace_roles;
  "workspace/search": typeof workspace_search;
  "workspace/settings": typeof workspace_settings;
  "workspace/workspaces": typeof workspace_workspaces;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {
  presence: {
    public: {
      disconnect: FunctionReference<
        "mutation",
        "internal",
        { sessionToken: string },
        null
      >;
      heartbeat: FunctionReference<
        "mutation",
        "internal",
        {
          interval?: number;
          roomId: string;
          sessionId: string;
          userId: string;
        },
        { roomToken: string; sessionToken: string }
      >;
      list: FunctionReference<
        "query",
        "internal",
        { limit?: number; roomToken: string },
        Array<{ lastDisconnected: number; online: boolean; userId: string }>
      >;
      listRoom: FunctionReference<
        "query",
        "internal",
        { limit?: number; onlineOnly?: boolean; roomId: string },
        Array<{ lastDisconnected: number; online: boolean; userId: string }>
      >;
      listUser: FunctionReference<
        "query",
        "internal",
        { limit?: number; onlineOnly?: boolean; userId: string },
        Array<{ lastDisconnected: number; online: boolean; roomId: string }>
      >;
      removeRoom: FunctionReference<
        "mutation",
        "internal",
        { roomId: string },
        null
      >;
      removeRoomUser: FunctionReference<
        "mutation",
        "internal",
        { roomId: string; userId: string },
        null
      >;
    };
  };
  prosemirrorSync: {
    lib: {
      deleteDocument: FunctionReference<
        "mutation",
        "internal",
        { id: string },
        null
      >;
      deleteSnapshots: FunctionReference<
        "mutation",
        "internal",
        { afterVersion?: number; beforeVersion?: number; id: string },
        null
      >;
      deleteSteps: FunctionReference<
        "mutation",
        "internal",
        {
          afterVersion?: number;
          beforeTs: number;
          deleteNewerThanLatestSnapshot?: boolean;
          id: string;
        },
        null
      >;
      getSnapshot: FunctionReference<
        "query",
        "internal",
        { id: string; version?: number },
        { content: null } | { content: string; version: number }
      >;
      getSteps: FunctionReference<
        "query",
        "internal",
        { id: string; version: number },
        {
          clientIds: Array<string | number>;
          steps: Array<string>;
          version: number;
        }
      >;
      latestVersion: FunctionReference<
        "query",
        "internal",
        { id: string },
        null | number
      >;
      submitSnapshot: FunctionReference<
        "mutation",
        "internal",
        {
          content: string;
          id: string;
          pruneSnapshots?: boolean;
          version: number;
        },
        null
      >;
      submitSteps: FunctionReference<
        "mutation",
        "internal",
        {
          clientId: string | number;
          id: string;
          steps: Array<string>;
          version: number;
        },
        | {
            clientIds: Array<string | number>;
            status: "needs-rebase";
            steps: Array<string>;
          }
        | { status: "synced" }
      >;
    };
  };
};
