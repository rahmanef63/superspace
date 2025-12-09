/**
 * Permissions System for Communications
 * 
 * Provides permission checking utilities for channels, roles, and actions
 * Similar to Discord's permission system with bitfield support
 * 
 * @module features/communications/shared/permissions
 */

import type { 
  ChannelPermissions, 
  ChannelRole, 
  ChannelMembership,
  Channel,
} from "../types"

// =============================================================================
// PERMISSION FLAGS (Bitfield for efficient storage)
// Using regular numbers (safe for up to 32 flags)
// =============================================================================

export const PermissionFlags = {
  // General (0-2)
  VIEW_CHANNEL: 1 << 0,
  MANAGE_CHANNEL: 1 << 1,
  MANAGE_ROLES: 1 << 2,
  
  // Messages (3-11)
  SEND_MESSAGES: 1 << 3,
  SEND_IN_THREADS: 1 << 4,
  CREATE_THREADS: 1 << 5,
  EMBED_LINKS: 1 << 6,
  ATTACH_FILES: 1 << 7,
  ADD_REACTIONS: 1 << 8,
  USE_EXTERNAL_EMOJI: 1 << 9,
  MENTION_EVERYONE: 1 << 10,
  MANAGE_MESSAGES: 1 << 11,
  
  // Voice/Video (12-18)
  CONNECT: 1 << 12,
  SPEAK: 1 << 13,
  VIDEO: 1 << 14,
  SHARE_SCREEN: 1 << 15,
  MUTE_MEMBERS: 1 << 16,
  DEAFEN_MEMBERS: 1 << 17,
  MOVE_MEMBERS: 1 << 18,
  
  // Members (19-21)
  INVITE_MEMBERS: 1 << 19,
  KICK_MEMBERS: 1 << 20,
  BAN_MEMBERS: 1 << 21,
  
  // AI (22-23)
  USE_AI: 1 << 22,
  MANAGE_AI: 1 << 23,
} as const

// Convenient permission groups
export const PermissionGroups = {
  ALL: Object.values(PermissionFlags).reduce((a, b) => a | b, 0),
  
  ADMIN: 
    PermissionFlags.VIEW_CHANNEL |
    PermissionFlags.MANAGE_CHANNEL |
    PermissionFlags.MANAGE_ROLES |
    PermissionFlags.SEND_MESSAGES |
    PermissionFlags.SEND_IN_THREADS |
    PermissionFlags.CREATE_THREADS |
    PermissionFlags.EMBED_LINKS |
    PermissionFlags.ATTACH_FILES |
    PermissionFlags.ADD_REACTIONS |
    PermissionFlags.USE_EXTERNAL_EMOJI |
    PermissionFlags.MENTION_EVERYONE |
    PermissionFlags.MANAGE_MESSAGES |
    PermissionFlags.CONNECT |
    PermissionFlags.SPEAK |
    PermissionFlags.VIDEO |
    PermissionFlags.SHARE_SCREEN |
    PermissionFlags.MUTE_MEMBERS |
    PermissionFlags.DEAFEN_MEMBERS |
    PermissionFlags.MOVE_MEMBERS |
    PermissionFlags.INVITE_MEMBERS |
    PermissionFlags.KICK_MEMBERS |
    PermissionFlags.BAN_MEMBERS |
    PermissionFlags.USE_AI |
    PermissionFlags.MANAGE_AI,
    
  MODERATOR:
    PermissionFlags.VIEW_CHANNEL |
    PermissionFlags.SEND_MESSAGES |
    PermissionFlags.SEND_IN_THREADS |
    PermissionFlags.CREATE_THREADS |
    PermissionFlags.EMBED_LINKS |
    PermissionFlags.ATTACH_FILES |
    PermissionFlags.ADD_REACTIONS |
    PermissionFlags.USE_EXTERNAL_EMOJI |
    PermissionFlags.MENTION_EVERYONE |
    PermissionFlags.MANAGE_MESSAGES |
    PermissionFlags.CONNECT |
    PermissionFlags.SPEAK |
    PermissionFlags.VIDEO |
    PermissionFlags.SHARE_SCREEN |
    PermissionFlags.MUTE_MEMBERS |
    PermissionFlags.INVITE_MEMBERS |
    PermissionFlags.KICK_MEMBERS |
    PermissionFlags.USE_AI,
    
  MEMBER:
    PermissionFlags.VIEW_CHANNEL |
    PermissionFlags.SEND_MESSAGES |
    PermissionFlags.SEND_IN_THREADS |
    PermissionFlags.CREATE_THREADS |
    PermissionFlags.EMBED_LINKS |
    PermissionFlags.ATTACH_FILES |
    PermissionFlags.ADD_REACTIONS |
    PermissionFlags.USE_EXTERNAL_EMOJI |
    PermissionFlags.CONNECT |
    PermissionFlags.SPEAK |
    PermissionFlags.VIDEO |
    PermissionFlags.SHARE_SCREEN |
    PermissionFlags.USE_AI,
    
  VIEWER:
    PermissionFlags.VIEW_CHANNEL |
    PermissionFlags.ADD_REACTIONS |
    PermissionFlags.CONNECT,
    
  TEXT_BASIC:
    PermissionFlags.VIEW_CHANNEL |
    PermissionFlags.SEND_MESSAGES |
    PermissionFlags.ADD_REACTIONS,
    
  VOICE_BASIC:
    PermissionFlags.CONNECT |
    PermissionFlags.SPEAK |
    PermissionFlags.VIDEO |
    PermissionFlags.SHARE_SCREEN,
} as const

