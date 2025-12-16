"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import { usePathname } from "next/navigation"
import { useMutation } from "convex/react"
import { api } from "@convex/_generated/api"
import { useUser } from "@clerk/nextjs"
import { ArrowRight, ArrowLeft, Check, Loader2, Rocket } from "lucide-react"

import { OnboardingProgress } from "./OnboardingProgress"
import { BundleSelector } from "./BundleSelector"
import { FeatureCustomizer } from "./FeatureCustomizer"
import {
  useBundleWithFeatures,
  getMergedBundleEnabledFeatures,
} from "../hooks/useBundles"
import { CORE_FEATURES } from "../constants"
import type { AvailableFeatureId } from "../constants"
import type { WorkspaceType } from "../types"
import type { ExtendedOnboardingData, OnboardingStepDef } from "./onboarding-types"

interface RobustOnboardingFlowProps {
  onComplete: (workspaceId: any, enabledFeatures: AvailableFeatureId[]) => void
  variant?: "page" | "dialog"
  initialType?: WorkspaceType
}

const ONBOARDING_STEPS: OnboardingStepDef[] = [
  {
    id: "welcome",
    title: "Welcome to Your Workspace",
    description: "Let's set up your workspace to get started",
    icon: "Rocket",
  },
  {
    id: "details",
    title: "Workspace Details",
    description: "Tell us about your workspace",
    icon: "FileText",
  },
  {
    id: "bundle",
    title: "Choose Your Template",
    description: "Select a pre-configured bundle or start fresh",
    icon: "Layers",
  },
  {
    id: "features",
    title: "Customize Features",
    description: "Fine-tune which features you want enabled",
    icon: "Settings",
  },
]

