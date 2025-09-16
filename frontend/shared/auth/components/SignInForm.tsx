import { SignIn } from "@clerk/nextjs"

export function SignInForm() {
  return <SignIn routing="hash" afterSignInUrl="/dashboard" />
}
