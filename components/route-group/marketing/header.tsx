"use client"

import React from 'react'
import Link from 'next/link'
import { Menu, Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

/**
 * HeroHeader - Mobile-first marketing page header
 */
export function HeroHeader() {
    const { theme, setTheme } = useTheme()
    const [open, setOpen] = React.useState(false)

    const navLinks = [
        { href: "/features", label: "Features" },
        { href: "/pricing", label: "Pricing" },
        { href: "/docs", label: "Docs" },
    ]

    const ThemeIcon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-14 items-center justify-between px-4">
                {/* Logo */}
                <Link href="/" className="flex items-center space-x-2">
                    <span className="font-bold text-lg">SuperSpace</span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "transition-colors hover:text-foreground/80",
                                "text-foreground/60"
                            )}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* Right side actions */}
                <div className="flex items-center gap-2">
                    {/* Theme Toggle */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9">
                                <ThemeIcon className="h-4 w-4" />
                                <span className="sr-only">Toggle theme</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setTheme("light")}>
                                <Sun className="mr-2 h-4 w-4" />
                                Light
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTheme("dark")}>
                                <Moon className="mr-2 h-4 w-4" />
                                Dark
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTheme("system")}>
                                <Monitor className="mr-2 h-4 w-4" />
                                System
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Desktop buttons */}
                    <div className="hidden md:flex items-center gap-2">
                        <Button variant="ghost" asChild>
                            <Link href="/sign-in">Sign in</Link>
                        </Button>
                        <Button asChild>
                            <Link href="/dashboard">Get Started</Link>
                        </Button>
                    </div>

                    {/* Mobile Menu */}
                    <Sheet open={open} onOpenChange={setOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="md:hidden h-9 w-9">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Open menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[300px] sm:w-[350px] overflow-y-auto p-6">
                            <SheetHeader className="mb-6 text-left">
                                <SheetTitle className="text-xl font-bold">SuperSpace</SheetTitle>
                            </SheetHeader>
                            <nav className="flex flex-col gap-2">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setOpen(false)}
                                        className="text-lg font-medium py-3 px-2 -mx-2 rounded-md hover:bg-muted hover:text-primary transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                                
                                <div className="my-6 border-t" />
                                
                                <div className="flex flex-col gap-4">
                                    <div className="flex flex-col gap-2">
                                        <span className="text-sm font-medium text-muted-foreground">Theme</span>
                                        <div className="grid grid-cols-3 gap-2">
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                onClick={() => setTheme("light")} 
                                                className={cn("h-8", theme === "light" && "border-primary bg-primary/5 text-primary")}
                                            >
                                                <Sun className="mr-2 h-3.5 w-3.5" />
                                                Light
                                            </Button>
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                onClick={() => setTheme("dark")} 
                                                className={cn("h-8", theme === "dark" && "border-primary bg-primary/5 text-primary")}
                                            >
                                                <Moon className="mr-2 h-3.5 w-3.5" />
                                                Dark
                                            </Button>
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                onClick={() => setTheme("system")} 
                                                className={cn("h-8", theme === "system" && "border-primary bg-primary/5 text-primary")}
                                            >
                                                <Monitor className="mr-2 h-3.5 w-3.5" />
                                                System
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 mt-2">
                                        <Button variant="outline" asChild className="w-full justify-start h-10">
                                            <Link href="/sign-in" onClick={() => setOpen(false)}>
                                                Sign in
                                            </Link>
                                        </Button>
                                        <Button asChild className="w-full justify-start h-10">
                                            <Link href="/dashboard" onClick={() => setOpen(false)}>
                                                Get Started
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </nav>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    )
}

export default HeroHeader
