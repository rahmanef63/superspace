"use client"

import { useRouter } from "next/navigation"
import { RobustOnboardingFlow } from "@/frontend/shared/foundation/workspaces"
import { OnboardingChecklistPanel } from "@/frontend/shared/foundation/workspaces"

export default function WorkspaceOnboardingPage() {
  const router = useRouter()

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-8 md:px-8">
        <OnboardingChecklistPanel />
        <RobustOnboardingFlow
          variant="dialog"
          onComplete={async (workspaceId, enabledFeatures) => {
            if (process.env.NODE_ENV !== "production") {
              console.log("[OnboardingPage] onComplete", {
                workspaceId,
                enabledFeatures,
                redirectTo: "/dashboard/overview?onboarded=1",
              })
            }
            // TODO: Save enabled features to workspace settings/database
            router.replace("/dashboard/overview?onboarded=1")
          }}
        />
      </div>
    </div>
  )
}
