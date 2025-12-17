/**
 * Example Tasks Page with Export/Import Integration
 * Demonstrates how to use the export/import system in a real feature
 */

import React, { useState, useEffect } from "react"
import { FeatureHeader } from "@/frontend/shared/ui/layout/header/presets"
import { FeatureExportImport } from "@/frontend/shared/foundation/utils/data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Filter, MoreHorizontal, CheckSquare, Check } from "lucide-react"
import type { HeaderAction } from "@/frontend/shared/ui/layout/header/types"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Mock data
const mockTasks = [
  {
    _id: "1",
    title: "Complete project documentation",
    status: "todo",
    priority: "medium",
    assignee: "John Doe",
    project: "Website Redesign",
    dueDate: "2024-12-25",
  },
  {
    _id: "2",
    title: "Review pull requests",
    status: "in-progress",
    priority: "high",
    assignee: "Jane Smith",
    project: "Website Redesign",
    dueDate: "2024-12-20",
  },
  {
    _id: "3",
    title: "Setup CI/CD pipeline",
    status: "review",
    priority: "high",
    assignee: "Bob Johnson",
    project: "Infrastructure",
    dueDate: "2024-12-22",
  },
  {
    _id: "4",
    title: "Update dependencies",
    status: "done",
    priority: "low",
    assignee: "Alice Brown",
    project: "Infrastructure",
    dueDate: "2024-12-15",
  },
]

export function TasksPageWithExportImport() {
  const [tasks, setTasks] = useState(mockTasks)
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  // Handle selection
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTaskIds(tasks.map(task => task._id))
    } else {
      setSelectedTaskIds([])
    }
  }

  const handleSelectTask = (taskId: string, checked: boolean) => {
    if (checked) {
      setSelectedTaskIds(prev => [...prev, taskId])
    } else {
      setSelectedTaskIds(prev => prev.filter(id => id !== taskId))
    }
  }

  // Status and priority badge colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case "done":
        return "bg-green-500"
      case "in-progress":
        return "bg-blue-500"
      case "review":
        return "bg-purple-500"
      case "todo":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500"
      case "high":
        return "bg-orange-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  // Filter tasks
  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.assignee.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.status.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Feature Header with Export/Import */}
      <FeatureHeader
        title="Tasks"
        subtitle="Manage and track your team's tasks"
        icon={CheckSquare}
        badge={{
          text: "Beta",
          variant: "secondary",
        }}
        meta={[
          {
            label: "Total Tasks",
            value: tasks.length,
            icon: CheckSquare,
          },
          {
            label: "Selected",
            value: selectedTaskIds.length,
            icon: Check,
          },
        ]}
        primaryAction={{
          label: "Add Task",
          icon: Plus,
          onClick: () =>
}
