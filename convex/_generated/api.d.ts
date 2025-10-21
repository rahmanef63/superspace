/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth_auth from "../auth/auth.js";
import type * as auth_helpers from "../auth/helpers.js";
import type * as components_registry from "../components/registry.js";
import type * as dev_seedFeatures from "../dev/seedFeatures.js";
import type * as features__schema from "../features/_schema.js";
import type * as features_calendar_index from "../features/calendar/index.js";
import type * as features_calendar_mutations from "../features/calendar/mutations.js";
import type * as features_calendar_queries from "../features/calendar/queries.js";
import type * as features_comments_index from "../features/comments/index.js";
import type * as features_comments_mutations from "../features/comments/mutations.js";
import type * as features_comments_queries from "../features/comments/queries.js";
import type * as features_crm_index from "../features/crm/index.js";
import type * as features_crm_mutations from "../features/crm/mutations.js";
import type * as features_crm_queries from "../features/crm/queries.js";
import type * as features_database_databases from "../features/database/databases.js";
import type * as features_database_index from "../features/database/index.js";
import type * as features_database_mutations from "../features/database/mutations.js";
import type * as features_database_queries from "../features/database/queries.js";
import type * as features_db_fields from "../features/db/fields.js";
import type * as features_db_rows from "../features/db/rows.js";
import type * as features_db_tables from "../features/db/tables.js";
import type * as features_db_utils from "../features/db/utils.js";
import type * as features_notifications_index from "../features/notifications/index.js";
import type * as features_notifications_mutations from "../features/notifications/mutations.js";
import type * as features_notifications_queries from "../features/notifications/queries.js";
import type * as features_projects_index from "../features/projects/index.js";
import type * as features_projects_mutations from "../features/projects/mutations.js";
import type * as features_projects_queries from "../features/projects/queries.js";
import type * as features_reports_index from "../features/reports/index.js";
import type * as features_reports_mutations from "../features/reports/mutations.js";
import type * as features_reports_queries from "../features/reports/queries.js";
import type * as features_support_index from "../features/support/index.js";
import type * as features_support_mutations from "../features/support/mutations.js";
import type * as features_support_queries from "../features/support/queries.js";
import type * as features_tasks_index from "../features/tasks/index.js";
import type * as features_tasks_mutations from "../features/tasks/mutations.js";
import type * as features_tasks_queries from "../features/tasks/queries.js";
import type * as features_wiki_index from "../features/wiki/index.js";
import type * as features_wiki_mutations from "../features/wiki/mutations.js";
import type * as features_wiki_queries from "../features/wiki/queries.js";
import type * as features_workflows_index from "../features/workflows/index.js";
import type * as features_workflows_mutations from "../features/workflows/mutations.js";
import type * as features_workflows_queries from "../features/workflows/queries.js";
import type * as http from "../http.js";
import type * as lib_utils from "../lib/utils.js";
import type * as menu_chat_conversations from "../menu/chat/conversations.js";
import type * as menu_chat_messageReactions from "../menu/chat/messageReactions.js";
import type * as menu_chat_messages from "../menu/chat/messages.js";
import type * as menu_cms_canvas from "../menu/cms/canvas.js";
import type * as menu_page_documents from "../menu/page/documents.js";
import type * as menu_page_presence from "../menu/page/presence.js";
import type * as menu_page_prosemirror from "../menu/page/prosemirror.js";
import type * as menu_store_itemComponents from "../menu/store/itemComponents.js";
import type * as menu_store_menuItems from "../menu/store/menuItems.js";
import type * as menu_store_menu_manifest_data from "../menu/store/menu_manifest_data.js";
import type * as menu_store_menus from "../menu/store/menus.js";
import type * as menu_store_optional_features_catalog from "../menu/store/optional_features_catalog.js";
import type * as menu_store_sets from "../menu/store/sets.js";
import type * as payment_paymentAttemptTypes from "../payment/paymentAttemptTypes.js";
import type * as payment_paymentAttempts from "../payment/paymentAttempts.js";
import type * as router from "../router.js";
import type * as user_friends from "../user/friends.js";
import type * as user_users from "../user/users.js";
import type * as workspace_activity from "../workspace/activity.js";
import type * as workspace_comments from "../workspace/comments.js";
import type * as workspace_debug from "../workspace/debug.js";
import type * as workspace_health from "../workspace/health.js";
import type * as workspace_invitations from "../workspace/invitations.js";
import type * as workspace_notifications from "../workspace/notifications.js";
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
  "auth/auth": typeof auth_auth;
  "auth/helpers": typeof auth_helpers;
  "components/registry": typeof components_registry;
  "dev/seedFeatures": typeof dev_seedFeatures;
  "features/_schema": typeof features__schema;
  "features/calendar/index": typeof features_calendar_index;
  "features/calendar/mutations": typeof features_calendar_mutations;
  "features/calendar/queries": typeof features_calendar_queries;
  "features/comments/index": typeof features_comments_index;
  "features/comments/mutations": typeof features_comments_mutations;
  "features/comments/queries": typeof features_comments_queries;
  "features/crm/index": typeof features_crm_index;
  "features/crm/mutations": typeof features_crm_mutations;
  "features/crm/queries": typeof features_crm_queries;
  "features/database/databases": typeof features_database_databases;
  "features/database/index": typeof features_database_index;
  "features/database/mutations": typeof features_database_mutations;
  "features/database/queries": typeof features_database_queries;
  "features/db/fields": typeof features_db_fields;
  "features/db/rows": typeof features_db_rows;
  "features/db/tables": typeof features_db_tables;
  "features/db/utils": typeof features_db_utils;
  "features/notifications/index": typeof features_notifications_index;
  "features/notifications/mutations": typeof features_notifications_mutations;
  "features/notifications/queries": typeof features_notifications_queries;
  "features/projects/index": typeof features_projects_index;
  "features/projects/mutations": typeof features_projects_mutations;
  "features/projects/queries": typeof features_projects_queries;
  "features/reports/index": typeof features_reports_index;
  "features/reports/mutations": typeof features_reports_mutations;
  "features/reports/queries": typeof features_reports_queries;
  "features/support/index": typeof features_support_index;
  "features/support/mutations": typeof features_support_mutations;
  "features/support/queries": typeof features_support_queries;
  "features/tasks/index": typeof features_tasks_index;
  "features/tasks/mutations": typeof features_tasks_mutations;
  "features/tasks/queries": typeof features_tasks_queries;
  "features/wiki/index": typeof features_wiki_index;
  "features/wiki/mutations": typeof features_wiki_mutations;
  "features/wiki/queries": typeof features_wiki_queries;
  "features/workflows/index": typeof features_workflows_index;
  "features/workflows/mutations": typeof features_workflows_mutations;
  "features/workflows/queries": typeof features_workflows_queries;
  http: typeof http;
  "lib/utils": typeof lib_utils;
  "menu/chat/conversations": typeof menu_chat_conversations;
  "menu/chat/messageReactions": typeof menu_chat_messageReactions;
  "menu/chat/messages": typeof menu_chat_messages;
  "menu/cms/canvas": typeof menu_cms_canvas;
  "menu/page/documents": typeof menu_page_documents;
  "menu/page/presence": typeof menu_page_presence;
  "menu/page/prosemirror": typeof menu_page_prosemirror;
  "menu/store/itemComponents": typeof menu_store_itemComponents;
  "menu/store/menuItems": typeof menu_store_menuItems;
  "menu/store/menu_manifest_data": typeof menu_store_menu_manifest_data;
  "menu/store/menus": typeof menu_store_menus;
  "menu/store/optional_features_catalog": typeof menu_store_optional_features_catalog;
  "menu/store/sets": typeof menu_store_sets;
  "payment/paymentAttemptTypes": typeof payment_paymentAttemptTypes;
  "payment/paymentAttempts": typeof payment_paymentAttempts;
  router: typeof router;
  "user/friends": typeof user_friends;
  "user/users": typeof user_users;
  "workspace/activity": typeof workspace_activity;
  "workspace/comments": typeof workspace_comments;
  "workspace/debug": typeof workspace_debug;
  "workspace/health": typeof workspace_health;
  "workspace/invitations": typeof workspace_invitations;
  "workspace/notifications": typeof workspace_notifications;
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
