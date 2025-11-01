"use client"

import { useRouter } from "next/navigation"
import { OnboardingFlow } from "@/frontend/shared/foundation/workspaces"

export default function WorkspaceOnboardingPage() {
  const router = useRouter()

  return (
    <OnboardingFlow
      onComplete={async (workspaceId) => {
        if (process.env.NODE_ENV !== 'production') {
          console.log('[OnboardingPage] onComplete', { workspaceId, redirectTo: '/dashboard?onboarded=1' })
        }
        router.replace("/dashboard?onboarded=1")
      }}
    />
  )
}