// =============================================================================
// PERMISSION UTILITIES
// =============================================================================

/**
 * Convert permission object to bitfield
 */
export function permissionsToBitfield(permissions: ChannelPermissions): number {
  let bitfield = 0
  
  if (permissions.viewChannel) bitfield |= PermissionFlags.VIEW_CHANNEL
  if (permissions.manageChannel) bitfield |= PermissionFlags.MANAGE_CHANNEL
  if (permissions.manageRoles) bitfield |= PermissionFlags.MANAGE_ROLES
  if (permissions.sendMessages) bitfield |= PermissionFlags.SEND_MESSAGES
  if (permissions.sendInThreads) bitfield |= PermissionFlags.SEND_IN_THREADS
  if (permissions.createThreads) bitfield |= PermissionFlags.CREATE_THREADS
  if (permissions.embedLinks) bitfield |= PermissionFlags.EMBED_LINKS
  if (permissions.attachFiles) bitfield |= PermissionFlags.ATTACH_FILES
  if (permissions.addReactions) bitfield |= PermissionFlags.ADD_REACTIONS
  if (permissions.useExternalEmoji) bitfield |= PermissionFlags.USE_EXTERNAL_EMOJI
  if (permissions.mentionEveryone) bitfield |= PermissionFlags.MENTION_EVERYONE
  if (permissions.manageMessages) bitfield |= PermissionFlags.MANAGE_MESSAGES
  if (permissions.connect) bitfield |= PermissionFlags.CONNECT
  if (permissions.speak) bitfield |= PermissionFlags.SPEAK
  if (permissions.video) bitfield |= PermissionFlags.VIDEO
  if (permissions.shareScreen) bitfield |= PermissionFlags.SHARE_SCREEN
  if (permissions.muteMembers) bitfield |= PermissionFlags.MUTE_MEMBERS
  if (permissions.deafenMembers) bitfield |= PermissionFlags.DEAFEN_MEMBERS
  if (permissions.moveMembers) bitfield |= PermissionFlags.MOVE_MEMBERS
  if (permissions.inviteMembers) bitfield |= PermissionFlags.INVITE_MEMBERS
  if (permissions.kickMembers) bitfield |= PermissionFlags.KICK_MEMBERS
  if (permissions.banMembers) bitfield |= PermissionFlags.BAN_MEMBERS
  if (permissions.useAi) bitfield |= PermissionFlags.USE_AI
  if (permissions.manageAi) bitfield |= PermissionFlags.MANAGE_AI
  
  return bitfield
}

/**
 * Convert bitfield to permission object
 */
export function bitfieldToPermissions(bitfield: number): ChannelPermissions {
  return {
    viewChannel: (bitfield & PermissionFlags.VIEW_CHANNEL) !== 0,
    manageChannel: (bitfield & PermissionFlags.MANAGE_CHANNEL) !== 0,
    manageRoles: (bitfield & PermissionFlags.MANAGE_ROLES) !== 0,
    sendMessages: (bitfield & PermissionFlags.SEND_MESSAGES) !== 0,
    sendInThreads: (bitfield & PermissionFlags.SEND_IN_THREADS) !== 0,
    createThreads: (bitfield & PermissionFlags.CREATE_THREADS) !== 0,
    embedLinks: (bitfield & PermissionFlags.EMBED_LINKS) !== 0,
    attachFiles: (bitfield & PermissionFlags.ATTACH_FILES) !== 0,
    addReactions: (bitfield & PermissionFlags.ADD_REACTIONS) !== 0,
    useExternalEmoji: (bitfield & PermissionFlags.USE_EXTERNAL_EMOJI) !== 0,
    mentionEveryone: (bitfield & PermissionFlags.MENTION_EVERYONE) !== 0,
    manageMessages: (bitfield & PermissionFlags.MANAGE_MESSAGES) !== 0,
    connect: (bitfield & PermissionFlags.CONNECT) !== 0,
    speak: (bitfield & PermissionFlags.SPEAK) !== 0,
    video: (bitfield & PermissionFlags.VIDEO) !== 0,
    shareScreen: (bitfield & PermissionFlags.SHARE_SCREEN) !== 0,
    muteMembers: (bitfield & PermissionFlags.MUTE_MEMBERS) !== 0,
    deafenMembers: (bitfield & PermissionFlags.DEAFEN_MEMBERS) !== 0,
    moveMembers: (bitfield & PermissionFlags.MOVE_MEMBERS) !== 0,
    inviteMembers: (bitfield & PermissionFlags.INVITE_MEMBERS) !== 0,
    kickMembers: (bitfield & PermissionFlags.KICK_MEMBERS) !== 0,
    banMembers: (bitfield & PermissionFlags.BAN_MEMBERS) !== 0,
    useAi: (bitfield & PermissionFlags.USE_AI) !== 0,
    manageAi: (bitfield & PermissionFlags.MANAGE_AI) !== 0,
  }
}

