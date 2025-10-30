"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { SettingsView } from "./SettingsView"

interface SettingsPopupProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultCategory?: string
}

export function SettingsPopup({
  open,
  onOpenChange,
  defaultCategory,
}: SettingsPopupProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[80vh] p-0 gap-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <div className="h-full">
          <SettingsView defaultCategory={defaultCategory} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
