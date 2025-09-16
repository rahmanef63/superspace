"use client"

import { SignUp } from "@clerk/nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface SignupFormProps {
  className?: string
}

export function SignupForm({ className }: SignupFormProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Create Account</CardTitle>
      </CardHeader>
      <CardContent>
        <SignUp
          routing="hash"
          afterSignUpUrl="/dashboard"
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "shadow-none border-none",
            },
          }}
        />
      </CardContent>
    </Card>
  )
}
