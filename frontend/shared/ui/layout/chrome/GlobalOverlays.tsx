"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Bell, HelpCircle, X, BookOpen } from "lucide-react"

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ComprehensiveSettingsPage } from "@/frontend/shared/settings/comprehensive"
import { useIsMobile } from "@/hooks/use-mobile"



export function GlobalOverlays() {
    const [showSettings, setShowSettings] = React.useState(false)
    const [showNotifications, setShowNotifications] = React.useState(false)
    const [showHelp, setShowHelp] = React.useState(false)
    const isMobile = useIsMobile()

    const { theme, setTheme } = useTheme()

    const [initialTab, setInitialTab] = React.useState<"workspace" | "features" | "global">("workspace")
    const [initialId, setInitialId] = React.useState<string | undefined>(undefined)
    const [initialFeatureSlug, setInitialFeatureSlug] = React.useState<string | undefined>(undefined)

    React.useEffect(() => {
        // Event listeners for global triggers
        const handleOpenSettings = (e: Event) => {
            const detail = (e as CustomEvent).detail
            if (detail?.tab) setInitialTab(detail.tab)
            if (detail?.id) setInitialId(detail.id)
            if (detail?.featureSlug) setInitialFeatureSlug(detail.featureSlug)
            setShowSettings(true)
        }
        const handleOpenNotifications = () => setShowNotifications(true)
        const handleOpenHelp = () => setShowHelp(true)

        window.addEventListener("open-settings", handleOpenSettings)
        window.addEventListener("open-notifications", handleOpenNotifications)
        window.addEventListener("open-help", handleOpenHelp)

        return () => {
            window.removeEventListener("open-settings", handleOpenSettings)
            window.removeEventListener("open-notifications", handleOpenNotifications)
            window.removeEventListener("open-help", handleOpenHelp)
        }
    }, [])

    return (
        <>
            {/* Settings Dialog (Modal) */}
            <Dialog open={showSettings} onOpenChange={setShowSettings}>
                <DialogContent className="w-full h-full sm:max-w-7xl sm:h-[90vh] p-0 gap-0 overflow-hidden sm:rounded-xl">
                    <ComprehensiveSettingsPage 
                        defaultTab={initialTab} 
                        defaultId={initialId} 
                        defaultFeatureSlug={initialFeatureSlug}
                    />
                </DialogContent>
            </Dialog>

            {/* Notifications - Drawer on mobile, Sheet on desktop */}
            {isMobile ? (
                <Drawer open={showNotifications} onOpenChange={setShowNotifications}>
                    <DrawerContent className="h-[70vh]">
                        <DrawerHeader>
                            <DrawerTitle>Notifications</DrawerTitle>
                            <DrawerDescription>
                                Stay updated with the latest activity.
                            </DrawerDescription>
                        </DrawerHeader>
                        <div className="py-6 px-4">
                            <div className="flex flex-col items-center justify-center h-[200px] text-center space-y-4">
                                <div className="p-3 rounded-full bg-muted">
                                    <Bell className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <div className="space-y-1">
                                    <p className="font-medium">No new notifications</p>
                                    <p className="text-sm text-muted-foreground">You're all caught up!</p>
                                </div>
                            </div>
                        </div>
                    </DrawerContent>
                </Drawer>
            ) : (
                <Sheet open={showNotifications} onOpenChange={setShowNotifications}>
                    <SheetContent side="right" className="w-[380px]">
                        <SheetHeader>
                            <SheetTitle>Notifications</SheetTitle>
                            <SheetDescription>
                                Stay updated with the latest activity.
                            </SheetDescription>
                        </SheetHeader>
                        <div className="py-6">
                            <div className="flex flex-col items-center justify-center h-[300px] text-center space-y-4">
                                <div className="p-3 rounded-full bg-muted">
                                    <Bell className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <div className="space-y-1">
                                    <p className="font-medium">No new notifications</p>
                                    <p className="text-sm text-muted-foreground">You're all caught up!</p>
                                </div>
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
            )}

            {/* Help Dialog (Modal) */}
            <Dialog open={showHelp} onOpenChange={setShowHelp}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Help & Support</DialogTitle>
                        <DialogDescription>
                            Need assistance? We're here to help.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => window.open('https://docs.google.com', '_blank')}>
                                <BookOpen className="h-6 w-6" />
                                Documentation
                            </Button>
                            <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => window.open('mailto:support@example.com', '_blank')}>
                                <HelpCircle className="h-6 w-6" />
                                Contact Support
                            </Button>
                        </div>
                        <div className="rounded-lg bg-muted p-4 text-sm">
                            <p className="font-medium mb-1">Keyboard Shortcuts</p>
                            <div className="space-y-1 text-muted-foreground">
                                <p>Cmd+K : Command Palette</p>
                                <p>? : Show Shortcuts</p>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
