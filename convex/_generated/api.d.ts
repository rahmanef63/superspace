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
import type * as http from "../http.js";
import type * as lib_utils from "../lib/utils.js";
import type * as menu_chat_conversations from "../menu/chat/conversations.js";
import type * as menu_chat_messageReactions from "../menu/chat/messageReactions.js";
import type * as menu_chat_messages from "../menu/chat/messages.js";
import type * as menu_cms_canvas from "../menu/cms/canvas.js";
import type * as menu_database_databases from "../menu/database/databases.js";
import type * as menu_page_db_fields from "../menu/page/db/fields.js";
import type * as menu_page_db_rows from "../menu/page/db/rows.js";
import type * as menu_page_db_tables from "../menu/page/db/tables.js";
import type * as menu_page_db_utils from "../menu/page/db/utils.js";
import type * as menu_page_documents from "../menu/page/documents.js";
import type * as menu_page_presence from "../menu/page/presence.js";
import type * as menu_page_prosemirror from "../menu/page/prosemirror.js";
import type * as menu_store_itemComponents from "../menu/store/itemComponents.js";
import type * as menu_store_menuItems from "../menu/store/menuItems.js";
import type * as menu_store_menu_manifest_data from "../menu/store/menu_manifest_data.js";
import type * as menu_store_menus from "../menu/store/menus.js";
import type * as menu_store_sets from "../menu/store/sets.js";
import type * as payment_paymentAttemptTypes from "../payment/paymentAttemptTypes.js";
import type * as payment_paymentAttempts from "../payment/paymentAttempts.js";
import type * as router from "../router.js";
import type * as user_friends from "../user/friends.js";
import type * as user_users from "../user/users.js";
import type * as workspace_activity from "../workspace/activity.js";
import type * as workspace_comments from "../workspace/comments.js";
import type * as workspace_debug from "../workspace/debug.js";
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
  http: typeof http;
  "lib/utils": typeof lib_utils;
  "menu/chat/conversations": typeof menu_chat_conversations;
  "menu/chat/messageReactions": typeof menu_chat_messageReactions;
  "menu/chat/messages": typeof menu_chat_messages;
  "menu/cms/canvas": typeof menu_cms_canvas;
  "menu/database/databases": typeof menu_database_databases;
  "menu/page/db/fields": typeof menu_page_db_fields;
  "menu/page/db/rows": typeof menu_page_db_rows;
  "menu/page/db/tables": typeof menu_page_db_tables;
  "menu/page/db/utils": typeof menu_page_db_utils;
  "menu/page/documents": typeof menu_page_documents;
  "menu/page/presence": typeof menu_page_presence;
  "menu/page/prosemirror": typeof menu_page_prosemirror;
  "menu/store/itemComponents": typeof menu_store_itemComponents;
  "menu/store/menuItems": typeof menu_store_menuItems;
  "menu/store/menu_manifest_data": typeof menu_store_menu_manifest_data;
  "menu/store/menus": typeof menu_store_menus;
  "menu/store/sets": typeof menu_store_sets;
  "payment/paymentAttemptTypes": typeof payment_paymentAttemptTypes;
  "payment/paymentAttempts": typeof payment_paymentAttempts;
  router: typeof router;
  "user/friends": typeof user_friends;
  "user/users": typeof user_users;
  "workspace/activity": typeof workspace_activity;
  "workspace/comments": typeof workspace_comments;
  "workspace/debug": typeof workspace_debug;
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
