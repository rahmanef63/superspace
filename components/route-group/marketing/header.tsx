"use client"

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * HeroHeader - Marketing page header
 */
export function HeroHeader() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center">
                <div className="mr-4 flex">
                    <Link href="/" className="mr-6 flex items-center space-x-2">
                        <span className="font-bold">SuperSpace</span>
                    </Link>
                    <nav className="flex items-center space-x-6 text-sm font-medium">
                        <Link
                            href="/features"
                            className={cn(
                                "transition-colors hover:text-foreground/80",
                                "text-foreground/60"
                            )}
                        >
                            Features
                        </Link>
                        <Link
                            href="/pricing"
                            className={cn(
                                "transition-colors hover:text-foreground/80",
                                "text-foreground/60"
                            )}
                        >
                            Pricing
                        </Link>
                        <Link
                            href="/docs"
                            className={cn(
                                "transition-colors hover:text-foreground/80",
                                "text-foreground/60"
                            )}
                        >
                            Docs
                        </Link>
                    </nav>
                </div>
                <div className="flex flex-1 items-center justify-end space-x-2">
                    <Button variant="ghost" asChild>
                        <Link href="/sign-in">Sign in</Link>
                    </Button>
                    <Button asChild>
                        <Link href="/dashboard">Get Started</Link>
                    </Button>
                </div>
            </div>
        </header>
    )
}

export default HeroHeader
