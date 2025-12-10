import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { HeroHeader } from "./header"
import { Sparkle } from 'lucide-react'

export default function HeroSection() {
    return (
        <>
            <HeroHeader />
            <main>
                <section className="">
                    <div className="py-20 md:py-36">
                        <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
                            <div>
                                <Link
                                    href="#"
                                    className="hover:bg-foreground/5 mx-auto flex w-fit items-center justify-center gap-2 rounded-md py-0.5 pl-1 pr-3 transition-colors duration-150">
                                    <div
                                        aria-hidden
                                        className="border-background bg-linear-to-b dark:inset-shadow-2xs to-foreground from-primary relative flex size-5 items-center justify-center rounded border shadow-md shadow-black/20 ring-1 ring-black/10">
                                        <div className="absolute inset-x-0 inset-y-1.5 border-y border-dotted border-white/25"></div>
                                        <div className="absolute inset-x-1.5 inset-y-0 border-x border-dotted border-white/25"></div>
                                        <Sparkle className="size-3 fill-background stroke-background drop-shadow" />
                                    </div>
                                    <span className="font-medium">Introducing SuperSpace</span>
                                </Link>
                                <h1 className="mx-auto mt-8 max-w-3xl text-balance text-4xl font-bold tracking-tight sm:text-5xl">The Modular SaaS Platform for Modern Teams</h1>
                                <p className="text-muted-foreground mx-auto my-6 max-w-xl text-balance text-xl">Built with Next.js 15, Convex, and Clerk. Experience a truly modular, feature-based architecture that scales with your needs.</p>

                                <div className="flex flex-wrap items-center justify-center gap-3">
                                    <Button
                                        asChild
                                        size="lg">
                                        <Link href="/dashboard">
                                            <span className="text-nowrap">Get Started</span>
                                        </Link>
                                    </Button>
                                    <Button
                                        asChild
                                        size="lg"
                                        variant="outline">
                                        <Link href="/mock-dashboard">
                                            <span className="text-nowrap">Try Demo</span>
                                        </Link>
                                    </Button>
                                    <Button
                                        asChild
                                        size="lg"
                                        variant="ghost">
                                        <Link href="/docs">
                                            <span className="text-nowrap">View Docs</span>
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </>
    )
}
