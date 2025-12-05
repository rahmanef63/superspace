/**
 * Icon Picker Component
 * Allows users to select an icon for their AI chat session
 */

"use client"

import { useState } from "react"
import * as LucideIcons from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

const popularIcons = [
  "MessageSquare",
  "Bot",
  "Sparkles",
  "Brain",
  "Lightbulb",
  "Zap",
  "Code",
  "Database",
  "FileText",
  "Inbox",
  "Mail",
  "Calendar",
  "Clock",
  "Star",
  "Heart",
  "Bookmark",
  "Search",
  "Settings",
  "User",
  "Users",
  "Building",
  "Home",
  "Briefcase",
  "ShoppingCart",
  "CreditCard",
  "DollarSign",
  "TrendingUp",
  "BarChart",
  "PieChart",
  "Activity",
  "Target",
  "Award",
  "CheckCircle",
  "AlertCircle",
  "Info",
  "HelpCircle",
  "Shield",
  "Lock",
  "Unlock",
  "Eye",
  "EyeOff",
  "Bell",
  "Volume2",
  "Play",
  "Pause",
  "Music",
  "Image",
  "Video",
  "Camera",
  "MapPin",
  "Globe",
  "Compass",
  "Layers",
  "Package",
  "Gift",
  "Truck",
  "Plane",
  "Rocket",
]

interface IconPickerProps {
  value?: string
  onValueChange: (icon: string) => void
  className?: string
}

export function IconPicker({ value, onValueChange, className }: IconPickerProps) {
  const [search, setSearch] = useState("")
  const [open, setOpen] = useState(false)

  const filteredIcons = popularIcons.filter(icon =>
    icon.toLowerCase().includes(search.toLowerCase())
  )

  const SelectedIcon = value && value in LucideIcons 
    ? (LucideIcons as any)[value] 
    : LucideIcons.Bot

  const renderIcon = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName]
    return Icon ? <Icon className="h-4 w-4" /> : null
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "h-9 w-9 p-0 justify-center",
            className
          )}
        >
          <SelectedIcon className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="start">
        <div className="p-3 border-b">
          <Input
            placeholder="Search icons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8"
          />
        </div>
        <ScrollArea className="h-[280px]">
          <div className="grid grid-cols-6 gap-2 p-3">
            {filteredIcons.map((iconName) => (
              <button
                key={iconName}
                onClick={() => {
                  onValueChange(iconName)
                  setOpen(false)
                }}
                className={cn(
                  "h-10 w-10 flex items-center justify-center rounded-md border border-transparent hover:border-primary hover:bg-accent transition-colors",
                  value === iconName && "bg-accent border-primary"
                )}
                title={iconName}
              >
                {renderIcon(iconName)}
              </button>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
