import { ArrowRight, ArrowLeft, Check } from "lucide-react";
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
}: OnboardingStepProps) {
  const renderStepContent = () => {
    switch (step) {
      case 0:
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-full"></div>
            </div>
            <h2 className="text-2xl font-bold mb-2">{stepData.title}</h2>
            <p className="text-gray-600 mb-8">{stepData.description}</p>
          </div>
        );

      case 1:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-2">{stepData.title}</h2>
            <p className="text-gray-600 mb-6">{stepData.description}</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Workspace Name
                </label>
                <input
                  type="text"
                  value={workspaceData.name}
                  onChange={(e) => onDataChange({ ...workspaceData, name: e.target.value })}
                  placeholder="My Awesome Workspace"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Workspace Type
                </label>
                <select
                  value={workspaceData.type}
                  onChange={(e) => onDataChange({ ...workspaceData, type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="personal">Personal</option>
                  <option value="organization">Organization</option>
                  <option value="institution">Institution</option>
                  <option value="group">Group</option>
                  <option value="family">Family</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={workspaceData.description}
                  onChange={(e) => onDataChange({ ...workspaceData, description: e.target.value })}
                  placeholder="Describe your workspace..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-2">{stepData.title}</h2>
            <p className="text-gray-600 mb-6">{stepData.description}</p>
            
            <div className="space-y-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Chat & Messaging</h3>
                    <p className="text-sm text-gray-600">Real-time communication with your workspace</p>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
              </div>
              
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Canvas & Collaboration</h3>
                    <p className="text-sm text-gray-600">Visual collaboration and brainstorming</p>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
              </div>
              
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Document Management</h3>
                    <p className="text-sm text-gray-600">Create and manage documents</p>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
              </div>
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
      
      <div className="flex items-center justify-between mt-8">
        <button
          onClick={onBack}
          disabled={isFirstStep}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            isFirstStep
              ? "text-gray-400 cursor-not-allowed"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        
        {isLastStep ? (
          <button
            onClick={onComplete}
            disabled={!workspaceData.name}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-primary rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check className="w-4 h-4" />
            Complete Setup
          </button>
        ) : (
          <button
            onClick={onNext}
            disabled={step === 1 && !workspaceData.name}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-primary rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
