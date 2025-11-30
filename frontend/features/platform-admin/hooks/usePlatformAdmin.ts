import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import type { FeatureStatus, AccessLevel } from "../types"

/**
 * Hook to check platform admin status
 */
export function usePlatformAdminStatus() {
  const status = useQuery(api.features.custom.admin.checkMyPlatformAdminStatus)
  
  return {
    isLoading: status === undefined,
    isAuthenticated: status?.isAuthenticated ?? false,
    isPlatformAdmin: status?.isPlatformAdmin ?? false,
    email: status?.email ?? null,
    name: status?.name ?? null,
    clerkId: status?.clerkId ?? null,
  }
}

/**
 * Hook to manage system features (platform admin only)
 * These are the features that appear in Menu Store
 */
export function useSystemFeatures() {
  const { isPlatformAdmin } = usePlatformAdminStatus()
  const features = useQuery(
    api.features.system.admin.getSystemFeatures,
    isPlatformAdmin ? {} : "skip"
  )
  
  return {
    features: features ?? [],
    isLoading: features === undefined,
    isEmpty: features?.length === 0,
  }
}

/**
 * Hook for system feature mutations
 */
export function useSystemFeatureMutations() {
  const createFeature = useMutation(api.features.system.admin.createSystemFeature)
  const updateFeature = useMutation(api.features.system.admin.updateSystemFeature)
  const deleteFeature = useMutation(api.features.system.admin.deleteSystemFeature)
  const setVisibility = useMutation(api.features.system.admin.setFeatureVisibility)
  const seedFeatures = useMutation(api.features.system.admin.seedSystemFeaturesFromCatalog)
  
  return {
    createFeature: async (data: {
      featureId: string
      name: string
      description: string
      icon: string
      version: string
      category: string
      tags: string[]
      status: FeatureStatus
      isReady: boolean
      expectedRelease?: string
      featureType: string
      isPublic: boolean
    }) => {
      return await createFeature(data)
    },
    updateFeature: async (
      id: Id<"systemFeatures">,
      data: Partial<{
        name: string
        description: string
        icon: string
        version: string
        category: string
        tags: string[]
        status: FeatureStatus
        isReady: boolean
        expectedRelease?: string
        featureType: string
        isPublic: boolean
        isEnabled: boolean
        order: number
      }>
    ) => {
      return await updateFeature({ id, ...data })
    },
    deleteFeature: async (id: Id<"systemFeatures">) => {
      return await deleteFeature({ id })
    },
    setVisibility: async (id: Id<"systemFeatures">, isPublic: boolean, isEnabled: boolean) => {
      return await setVisibility({ id, isPublic, isEnabled })
    },
    seedFeatures: async () => {
      return await seedFeatures({})
    },
  }
}

/**
 * Hook to manage custom features (platform admin only)
 */
export function useCustomFeatures() {
  const { isPlatformAdmin } = usePlatformAdminStatus()
  const features = useQuery(
    api.features.custom.admin.getAllCustomFeatures,
    isPlatformAdmin ? {} : "skip"
  )
  
  return {
    features: features ?? [],
    isLoading: features === undefined,
    isEmpty: features?.length === 0,
  }
}

/**
 * Hook to manage all workspaces (platform admin only)
 */
export function useAllWorkspaces() {
  const { isPlatformAdmin } = usePlatformAdminStatus()
  const workspaces = useQuery(
    api.features.custom.admin.getAllWorkspaces,
    isPlatformAdmin ? {} : "skip"
  )
  
  return {
    workspaces: workspaces ?? [],
    isLoading: workspaces === undefined,
    isEmpty: workspaces?.length === 0,
  }
}

/**
 * Hook for feature access management
 */
export function useFeatureAccess(workspaceId: Id<"workspaces"> | null) {
  const { isPlatformAdmin } = usePlatformAdminStatus()
  const access = useQuery(
    api.features.custom.admin.getWorkspaceFeatureAccess,
    isPlatformAdmin && workspaceId ? { workspaceId } : "skip"
  )
  
  return {
    access: access ?? [],
    isLoading: access === undefined,
  }
}

/**
 * Hook for platform admin mutations
 */
export function usePlatformAdminMutations() {
  const updateFeatureStatus = useMutation(api.features.custom.admin.updateFeatureStatus)
  const grantFeatureAccess = useMutation(api.features.custom.admin.grantFeatureAccess)
  
  return {
    updateFeatureStatus: async (featureId: Id<"customFeatures">, status: FeatureStatus) => {
      // Cast to the expected type (excluding 'experimental' for custom features)
      const validStatus = status === "experimental" ? "development" : status
      return await updateFeatureStatus({ featureId, status: validStatus as "stable" | "beta" | "development" | "deprecated" | "disabled" })
    },
    grantFeatureAccess: async (
      featureId: string,
      workspaceId: Id<"workspaces">,
      accessLevel: AccessLevel
    ) => {
      return await grantFeatureAccess({ featureId, workspaceId, accessLevel })
    },
  }
}

/**
 * Combined hook for full platform admin functionality
 */
export function usePlatformAdmin() {
  const status = usePlatformAdminStatus()
  const customFeatures = useCustomFeatures()
  const systemFeatures = useSystemFeatures()
  const workspaces = useAllWorkspaces()
  const mutations = usePlatformAdminMutations()
  const systemMutations = useSystemFeatureMutations()
  
  return {
    ...status,
    features: customFeatures.features,
    systemFeatures: systemFeatures.features,
    workspaces: workspaces.workspaces,
    isLoadingFeatures: customFeatures.isLoading,
    isLoadingSystemFeatures: systemFeatures.isLoading,
    isLoadingWorkspaces: workspaces.isLoading,
    ...mutations,
    ...systemMutations,
  }
}