/**
 * Check if a bitfield has a specific permission
 */
export function hasPermission(bitfield: number, permission: number): boolean {
  return (bitfield & permission) === permission
}

/**
 * Check if a bitfield has any of the specified permissions
 */
export function hasAnyPermission(bitfield: number, permissions: number[]): boolean {
  return permissions.some(p => hasPermission(bitfield, p))
}

/**
 * Check if a bitfield has all of the specified permissions
 */
export function hasAllPermissions(bitfield: number, permissions: number[]): boolean {
  return permissions.every(p => hasPermission(bitfield, p))
}

// =============================================================================
// ROLE-BASED PERMISSION CALCULATOR
// =============================================================================

/**
 * Calculate effective permissions for a user based on their roles
 * Higher-positioned roles take precedence
 */
export function calculateEffectivePermissions(
  roles: ChannelRole[],
  isChannelOwner: boolean = false,
  isWorkspaceAdmin: boolean = false
): ChannelPermissions {
  // Workspace admin or channel owner has all permissions
  if (isWorkspaceAdmin || isChannelOwner) {
    return bitfieldToPermissions(PermissionGroups.ALL)
  }
  
  // Sort roles by position (highest first)
  const sortedRoles = [...roles].sort((a, b) => b.position - a.position)
  
  // Combine permissions from all roles (OR operation)
  let combinedBitfield = 0
  for (const role of sortedRoles) {
    combinedBitfield |= permissionsToBitfield(role.permissions)
  }
  
  return bitfieldToPermissions(combinedBitfield)
}

/**
 * Check if user can perform a specific action in a channel
 */
export function canPerformAction(
  membership: ChannelMembership | undefined,
  action: keyof ChannelPermissions,
  options: {
    isChannelOwner?: boolean
    isWorkspaceAdmin?: boolean
    channel?: Channel
  } = {}
): boolean {
  const { isChannelOwner = false, isWorkspaceAdmin = false, channel } = options
  
  // No membership = no permissions (unless admin)
  if (!membership && !isWorkspaceAdmin) {
    return false
  }
  
  // Admins can do everything
  if (isWorkspaceAdmin || isChannelOwner) {
    return true
  }
  
  // Calculate effective permissions
  const effectivePermissions = calculateEffectivePermissions(
    membership?.roles || [],
    isChannelOwner,
    isWorkspaceAdmin
  )
  
  // Channel-type specific restrictions
  if (channel) {
    // Announcement channels: only admins can send messages
    if (channel.type === "announcement" && action === "sendMessages") {
      return effectivePermissions.manageChannel || false
    }
    
    // Voice channels: need connect permission first
    if (["voice", "video", "stage", "huddle"].includes(channel.type)) {
      if (["speak", "video", "shareScreen"].includes(action)) {
        if (!effectivePermissions.connect) return false
      }
    }
  }
  
  return effectivePermissions[action] ?? false
}

// =============================================================================
// PERMISSION CHECKS (Convenient helper functions)
// =============================================================================

