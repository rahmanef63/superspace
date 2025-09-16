"use client"

import { SignIn } from "@clerk/nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface LoginFormProps {
  className?: string
}

export function LoginForm({ className }: LoginFormProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
      </CardHeader>
      <CardContent>
        <SignIn
          routing="hash"
          afterSignInUrl="/dashboard"
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
