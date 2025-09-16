'use client'

import React from 'react'
import { useClerk } from '@clerk/nextjs'

type SafeSignOutButtonProps = {
  children: React.ReactNode
  redirectUrl?: string
}

export function SafeSignOutButton({ children, redirectUrl = '/' }: SafeSignOutButtonProps) {
  const { signOut } = useClerk()

  const onClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await signOut({ redirectUrl })
    } catch (err) {
      // Swallow dev-time errors (e.g., Windows FS ENOENT) and hard redirect.
      try {
        window.location.assign(redirectUrl)
      } catch {}
    }
  }

  return <span onClick={onClick}>{children}</span>
}

export default SafeSignOutButton
