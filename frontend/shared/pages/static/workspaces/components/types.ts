import type { Id } from "@convex/_generated/dataModel";
import type { OnboardingData, OnboardingStepMeta } from "@/frontend/shared/pages/static/workspaces/types";

export interface MemberManagementProps {
  workspaceId: Id<"workspaces">;
  onInviteClick?: () => void;
}

export interface WorkspaceSettingsProps {
  workspaceId: Id<"workspaces">;
}

export interface OnboardingFlowProps {
  onComplete: (workspaceId: Id<"workspaces">) => void;
  variant?: "page" | "dialog";
}

export interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
}

export interface OnboardingStepProps {
  step: number;
  stepData: OnboardingStepMeta;
  workspaceData: OnboardingData;
  onDataChange: (data: OnboardingData) => void;
  onNext: () => void;
  onBack: () => void;
  onComplete: () => void;
  isLastStep: boolean;
  isFirstStep: boolean;
  isSubmitting?: boolean;
  errorMessage?: string | null;
}

export type { OnboardingData };
