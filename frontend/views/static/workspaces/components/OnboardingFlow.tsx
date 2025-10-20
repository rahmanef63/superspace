"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { OnboardingProgress } from "./OnboardingProgress";
import { OnboardingStep } from "./OnboardingStep";
import type { OnboardingData } from "@/frontend/views/static/workspaces/types";
import type { OnboardingFlowProps } from "./types";

export function OnboardingFlow({ onComplete, variant = "page" }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [workspaceData, setWorkspaceData] = useState<OnboardingData>({
    name: "",
    type: "personal",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  let clerkAuth: { isSignedIn?: boolean } | undefined
  try {
    clerkAuth = useUser()
  } catch (err) {
    console.warn("[Onboarding] Clerk unavailable, treating user as signed out", err)
  }
  const isSignedIn = Boolean(clerkAuth?.isSignedIn);

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
      setSubmitError(null);
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0 && !isSubmitting) {
      setSubmitError(null);
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (!isSignedIn) {
      setSubmitError("You need to sign in before creating a workspace.");
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);

    const slugify = (s: string) =>
      String(s || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\-\s]/g, "")
        .replace(/\s+/g, "")
        .replace(/-+/g, "")
        .replace(/^-|-$/g, "");

    const base = slugify(workspaceData.name) || "workspace";

    let attempt = 0;
    while (attempt < 10) {
      const candidate = attempt === 0 ? base : `${base}-${attempt + 1}`;
      try {
        const workspaceId = await createWorkspace({
          name: workspaceData.name,
          slug: candidate,
          type: workspaceData.type,
          description: workspaceData.description,
          isPublic: false,
        });
        onComplete(workspaceId);
        setIsSubmitting(false);
        return;
      } catch (error: any) {
        const msg = String(error?.message || error);
        const duplicate = msg.includes("slug already exists") || (msg.includes("slug") && msg.includes("exists"));
        const unauthenticated = msg.toLowerCase().includes("not authenticated");
        if (unauthenticated) {
          setSubmitError("Authentication expired. Please sign in again and retry.");
          break;
        }
        if (!duplicate) {
          setSubmitError("We couldn't create the workspace. Please try again.");
          break;
        }
        attempt += 1;
      }
    }

    setIsSubmitting(false);
  };

  const commonStepProps = {
    step: currentStep,
    stepData: steps[currentStep],
    workspaceData,
    onDataChange: setWorkspaceData,
    onNext: handleNext,
    onBack: handleBack,
    onComplete: handleComplete,
    isLastStep: currentStep === steps.length - 1,
    isFirstStep: currentStep === 0,
    isSubmitting,
    errorMessage: submitError,
  } as const;

  if (variant === "dialog") {
    return (
      <div className="w-full">
        <OnboardingProgress currentStep={currentStep} totalSteps={steps.length} />
        <div className="mt-6 rounded-lg border border-gray-200 bg-background p-6">
          <OnboardingStep {...commonStepProps} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-2xl">
        <OnboardingProgress currentStep={currentStep} totalSteps={steps.length} />
        <div className="mt-6 rounded-lg border border-gray-200 bg-background p-8 shadow-sm">
          <OnboardingStep {...commonStepProps} />
        </div>
      </div>
    </div>
  );
}

