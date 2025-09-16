"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { OnboardingProgress } from "./OnboardingProgress";
import { OnboardingStep } from "./OnboardingStep";
import type { OnboardingData } from "@/frontend/shared/pages/static/workspaces/types";
import type { OnboardingFlowProps } from "./types";

export function OnboardingFlow({ onComplete, variant = "page" }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [workspaceData, setWorkspaceData] = useState<OnboardingData>({
    name: "",
    type: "personal",
    description: "",
  });

  const createWorkspace = useMutation(api.workspace.workspaces.createWorkspace);

  const steps = [
    {
      title: "Welcome to Your Workspace",
      description: "Let's set up your first workspace to get started",
    },
    {
      title: "Workspace Details",
      description: "Tell us about your workspace",
    },
    {
      title: "Choose Features",
      description: "Select the features you want to enable",
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (process.env.NODE_ENV !== "production") {
      console.log("[Onboarding] Submitting workspace", {
        name: workspaceData.name,
        type: workspaceData.type,
        description: workspaceData.description,
      });
    }
    // Normalize the slug the same way the server does
    const slugify = (s: string) =>
      String(s || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\-\s]/g, "-")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

    const base = slugify(workspaceData.name) || "workspace";

    // Try to create, appending -2, -3, ... if the server reports a duplicate
    let attempt = 0;
    while (attempt < 10) {
      const candidate = attempt === 0 ? base : `${base}-${attempt + 1}`;
      try {
        if (process.env.NODE_ENV !== "production") {
          console.debug("[Onboarding] Attempt create", { attempt: attempt + 1, slug: candidate });
        }
        const workspaceId = await createWorkspace({
          name: workspaceData.name,
          slug: candidate,
          type: workspaceData.type,
          description: workspaceData.description,
          isPublic: false,
        });
        if (process.env.NODE_ENV !== "production") {
          console.log("[Onboarding] Workspace created", { workspaceId, slug: candidate });
        }
        onComplete(workspaceId);
        return;
      } catch (error: any) {
        const msg = String(error?.message || error);
        const duplicate = msg.includes("slug already exists") || (msg.includes("slug") && msg.includes("exists"));
        if (!duplicate) {
          console.error("[Onboarding] Failed to create workspace:", error);
          break;
        }
        attempt += 1;
      }
    }
  };

  if (variant === "dialog") {
    return (
      <div className="w-full">
        <OnboardingProgress currentStep={currentStep} totalSteps={steps.length} />
        <div className="bg-background rounded-lg border border-gray-200 p-6 mt-6">
          <OnboardingStep
            step={currentStep}
            stepData={steps[currentStep]}
            workspaceData={workspaceData}
            onDataChange={setWorkspaceData}
            onNext={handleNext}
            onBack={handleBack}
            onComplete={handleComplete}
            isLastStep={currentStep === steps.length - 1}
            isFirstStep={currentStep === 0}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <OnboardingProgress currentStep={currentStep} totalSteps={steps.length} />
        <div className="bg-background rounded-lg shadow-sm border border-gray-200 p-8 mt-6">
          <OnboardingStep
            step={currentStep}
            stepData={steps[currentStep]}
            workspaceData={workspaceData}
            onDataChange={setWorkspaceData}
            onNext={handleNext}
            onBack={handleBack}
            onComplete={handleComplete}
            isLastStep={currentStep === steps.length - 1}
            isFirstStep={currentStep === 0}
          />
        </div>
      </div>
    </div>
  );
}
