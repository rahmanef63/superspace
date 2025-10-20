"use client"

import { useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Search, Video, Phone, MoreVertical, Info, Settings } from "lucide-react"

interface TopBarActionsProps {
  showSearch?: boolean
  onMemberInfoClick?: () => void
  settingsSlug?: string
}

export function TopBarActions({
  showSearch,
  onMemberInfoClick,
  settingsSlug,
}: TopBarActionsProps) {
  const canOpenMember = Boolean(onMemberInfoClick)
  const router = useRouter()

  const handleOpenSettings = useCallback(() => {
    if (!settingsSlug) return
    const categoryParam = settingsSlug
    router.push(`/dashboard/settings?category=${encodeURIComponent(categoryParam)}`)
  }, [router, settingsSlug])

  return (
    <div className="flex flex-shrink-0 items-center gap-1">
      {showSearch && (
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full text-wa-muted transition-colors hover:bg-wa-hover hover:text-wa-text"
          type="button"
        >
          <Search className="h-5 w-5" />
        </Button>
      )}

      <Button
        variant="ghost"
        size="icon"
        className="hidden h-10 w-10 rounded-full text-wa-muted transition-colors hover:bg-wa-hover hover:text-wa-text sm:flex"
        type="button"
      >
        <Video className="h-5 w-5" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="hidden h-10 w-10 rounded-full text-wa-muted transition-colors hover:bg-wa-hover hover:text-wa-text sm:flex"
        type="button"
      >
        <Phone className="h-5 w-5" />
      </Button>

      {canOpenMember && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onMemberInfoClick}
          className="hidden h-10 w-10 rounded-full text-wa-muted transition-colors hover:bg-wa-hover hover:text-wa-text sm:flex"
          type="button"
        >
          <Info className="h-5 w-5" />
        </Button>
      )}

      {settingsSlug && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleOpenSettings}
          className="hidden h-10 w-10 rounded-full text-wa-muted transition-colors hover:bg-wa-hover hover:text-wa-text md:flex"
          type="button"
        >
          <Settings className="h-5 w-5" />
        </Button>
      )}

      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10 rounded-full text-wa-muted transition-colors hover:bg-wa-hover hover:text-wa-text"
        type="button"
      >
        <MoreVertical className="h-5 w-5" />
      </Button>
    </div>
  )
}
