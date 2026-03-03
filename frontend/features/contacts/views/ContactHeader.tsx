"use client"

import React from "react"
import { Contact, Plus, Settings, Upload } from "lucide-react"
import { FeatureHeader } from "@/frontend/shared/ui/layout/header"

interface ContactHeaderProps {
  onCreateContact?: () => void
  onImport?: () => void
  onSettings?: () => void
}

/**
 * ContactHeader Component
 * 
 * Consistent header for the Contacts feature.
 */
export function ContactHeader({
  onCreateContact,
  onImport,
  onSettings,
}: ContactHeaderProps) {
  return (
    <FeatureHeader
      icon={Contact}
      title="Contacts"
      subtitle="Manage your contacts and connections"
      primaryAction={{
        label: "Add Contact",
        icon: Plus,
        onClick: onCreateContact ?? (() => {}),
      }}
      secondaryActions={[
        {
          id: "import",
          label: "Import",
          icon: Upload,
          onClick: onImport ?? (() => {}),
        },
        {
          id: "settings",
          label: "Settings",
          icon: Settings,
          onClick: onSettings ?? (() => {}),
        },
      ]}
    />
  )
}

export default ContactHeader
