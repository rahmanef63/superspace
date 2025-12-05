"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DynamicIcon } from "@/frontend/shared/ui/icons"
import type { IconName } from "@/frontend/shared/ui/icons"

// ============================================================================
// AI Message Avatar - Uses dynamic icons for AI assistant
// ============================================================================

export interface AIMessageAvatarProps extends React.ComponentProps<typeof Avatar> {
  /**
   * Icon name from lucide-react to display for the AI
   * @default "Bot"
   */
  icon?: IconName
  /**
   * Optional custom color for the icon
   * @default "currentColor"
   */
  iconColor?: string
  /**
   * Size of the icon
   * @default 4 (h-4 w-4)
   */
  iconSize?: number
}

/**
 * AIMessageAvatar - Avatar for AI assistant messages with dynamic icon
 * 
 * Uses icons from lucide-react via DynamicIcon for visual representation.
 * Icons can be determined by conversation topic/context.
 * 
 * @example
 * ```tsx
 * <AIMessageAvatar icon="Bot" />
 * <AIMessageAvatar icon="Code" /> // For coding assistant
 * <AIMessageAvatar icon="FileText" /> // For document assistant
 * <AIMessageAvatar icon="MessageSquare" /> // For general chat
 * ```
 */
export function AIMessageAvatar({ 
  icon = "Bot",
  iconColor,
  iconSize = 4,
  className,
  ...props 
}: AIMessageAvatarProps) {
  return (
    <Avatar 
      className={cn("size-8 ring ring-1 ring-border", className)} 
      {...props}
    >
      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5">
        <DynamicIcon 
          name={icon} 
          className={cn("h-4 w-4 text-primary", iconColor && `text-[${iconColor}]`)}
          aria-hidden="true"
        />
      </AvatarFallback>
    </Avatar>
  )
}

// ============================================================================
// User Message Avatar - Uses Clerk user avatar
// ============================================================================

export interface UserMessageAvatarProps extends React.ComponentProps<typeof Avatar> {
  /**
   * User's image URL from Clerk (user.imageUrl)
   */
  imageUrl?: string | null
  /**
   * User's full name for fallback initials
   */
  fullName?: string | null
  /**
   * User's username for fallback
   */
  username?: string | null
  /**
   * Custom fallback text if no name available
   * @default "U"
   */
  fallback?: string
}

/**
 * UserMessageAvatar - Avatar for user messages using Clerk user data
 * 
 * Displays the user's Clerk profile image with fallback to initials.
 * 
 * @example
 * ```tsx
 * import { useUser } from "@clerk/nextjs"
 * 
 * const { user } = useUser()
 * 
 * <UserMessageAvatar 
 *   imageUrl={user?.imageUrl}
 *   fullName={user?.fullName}
 *   username={user?.username}
 * />
 * ```
 */
export function UserMessageAvatar({
  imageUrl,
  fullName,
  username,
  fallback = "U",
  className,
  ...props
}: UserMessageAvatarProps) {
  // Generate fallback initials from name/username
  const getInitials = React.useMemo(() => {
    if (fullName) {
      const parts = fullName.split(" ")
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      }
      return fullName.slice(0, 2).toUpperCase()
    }
    if (username) {
      return username.slice(0, 2).toUpperCase()
    }
    return fallback
  }, [fullName, username, fallback])

  return (
    <Avatar className={cn("size-8 ring ring-1 ring-border", className)} {...props}>
      {imageUrl && (
        <AvatarImage 
          src={imageUrl} 
          alt={fullName || username || "User"} 
          className="mt-0 mb-0"
        />
      )}
      <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
        {getInitials}
      </AvatarFallback>
    </Avatar>
  )
}
