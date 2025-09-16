/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
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
import type * as menu_itemComponents from "../menu/itemComponents.js";
import type * as menu_menuItems from "../menu/menuItems.js";
import type * as menu_menu_manifest_data from "../menu/menu_manifest_data.js";
import type * as menu_menus from "../menu/menus.js";
import type * as menu_page_documents from "../menu/page/documents.js";
import type * as menu_sets from "../menu/sets.js";
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
import type * as workspace_workspaces from "../workspace/workspaces.js";

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
  "menu/itemComponents": typeof menu_itemComponents;
  "menu/menuItems": typeof menu_menuItems;
  "menu/menu_manifest_data": typeof menu_menu_manifest_data;
  "menu/menus": typeof menu_menus;
  "menu/page/documents": typeof menu_page_documents;
  "menu/sets": typeof menu_sets;
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
  "workspace/workspaces": typeof workspace_workspaces;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
