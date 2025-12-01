import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import type { OnboardingProgressProps } from "./types"

const STEP_LABELS = ["Welcome", "Details", "Template", "Features"]

export function OnboardingProgress({ currentStep, totalSteps }: OnboardingProgressProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-center">
        {Array.from({ length: totalSteps }, (_, index) => {
          const isCompleted = index < currentStep
          const isCurrent = index === currentStep
          
          return (
            <div key={index} className="flex items-center">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300",
                    isCompleted 
                      ? "bg-primary text-primary-foreground"
                      : isCurrent
                        ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                        : "bg-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                {/* Step Label */}
                <span className={cn(
                  "mt-2 text-xs font-medium",
                  isCurrent ? "text-primary" : "text-muted-foreground"
                )}>
                  {STEP_LABELS[index] || `Step ${index + 1}`}
                </span>
              </div>
              
              {/* Connector Line */}
              {index < totalSteps - 1 && (
                <div
                  className={cn(
                    "w-16 md:w-24 h-1 mx-2 rounded-full transition-all duration-300",
                    index < currentStep 
                      ? "bg-primary" 
                      : "bg-muted"
                  )}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
