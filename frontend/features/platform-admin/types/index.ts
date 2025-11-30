/**
 * Type definitions for platform-admin feature
 */

import type { Id } from "@/convex/_generated/dataModel"

export type FeatureStatus = "development" | "beta" | "stable" | "deprecated" | "disabled" | "experimental"
export type AccessLevel = "owner" | "admin" | "user" | "disabled"

export interface PlatformAdminUser {
  isAuthenticated: boolean
  isPlatformAdmin: boolean
  email: string | null
  name?: string | null
  clerkId?: string
}

export interface CustomFeature {
  _id: Id<"customFeatures">
  featureId: string
  name: string
  description?: string
  status: FeatureStatus
  isPublic: boolean
  createdBy: Id<"users">
  workspaceId?: Id<"workspaces">
  config?: Record<string, unknown>
  createdAt: number
  updatedAt?: number
}

export interface FeatureAccess {
  _id: Id<"featureAccess">
  featureId: string
  workspaceId: Id<"workspaces">
  accessLevel: AccessLevel
  grantedBy: Id<"users">
  grantedAt: number
}

export interface Workspace {
  _id: Id<"workspaces">
  name: string
  slug?: string
  ownerId: Id<"users">
  type?: string
  createdAt: number
}

export interface SystemFeatureTag {
  type: "admin" | "beta" | "new" | "deprecated" | "experimental"
  label: string
  color: string
}

export const FEATURE_TAGS: Record<string, SystemFeatureTag> = {
  admin: { type: "admin", label: "Admin Only", color: "bg-red-500/10 text-red-500 border-red-500/20" },
  beta: { type: "beta", label: "Beta", color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
  new: { type: "new", label: "New", color: "bg-green-500/10 text-green-500 border-green-500/20" },
  deprecated: { type: "deprecated", label: "Deprecated", color: "bg-gray-500/10 text-gray-500 border-gray-500/20" },
  experimental: { type: "experimental", label: "Experimental", color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
}
