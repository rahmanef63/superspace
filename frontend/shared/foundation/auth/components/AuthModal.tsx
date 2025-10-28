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
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
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
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent className="px-4 pb-4">
          <DrawerHeader className="text-center">
            <DrawerTitle>
              {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
            </DrawerTitle>
            <DrawerDescription>
              {mode === 'signup' 
                ? 'Join WorkspaceHub to collaborate with your workspace'
                : 'Sign in to your WorkspaceHub account'
              }
            </DrawerDescription>
          </DrawerHeader>
          <AuthForm />
        </DrawerContent>
      </Drawer>
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
