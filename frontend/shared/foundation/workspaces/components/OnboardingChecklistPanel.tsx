"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Database, Table2 } from "lucide-react"

const CHECKLIST_STEPS = [
  {
    title: "Create your workspace",
    description: "Pick a name and choose what you want to enable.",
    icon: CheckCircle2,
    status: "current",
  },
  {
    title: "Create your first database",
    description: "Start from a blank table or a starter template.",
    icon: Database,
    status: "next",
  },
  {
    title: "Add your first row",
    description: "Add a record so your workspace has real data.",
    icon: Table2,
    status: "next",
  },
] as const

export function OnboardingChecklistPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Getting started</CardTitle>
        <CardDescription>Three quick steps to your first success.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {CHECKLIST_STEPS.map((step, index) => {
          const StepIcon = step.icon
          const isCurrent = step.status === "current"
          return (
            <div key={step.title} className="flex items-start gap-3">
              <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full border bg-background">
                <StepIcon className={isCurrent ? "h-4 w-4 text-primary" : "h-4 w-4 text-muted-foreground"} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {index + 1}. {step.title}
                  </span>
                  {isCurrent ? (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      Current
                    </span>
                  ) : null}
                </div>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
