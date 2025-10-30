import React, { useState } from 'react'
import { SignIn, SignUp } from '@clerk/nextjs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useResponsive } from "../../hooks/useResponsive"

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'signin' | 'signup';
}

export function AuthModal({ isOpen, onClose, defaultMode = 'signin' }: AuthModalProps) {
  const { isMobile } = useResponsive()
  const [mode, setMode] = useState<'signin' | 'signup'>(defaultMode)

  const switchMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin')
  };
  const AuthForm = () => (
    <div className="space-y-4">
      {mode === 'signup' ? (
        <SignUp signInUrl="/" routing="hash" afterSignUpUrl="/dashboard" />
      ) : (
        <SignIn signUpUrl="/" routing="hash" afterSignInUrl="/dashboard" />
      )}
      <div className="text-center">
        <button
          type="button"
          onClick={switchMode}
          className="text-sm text-blue-600 hover:text-blue-800 underline"
        >
          {mode === 'signup'
            ? "Already have an account? Sign in"
            : "Don't have an account? Sign up"}
        </button>
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="bottom" className="px-4 pb-4">
          <SheetHeader className="text-center">
            <SheetTitle>
              {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
            </SheetTitle>
            <SheetDescription>
              {mode === 'signup' 
                ? 'Join WorkspaceHub to collaborate with your workspace'
                : 'Sign in to your WorkspaceHub account'
              }
            </SheetDescription>
          </SheetHeader>
          <AuthForm />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'signup' 
              ? 'Join WorkspaceHub to collaborate with your workspace'
              : 'Sign in to your WorkspaceHub account'
            }
          </DialogDescription>
        </DialogHeader>
        <AuthForm />
      </DialogContent>
    </Dialog>
  );
}
