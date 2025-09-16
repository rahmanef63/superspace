import { ArrowRight, ArrowLeft, Check, Loader2 } from "lucide-react";
import type { OnboardingStepProps } from "./types";

export function OnboardingStep({
  step,
  stepData,
  workspaceData,
  onDataChange,
  onNext,
  onBack,
  onComplete,
  isLastStep,
  isFirstStep,
  isSubmitting = false,
  errorMessage,
}: OnboardingStepProps) {
  const renderStepContent = () => {
    switch (step) {
      case 0:
        return (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <div className="h-8 w-8 rounded-full bg-blue-600" />
            </div>
            <h2 className="mb-2 text-2xl font-bold">{stepData.title}</h2>
            <p className="mb-8 text-gray-600">{stepData.description}</p>
          </div>
        );

      case 1:
        return (
          <div>
            <h2 className="mb-2 text-2xl font-bold">{stepData.title}</h2>
            <p className="mb-6 text-gray-600">{stepData.description}</p>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Workspace Name
                </label>
                <input
                  type="text"
                  value={workspaceData.name}
                  onChange={(e) => onDataChange({ ...workspaceData, name: e.target.value })}
                  placeholder="My Awesome Workspace"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Workspace Type
                </label>
                <select
                  value={workspaceData.type}
                  onChange={(e) => onDataChange({ ...workspaceData, type: e.target.value as any })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="personal">Personal</option>
                  <option value="organization">Organization</option>
                  <option value="institution">Institution</option>
                  <option value="group">Group</option>
                  <option value="family">Family</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Description (Optional)
                </label>
                <textarea
                  value={workspaceData.description}
                  onChange={(e) => onDataChange({ ...workspaceData, description: e.target.value })}
                  placeholder="Describe your workspace..."
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div>
            <h2 className="mb-2 text-2xl font-bold">{stepData.title}</h2>
            <p className="mb-6 text-gray-600">{stepData.description}</p>

            <div className="space-y-4">
              {[
                {
                  title: "Chat & Messaging",
                  description: "Real-time communication with your workspace",
                },
                {
                  title: "Canvas & Collaboration",
                  description: "Visual collaboration and brainstorming",
                },
                {
                  title: "Document Management",
                  description: "Create and manage documents",
                },
              ].map((feature) => (
                <div key={feature.title} className="rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{feature.title}</h3>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </div>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      {renderStepContent()}

      {errorMessage ? (
        <div className="mt-6 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {errorMessage}
        </div>
      ) : null}

      <div className="mt-8 flex items-center justify-between">
        <button
          onClick={onBack}
          disabled={isFirstStep || isSubmitting}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 ${
            isFirstStep || isSubmitting
              ? "cursor-not-allowed text-gray-400"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        {isLastStep ? (
          <button
            onClick={onComplete}
            disabled={!workspaceData.name || isSubmitting}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-primary hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            {isSubmitting ? "Creating..." : "Complete Setup"}
          </button>
        ) : (
          <button
            onClick={onNext}
            disabled={(step === 1 && !workspaceData.name) || isSubmitting}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-primary hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
