import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center p-6">
      <SignUp
        path="/sign-up"
        routing="path"
        signInUrl="/sign-in"
        fallbackRedirectUrl="/dashboard/overview"
        forceRedirectUrl="/dashboard/overview"
      />
    </div>
  );
}
