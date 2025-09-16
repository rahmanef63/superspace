"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Save, Eye, Settings } from "lucide-react"

interface PageEditorProps {
  className?: string
}

export function PageEditor({ className }: PageEditorProps) {
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [content, setContent] = useState("")

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Page Editor</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input placeholder="Page title..." value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input placeholder="page-slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
        </div>
        <Textarea
          placeholder="Page content..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={12}
        />
        <div className="flex gap-2">
          <Button>
            <Save className="h-4 w-4 mr-2" />
            Save Page
          </Button>
          <Button variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
