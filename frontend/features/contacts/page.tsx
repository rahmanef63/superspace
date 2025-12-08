"use client"

import type { Id } from "@convex/_generated/dataModel"
import ContactsPage from "./views/ContactsPage"

export interface ContactsPageProps {
  workspaceId?: Id<"workspaces"> | null
}

export default function Page({ workspaceId }: ContactsPageProps) {
  return <ContactsPage workspaceId={workspaceId} />
}
