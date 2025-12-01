"use client"

import { useRouter } from "next/navigation"
import { RobustOnboardingFlow } from "@/frontend/shared/foundation/workspaces"

export default function WorkspaceOnboardingPage() {
  const router = useRouter()

  return (
    <RobustOnboardingFlow
      onComplete={async (workspaceId, enabledFeatures) => {
        if (process.env.NODE_ENV !== 'production') {
          console.log('[OnboardingPage] onComplete', { 
            workspaceId, 
            enabledFeatures,
            redirectTo: '/dashboard/overview?onboarded=1' 
          })
        }
        // TODO: Save enabled features to workspace settings/database
        router.replace("/dashboard/overview?onboarded=1")
      }}
    />
  )
}
