"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Plus, Folder } from "lucide-react"

interface PageItem {
  id: string
  title: string
  type: "page" | "folder"
  children?: PageItem[]
}

interface PageSidebarProps {
  className?: string
}

export function PageSidebar({ className }: PageSidebarProps) {
  const mockPages: PageItem[] = [
    {
      id: "1",
      title: "Home",
      type: "page",
    },
    {
      id: "2",
      title: "About",
      type: "folder",
      children: [
        { id: "3", title: "Team", type: "page" },
        { id: "4", title: "History", type: "page" },
      ],
    },
  ]

  const renderPageItem = (item: PageItem, level = 0) => (
    <div key={item.id} style={{ paddingLeft: `${level * 16}px` }}>
      <div className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer">
        {item.type === "folder" ? <Folder className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
        <span className="text-sm">{item.title}</span>
      </div>
      {item.children?.map((child) => renderPageItem(child, level + 1))}
    </div>
  )

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Pages
          <Button variant="ghost" size="sm">
            <Plus className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">{mockPages.map((page) => renderPageItem(page))}</div>
      </CardContent>
    </Card>
  )
}