export function RobustOnboardingFlow({
  onComplete,
  variant = "page",
  initialType = "personal"
}: RobustOnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const [data, setData] = useState<ExtendedOnboardingData>({
    name: "",
    type: initialType,
    description: "",
    selectedBundleId: null,
    enabledFeatures: [],
    disabledFeatures: [],
  })

  let clerkAuth: { isSignedIn?: boolean } | undefined
  try {
    clerkAuth = useUser()
  } catch (err) {
    console.warn("[Onboarding] Clerk unavailable", err)
  }
  const isSignedIn = Boolean(clerkAuth?.isSignedIn)

  const createWorkspace = useMutation(api.workspace.workspaces.createWorkspace)
  const trackEvent = useMutation(api.features.analytics.mutations.trackEvent as any)
  const pathname = usePathname()

  // Get the selected bundle with features from database/static
  const { bundle: selectedBundle } = useBundleWithFeatures(data.selectedBundleId)

  // Update enabled features when bundle changes
  const handleBundleSelect = useCallback((bundleId: string) => {
    // Just set the bundle ID - features will be derived from the hook
    setData(prev => ({
      ...prev,
      selectedBundleId: bundleId,
      disabledFeatures: [],
    }))
  }, [])

  // Sync enabled features when selected bundle changes
  useEffect(() => {
    if (selectedBundle) {
      const enabledFeatures = getMergedBundleEnabledFeatures(selectedBundle)
      setData(prev => {
        // Only update if features actually differ
        const prevSorted = [...prev.enabledFeatures].sort().join(',')
        const newSorted = [...enabledFeatures].sort().join(',')
        if (prevSorted === newSorted) {
          return prev
        }
        return {
          ...prev,
          enabledFeatures,
        }
      })
    }
  }, [selectedBundle])

  // Toggle individual feature
  const handleToggleFeature = useCallback((featureId: AvailableFeatureId) => {
    // Cannot toggle core features
    if (CORE_FEATURES.includes(featureId)) return

    setData(prev => {
      const isEnabled = prev.enabledFeatures.includes(featureId)
      if (isEnabled) {
        return {
          ...prev,
          enabledFeatures: prev.enabledFeatures.filter(f => f !== featureId),
          disabledFeatures: [...prev.disabledFeatures, featureId],
        }
      } else {
        return {
          ...prev,
          enabledFeatures: [...prev.enabledFeatures, featureId],
          disabledFeatures: prev.disabledFeatures.filter(f => f !== featureId),
        }
      }
    })
  }, [])

  const handleNext = useCallback(() => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setSubmitError(null)
      setCurrentStep(prev => prev + 1)
    }
  }, [currentStep])

  const handleBack = useCallback(() => {
    if (currentStep > 0 && !isSubmitting) {
      setSubmitError(null)
      setCurrentStep(prev => prev - 1)
    }
  }, [currentStep, isSubmitting])

  const canProceed = useMemo(() => {
    switch (currentStep) {
      case 0: // Welcome
        return true
      case 1: // Details
        return data.name.trim().length > 0
      case 2: // Bundle
        return data.selectedBundleId !== null
      case 3: // Features
        return data.enabledFeatures.length > 0
      default:
        return false
    }
  }, [currentStep, data])

  const handleComplete = async () => {
    if (!isSignedIn) {
      setSubmitError("You need to sign in before creating a workspace.")
      return
    }

    setSubmitError(null)
    setIsSubmitting(true)

    const slugify = (s: string) =>
      String(s || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\-\s]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")

    const base = slugify(data.name) || "workspace"

    let attempt = 0
    while (attempt < 10) {
      const candidate = attempt === 0 ? base : `${base}-${attempt + 1}`
      try {
        const workspaceId = await createWorkspace({
          name: data.name,
          slug: candidate,
          type: data.type,
          description: data.description,
          isPublic: false,
          // Pass bundle and features to workspace
          bundleId: data.selectedBundleId || undefined,
          enabledFeatures: data.enabledFeatures,
          // Use enabled features as selected menu slugs for menu system
          selectedMenuSlugs: data.enabledFeatures,
        })

        void trackEvent({
          workspaceId,
          eventType: "onboarding",
          eventName: "onboarding.workspace_created",
          properties: {
            workspaceType: data.type,
            bundleId: data.selectedBundleId ?? undefined,
            enabledFeaturesCount: data.enabledFeatures.length,
            enabledFeatures: data.enabledFeatures,
          },
          metadata: {
            userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
            referrer: typeof document !== "undefined" ? document.referrer : undefined,
            path: pathname ?? undefined,
          },
        }).catch((err: any) => {
          if (process.env.NODE_ENV !== "production") {
            console.warn("[Onboarding] analytics trackEvent failed", err)
          }
        })

        // Bundle and features are saved with the workspace creation
        onComplete(workspaceId, data.enabledFeatures)
        setIsSubmitting(false)
        return
      } catch (error: any) {
        const msg = String(error?.message || error)
        const duplicate = msg.includes("slug already exists") || (msg.includes("slug") && msg.includes("exists"))
        const unauthenticated = msg.toLowerCase().includes("not authenticated")

        if (unauthenticated) {
          setSubmitError("Authentication expired. Please sign in again and retry.")
          break
        }
        if (!duplicate) {
          setSubmitError("We couldn't create the workspace. Please try again.")
          break
        }
        attempt += 1
      }
    }

    setIsSubmitting(false)
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Welcome
        return (
          <div className="text-center py-8 sm:py-12">
            <div className="mx-auto mb-4 sm:mb-6 flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-primary/10">
              <Rocket className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
            </div>
            <h2 className="mb-3 text-xl sm:text-2xl font-bold">{ONBOARDING_STEPS[0].title}</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              We'll help you set up your workspace in just a few steps.
              You can always customize everything later.
            </p>
          </div>
        )

      case 1: // Details
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">{ONBOARDING_STEPS[1].title}</h2>
              <p className="text-muted-foreground">{ONBOARDING_STEPS[1].description}</p>
            </div>

            <div className="space-y-4 max-w-lg mx-auto">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Workspace Name *
                </label>
                <input
                  type="text"
                  value={data.name}
                  onChange={(e) => setData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="My Awesome Workspace"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 focus:border-ring focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Workspace Type
                </label>
                <select
                  value={data.type}
                  onChange={(e) => setData(prev => ({ ...prev, type: e.target.value as WorkspaceType }))}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 focus:border-ring focus:ring-2 focus:ring-ring"
                >
                  <option value="personal">Personal - For individual use</option>
                  <option value="family">Family - For family members</option>
                  <option value="group">Group - For small teams</option>
                  <option value="organization">Organization - For companies</option>
                  <option value="institution">Institution - For schools, etc.</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Description (Optional)
                </label>
                <textarea
                  value={data.description}
                  onChange={(e) => setData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="What will you use this workspace for?"
                  rows={3}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 focus:border-ring focus:ring-2 focus:ring-ring resize-none"
                />
              </div>
            </div>
          </div>
        )

      case 2: // Bundle
        return (
          <BundleSelector
            workspaceType={data.type}
            selectedBundleId={data.selectedBundleId}
            onSelect={handleBundleSelect}
          />
        )

      case 3: // Features
        return (
          <FeatureCustomizer
            selectedBundleId={data.selectedBundleId}
            enabledFeatures={data.enabledFeatures}
            onToggleFeature={handleToggleFeature}
          />
        )

      default:
        return null
    }
  }

  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1
  const isFirstStep = currentStep === 0

  const content = (
    <div className="w-full max-w-4xl mx-auto">
      <OnboardingProgress currentStep={currentStep} totalSteps={ONBOARDING_STEPS.length} />

      <div className="mt-6 rounded-lg border border-border bg-background p-4 sm:p-6 md:p-8">
        {renderStepContent()}

        {submitError && (
          <div className="mt-6 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {submitError}
          </div>
        )}

        <div className="mt-6 sm:mt-8 flex flex-col-reverse sm:flex-row items-center justify-between gap-3 sm:gap-0 border-t border-border pt-4 sm:pt-6">
          <button
            onClick={handleBack}
            disabled={isFirstStep || isSubmitting}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 ${isFirstStep || isSubmitting
                ? "cursor-not-allowed text-muted-foreground"
                : "text-foreground hover:bg-muted"
              }`}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          {isLastStep ? (
            <button
              onClick={handleComplete}
              disabled={!canProceed || isSubmitting}
              className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2 text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              {isSubmitting ? "Creating..." : "Create Workspace"}
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!canProceed || isSubmitting}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )

  if (variant === "dialog") {
    return content
  }

  // Page variant - fills the dashboard content area with proper scrolling
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="py-4 sm:py-8 px-3 sm:px-4 md:px-8">
        {content}
      </div>
    </div>
  )
}