export const PermissionChecks = {
  /** Can view the channel */
  canView: (membership: ChannelMembership | undefined, opts = {}) =>
    canPerformAction(membership, "viewChannel", opts),
    
  /** Can send messages */
  canSendMessages: (membership: ChannelMembership | undefined, opts = {}) =>
    canPerformAction(membership, "sendMessages", opts),
    
  /** Can manage messages (delete/pin others' messages) */
  canManageMessages: (membership: ChannelMembership | undefined, opts = {}) =>
    canPerformAction(membership, "manageMessages", opts),
    
  /** Can manage channel settings */
  canManageChannel: (membership: ChannelMembership | undefined, opts = {}) =>
    canPerformAction(membership, "manageChannel", opts),
    
  /** Can manage roles */
  canManageRoles: (membership: ChannelMembership | undefined, opts = {}) =>
    canPerformAction(membership, "manageRoles", opts),
    
  /** Can connect to voice/video */
  canConnect: (membership: ChannelMembership | undefined, opts = {}) =>
    canPerformAction(membership, "connect", opts),
    
  /** Can speak in voice */
  canSpeak: (membership: ChannelMembership | undefined, opts = {}) =>
    canPerformAction(membership, "speak", opts),
    
  /** Can use video */
  canVideo: (membership: ChannelMembership | undefined, opts = {}) =>
    canPerformAction(membership, "video", opts),
    
  /** Can share screen */
  canShareScreen: (membership: ChannelMembership | undefined, opts = {}) =>
    canPerformAction(membership, "shareScreen", opts),
    
  /** Can mute other members */
  canMuteMembers: (membership: ChannelMembership | undefined, opts = {}) =>
    canPerformAction(membership, "muteMembers", opts),
    
  /** Can kick members */
  canKickMembers: (membership: ChannelMembership | undefined, opts = {}) =>
    canPerformAction(membership, "kickMembers", opts),
    
  /** Can invite members */
  canInviteMembers: (membership: ChannelMembership | undefined, opts = {}) =>
    canPerformAction(membership, "inviteMembers", opts),
    
  /** Can use AI features */
  canUseAI: (membership: ChannelMembership | undefined, opts = {}) =>
    canPerformAction(membership, "useAi", opts),
    
  /** Can manage AI bots */
  canManageAI: (membership: ChannelMembership | undefined, opts = {}) =>
    canPerformAction(membership, "manageAi", opts),
    
  /** Can mention @everyone */
  canMentionEveryone: (membership: ChannelMembership | undefined, opts = {}) =>
    canPerformAction(membership, "mentionEveryone", opts),
    
  /** Can create threads */
  canCreateThreads: (membership: ChannelMembership | undefined, opts = {}) =>
    canPerformAction(membership, "createThreads", opts),
    
  /** Can attach files */
  canAttachFiles: (membership: ChannelMembership | undefined, opts = {}) =>
    canPerformAction(membership, "attachFiles", opts),
}

// =============================================================================
// ROLE HIERARCHY UTILITIES
// =============================================================================

/**
 * Check if role A can manage role B (based on position)
 */
export function canManageRole(roleA: ChannelRole, roleB: ChannelRole): boolean {
  return roleA.position > roleB.position
}

/**
 * Get the highest role from a list
 */
export function getHighestRole(roles: ChannelRole[]): ChannelRole | undefined {
  if (roles.length === 0) return undefined
  return roles.reduce((highest, role) => 
    role.position > highest.position ? role : highest
  )
}

/**
 * Get roles that a user can assign (roles below their highest role)
 */
export function getAssignableRoles(
  userRoles: ChannelRole[],
  allRoles: ChannelRole[]
): ChannelRole[] {
  const highestUserRole = getHighestRole(userRoles)
  if (!highestUserRole) return []
  
  return allRoles.filter(role => role.position < highestUserRole.position)
}

// =============================================================================
// DEFAULT ROLE TEMPLATES
// =============================================================================

export const RoleTemplates = {
  admin: (channelId: string, workspaceId: string): Omit<ChannelRole, "id"> => ({
    channelId,
    workspaceId,
    name: "Admin",
    color: "#e74c3c",
    position: 100,
    permissions: bitfieldToPermissions(PermissionGroups.ADMIN),
  }),
  
  moderator: (channelId: string, workspaceId: string): Omit<ChannelRole, "id"> => ({
    channelId,
    workspaceId,
    name: "Moderator",
    color: "#9b59b6",
    position: 50,
    permissions: bitfieldToPermissions(PermissionGroups.MODERATOR),
  }),
  
  member: (channelId: string, workspaceId: string): Omit<ChannelRole, "id"> => ({
    channelId,
    workspaceId,
    name: "Member",
    color: "#3498db",
    position: 10,
    isDefault: true,
    permissions: bitfieldToPermissions(PermissionGroups.MEMBER),
  }),
  
  viewer: (channelId: string, workspaceId: string): Omit<ChannelRole, "id"> => ({
    channelId,
    workspaceId,
    name: "Viewer",
    color: "#95a5a6",
    position: 1,
    permissions: bitfieldToPermissions(PermissionGroups.VIEWER),
  }),
}

export default PermissionChecks
