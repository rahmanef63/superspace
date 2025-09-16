import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"
import { authTables } from "@convex-dev/auth/server"
import { paymentAttemptSchemaValidator } from "./payment/paymentAttemptTypes"

const applicationTables = {
  // User privacy settings
  userPrivacySettings: defineTable({
    userId: v.id("users"),
    isVisible: v.boolean(),
    allowDirectMessages: v.boolean(),
    allowFriendRequests: v.boolean(),
    visibilityMode: v.union(v.literal("everyone"), v.literal("workspaces_only"), v.literal("custom")),
    hiddenFromUsers: v.array(v.id("users")),
    hiddenFromWorkspaces: v.array(v.id("workspaces")),
    visibleToUsers: v.array(v.id("users")),
    visibleToWorkspaces: v.array(v.id("workspaces")),
  }).index("by_user", ["userId"]),

  // Organizations
  organizations: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    logo: v.optional(v.string()),
    website: v.optional(v.string()),
    isPublic: v.boolean(),
    settings: v.optional(
      v.object({
        allowPublicWorkspaces: v.boolean(),
        requireApproval: v.boolean(),
        defaultRole: v.string(),
      }),
    ),
    createdBy: v.id("users"),
  })
    .index("by_slug", ["slug"])
    .index("by_creator", ["createdBy"]),

  // Organization memberships
  organizationMemberships: defineTable({
    organizationId: v.id("organizations"),
    userId: v.id("users"),
    role: v.union(v.literal("owner"), v.literal("admin"), v.literal("member")),
    status: v.union(v.literal("active"), v.literal("inactive"), v.literal("pending")),
    joinedAt: v.number(),
    invitedBy: v.optional(v.id("users")),
  })
    .index("by_organization", ["organizationId"])
    .index("by_user", ["userId"])
    .index("by_user_organization", ["userId", "organizationId"]),

  // Workspaces
  workspaces: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    type: v.union(
      v.literal("organization"),
      v.literal("institution"),
      v.literal("group"),
      v.literal("family"),
      v.literal("personal"),
    ),
    organizationId: v.optional(v.id("organizations")),
    logo: v.optional(v.string()),
    isPublic: v.boolean(),
    settings: v.optional(
      v.object({
        allowInvites: v.optional(v.boolean()),
        requireApproval: v.optional(v.boolean()),
        defaultRoleId: v.optional(v.id("roles")),
        allowPublicDocuments: v.optional(v.boolean()),
        theme: v.optional(v.string()),
      }),
    ),
    createdBy: v.id("users"),
  })
    .index("by_slug", ["slug"])
    .index("by_organization", ["organizationId"])
    .index("by_creator", ["createdBy"])
    .index("by_type", ["type"]),

  // Roles
  roles: defineTable({
    name: v.string(),
    slug: v.optional(v.string()),
    description: v.optional(v.string()),
    workspaceId: v.optional(v.id("workspaces")),
    permissions: v.array(v.string()),
    color: v.optional(v.string()),
    isDefault: v.optional(v.boolean()),
    isSystemRole: v.optional(v.boolean()),
    level: v.optional(v.number()),
    icon: v.optional(v.string()),
    createdBy: v.optional(v.id("users")),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_slug", ["slug"])
    .index("by_system", ["isSystemRole"]),

  // Workspace memberships
  workspaceMemberships: defineTable({
    workspaceId: v.id("workspaces"),
    userId: v.id("users"),
    roleId: v.id("roles"),
    status: v.union(v.literal("active"), v.literal("inactive"), v.literal("pending")),
    joinedAt: v.number(),
    invitedBy: v.optional(v.id("users")),
    lastActiveAt: v.optional(v.number()),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_user", ["userId"])
    .index("by_user_workspace", ["userId", "workspaceId"])
    .index("by_role", ["roleId"]),

  // Invitations
  invitations: defineTable({
    type: v.union(v.literal("workspace"), v.literal("personal")),
    workspaceId: v.optional(v.id("workspaces")),
    inviterId: v.id("users"),
    inviteeEmail: v.string(),
    inviteeId: v.optional(v.id("users")), // Set when user exists
    roleId: v.optional(v.id("roles")), // For workspace invitations
    status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("declined"), v.literal("expired")),
    message: v.optional(v.string()),
    expiresAt: v.number(),
    acceptedAt: v.optional(v.number()),
    token: v.string(), // Unique invitation token
  })
    .index("by_inviter", ["inviterId"])
    .index("by_invitee_email", ["inviteeEmail"])
    .index("by_invitee_id", ["inviteeId"])
    .index("by_workspace", ["workspaceId"])
    .index("by_token", ["token"])
    .index("by_status", ["status"]),

  // Menu items
  menuItems: defineTable({
    workspaceId: v.id("workspaces"),
    menuSetId: v.optional(v.id("menuSets")),
    parentId: v.optional(v.id("menuItems")),
    name: v.string(),
    slug: v.string(),
    type: v.union(
      v.literal("folder"),
      v.literal("route"),
      v.literal("divider"),
      v.literal("action"),
      v.literal("chat"),
      v.literal("document"),
    ),
    icon: v.optional(v.string()),
    path: v.optional(v.string()),
    component: v.optional(v.string()),
    order: v.number(),
    isVisible: v.boolean(),
    visibleForRoleIds: v.array(v.id("roles")),
    metadata: v.optional(
      v.object({
        badge: v.optional(v.string()),
        description: v.optional(v.string()),
        color: v.optional(v.string()),
        targetId: v.optional(v.string()),
        jsonPlaceholder: v.optional(v.object({})),
        version: v.optional(v.string()),
        category: v.optional(v.string()),
        lastUpdated: v.optional(v.number()),
        previousVersion: v.optional(v.string()),
      }),
    ),
    createdBy: v.id("users"),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_menuSet", ["menuSetId"])
    .index("by_workspace_parent", ["workspaceId", "parentId"])
    .index("by_parent", ["parentId"]),

  // Conversations
  conversations: defineTable({
    name: v.optional(v.string()),
    type: v.union(v.literal("personal"), v.literal("group"), v.literal("ai")),
    workspaceId: v.optional(v.id("workspaces")),
    createdBy: v.id("users"),
    isActive: v.boolean(),
    lastMessageAt: v.optional(v.number()),
    metadata: v.optional(
      v.object({
        description: v.optional(v.string()),
        avatar: v.optional(v.string()),
        aiModel: v.optional(v.string()),
        systemPrompt: v.optional(v.string()),
        isFavorite: v.optional(v.boolean()),
        isPinned: v.optional(v.boolean()),
        isMuted: v.optional(v.boolean()),
        isDraft: v.optional(v.boolean()),
        labels: v.optional(v.array(v.string())),
      }),
    ),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_creator", ["createdBy"])
    .index("by_type", ["type"]),

  // Conversation participants
  conversationParticipants: defineTable({
    conversationId: v.id("conversations"),
    userId: v.id("users"),
    role: v.union(v.literal("admin"), v.literal("member")),
    joinedAt: v.number(),
    lastReadAt: v.optional(v.number()),
    isActive: v.boolean(),
  })
    .index("by_conversation", ["conversationId"])
    .index("by_user", ["userId"])
    .index("by_user_conversation", ["userId", "conversationId"]),

  // Messages
  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    content: v.string(),
    type: v.union(v.literal("text"), v.literal("image"), v.literal("file")),
    replyToId: v.optional(v.id("messages")),
    editedAt: v.optional(v.number()),
    deletedAt: v.optional(v.number()),
    metadata: v.optional(
      v.object({
        fileName: v.optional(v.string()),
        fileSize: v.optional(v.number()),
        mimeType: v.optional(v.string()),
        storageId: v.optional(v.id("_storage")),
        storageIds: v.optional(v.array(v.string())),
        fileNames: v.optional(v.array(v.string())),
        fileSizes: v.optional(v.array(v.number())),
        mimeTypes: v.optional(v.array(v.string())),
        aiModel: v.optional(v.string()),
        tags: v.optional(v.array(v.string())),
        mentions: v.optional(v.array(v.string())),
      }),
    ),
  })
    .index("by_conversation", ["conversationId"])
    .index("by_sender", ["senderId"])
    .searchIndex("search_content", {
      searchField: "content",
      filterFields: ["conversationId", "type"],
    }),

  // Message reactions
  messageReactions: defineTable({
    messageId: v.id("messages"),
    userId: v.id("users"),
    emoji: v.string(),
  })
    .index("by_message", ["messageId"])
    .index("by_user", ["userId"])
    .index("by_message_user", ["messageId", "userId"]),

  // Role ⇄ Menu granular permissions (M:N)
  roleMenuPermissions: defineTable({
    roleId: v.id("roles"),
    menuItemId: v.id("menuItems"),
    canView: v.boolean(),
    canCreate: v.boolean(),
    canUpdate: v.boolean(),
    canDelete: v.boolean(),
    createdBy: v.optional(v.id("users")),
    createdAt: v.optional(v.number()),
  })
    .index("by_role", ["roleId"])
    .index("by_menu", ["menuItemId"])
    .index("by_role_menu", ["roleId", "menuItemId"]),

  // Documents
  documents: defineTable({
    title: v.string(),
    workspaceId: v.id("workspaces"),
    createdBy: v.id("users"),
    isPublic: v.boolean(),
    content: v.optional(v.string()),
    metadata: v.optional(
      v.object({
        description: v.optional(v.string()),
        tags: v.optional(v.array(v.string())),
        lastEditedBy: v.optional(v.id("users")),
        version: v.optional(v.number()),
      }),
    ),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_creator", ["createdBy"])
    .searchIndex("search_documents", {
      searchField: "title",
      filterFields: ["workspaceId", "isPublic"],
    }),

  // Comments
  comments: defineTable({
    documentId: v.id("documents"),
    authorId: v.id("users"),
    content: v.string(),
    parentId: v.optional(v.id("comments")),
    isResolved: v.boolean(),
    position: v.optional(
      v.object({
        start: v.number(),
        end: v.number(),
      }),
    ),
  })
    .index("by_document", ["documentId"])
    .index("by_author", ["authorId"])
    .index("by_parent", ["parentId"]),

  // Canvas elements
  canvasElements: defineTable({
    workspaceId: v.id("workspaces"),
    type: v.union(
      v.literal("text"),
      v.literal("image"),
      v.literal("shape"),
      v.literal("line"),
      v.literal("sticky-note"),
    ),
    position: v.object({
      x: v.number(),
      y: v.number(),
    }),
    size: v.object({
      width: v.number(),
      height: v.number(),
    }),
    properties: v.object({
      content: v.optional(v.string()),
      color: v.optional(v.string()),
      backgroundColor: v.optional(v.string()),
      fontSize: v.optional(v.number()),
      fontFamily: v.optional(v.string()),
      strokeWidth: v.optional(v.number()),
      opacity: v.optional(v.number()),
    }),
    zIndex: v.number(),
    createdBy: v.id("users"),
    lastModifiedBy: v.id("users"),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_creator", ["createdBy"]),

  // Canvas pages
  canvasPages: defineTable({
    workspaceId: v.id("workspaces"),
    name: v.string(),
    description: v.optional(v.string()),
    version: v.number(),
    createdBy: v.id("users"),
  }).index("by_workspace", ["workspaceId"]),

  // Menus
  menus: defineTable({
    workspaceId: v.id("workspaces"),
    name: v.string(),
    slug: v.string(),
    config: v.object({
      items: v.array(v.object({})),
    }),
    createdBy: v.id("users"),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_workspace_slug", ["workspaceId", "slug"]),

  // Friend requests
  friendRequests: defineTable({
    senderId: v.id("users"),
    receiverId: v.id("users"),
    status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("declined"), v.literal("blocked")),
    message: v.optional(v.string()),
    sentAt: v.number(),
    respondedAt: v.optional(v.number()),
  })
    .index("by_sender", ["senderId"])
    .index("by_receiver", ["receiverId"])
    .index("by_sender_receiver", ["senderId", "receiverId"])
    .index("by_status", ["status"]),

  // User friendships
  friendships: defineTable({
    user1Id: v.id("users"),
    user2Id: v.id("users"),
    status: v.union(v.literal("active"), v.literal("blocked")),
    createdAt: v.number(),
    blockedBy: v.optional(v.id("users")),
  })
    .index("by_user1", ["user1Id"])
    .index("by_user2", ["user2Id"])
    .index("by_users", ["user1Id", "user2Id"]),

  // Presence
  presence: defineTable({
    documentId: v.id("documents"),
    userId: v.id("users"),
    cursor: v.optional(
      v.object({
        x: v.number(),
        y: v.number(),
      }),
    ),
    lastSeen: v.number(),
  }).index("by_document", ["documentId"]),

  // Notifications
  notifications: defineTable({
    userId: v.id("users"),
    workspaceId: v.id("workspaces"),
    type: v.union(v.literal("message"), v.literal("invitation"), v.literal("document"), v.literal("system")),
    title: v.string(),
    message: v.string(),
    actionUrl: v.optional(v.string()),
    metadata: v.optional(v.object({})),
    isRead: v.boolean(),
    createdBy: v.id("users"),
  })
    .index("by_user", ["userId"])
    .index("by_workspace", ["workspaceId"])
    .index("by_type", ["type"]),

  // Menu Sets (owner can be system, a workspace, a user, or cms)
  menuSets: defineTable({
    ownerType: v.union(v.literal("system"), v.literal("workspace"), v.literal("user"), v.literal("cms")),
    ownerWorkspaceId: v.optional(v.id("workspaces")),
    ownerUserId: v.optional(v.id("users")),
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    isPublic: v.boolean(),
    createdBy: v.id("users"),
  })
    .index("by_ownerType", ["ownerType"])
    .index("by_ownerWorkspace", ["ownerWorkspaceId"])
    .index("by_ownerUser", ["ownerUserId"])
    .index("by_slug", ["slug"]),

  // Assign menu sets to workspaces
  workspaceMenuAssignments: defineTable({
    workspaceId: v.id("workspaces"),
    menuSetId: v.id("menuSets"),
    isDefault: v.boolean(),
    order: v.number(),
    createdAt: v.optional(v.number()),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_menuSet", ["menuSetId"])
    .index("by_workspace_default", ["workspaceId", "isDefault"]),

  // Assign menu sets to users (optionally scoped to a workspace)
  userMenuAssignments: defineTable({
    userId: v.id("users"),
    menuSetId: v.id("menuSets"),
    scope: v.union(v.literal("global"), v.literal("workspace")),
    workspaceId: v.optional(v.id("workspaces")),
    isDefault: v.boolean(),
    order: v.number(),
    createdAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_menuSet", ["menuSetId"])
    .index("by_user_workspace", ["userId", "workspaceId"]),

  // Component registry and versioning
  components: defineTable({
    workspaceId: v.optional(v.id("workspaces")), // null => system component
    key: v.string(),
    createdBy: v.id("users"),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_key", ["key"]),

  componentVersions: defineTable({
    componentId: v.id("components"),
    version: v.string(),
    category: v.string(),
    type: v.union(v.literal("ui"), v.literal("layout"), v.literal("data"), v.literal("action")),
    propsSchema: v.optional(v.object({})),
    defaultProps: v.optional(v.object({})),
    slots: v.optional(v.object({})),
    status: v.union(v.literal("draft"), v.literal("active"), v.literal("deprecated")),
    schemaVersion: v.optional(v.number()),
    migrations: v.optional(v.object({})),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  })
    .index("by_component", ["componentId"])
    .index("by_component_version", ["componentId", "version"]),

  componentAliases: defineTable({
    alias: v.string(),
    componentVersionId: v.id("componentVersions"),
    displayName: v.optional(v.string()),
    category: v.optional(v.string()),
    icon: v.optional(v.string()),
    description: v.optional(v.string()),
  })
    .index("by_alias", ["alias"])
    .index("by_componentVersion", ["componentVersionId"]),

  // Bind component versions to menu items in slots
  menuItemComponents: defineTable({
    menuItemId: v.id("menuItems"),
    componentVersionId: v.id("componentVersions"),
    slot: v.optional(v.string()), // root|main|sidebar|header|footer|overlay
    order: v.number(),
    props: v.optional(v.object({})),
    bindings: v.optional(v.object({})),
    layout: v.optional(v.object({})),
    visibility: v.optional(v.object({})),
    createdAt: v.optional(v.number()),
  })
    .index("by_menuItem", ["menuItemId"])
    .index("by_componentVersion", ["componentVersionId"]),

  // Activity events (audit trail)
  activityEvents: defineTable({
    actorUserId: v.id("users"),
    workspaceId: v.id("workspaces"),
    entityType: v.string(),
    entityId: v.string(),
    action: v.string(),
    diff: v.optional(v.object({})),
    createdAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_actor", ["actorUserId"])
    .index("by_entity", ["entityType", "entityId"]),
}

// Extend the auth users table to include extra fields
const extendedAuthTables = {
  ...authTables,
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    bio: v.optional(v.string()),
    // ID from Clerk (or other auth provider). Used to look up users.
    // Made optional to accommodate pre-existing records without this field.
    externalId: v.optional(v.string()),
  })
    .index("email", ["email"])
    .index("phone", ["phone"])
    .index("byExternalId", ["externalId"]),
}

export default defineSchema({
  ...extendedAuthTables,
  ...applicationTables,
  paymentAttempts: defineTable(paymentAttemptSchemaValidator)
    .index("byPaymentId", ["payment_id"])
    .index("byUserId", ["userId"])
    .index("byPayerUserId", ["payer.user_id"]),
})
