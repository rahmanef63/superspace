/**
 * Example Tasks Page with Export/Import Integration
 * Demonstrates how to use the export/import system in a real feature
 */

import React, { useState, useEffect } from "react"
import { FeatureHeader } from "@/frontend/shared/ui/layout/header/presets"
import { FeatureExportImport } from "@/frontend/shared/ui/data-export/FeatureHeaderActions"
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
import { Plus, Filter, MoreHorizontal } from "lucide-react"
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
        icon="CheckSquare"
        badge={{
          text: "Beta",
          variant: "secondary",
        }}
        meta={[
          {
            label: `${tasks.length} total`,
            icon: "CheckSquare",
          },
          {
            label: `${selectedTaskIds.length} selected`,
            icon: "Check",
          },
        ]}
        primaryAction={{
          label: "Add Task",
          icon: Plus,
          onClick: () => console.log("Add task"),
        }}
        secondaryActions={[
          // Export/Import buttons
          <FeatureExportImport
            key="export-import"
            featureId="tasks"
            variant="separate"
            selectedIds={selectedTaskIds}
          />,
          // Other actions
          {
            id: "filter",
            label: "Filter",
            icon: Filter,
            onClick: () => console.log("Open filters"),
            variant: "outline",
          },
        ]}
      />

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Tasks</CardTitle>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedTaskIds.length === tasks.length}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.map((task) => (
                <TableRow key={task._id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedTaskIds.includes(task._id)}
                      onCheckedChange={(checked) => handleSelectTask(task._id, !!checked)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{task.title}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(task.status)}>
                      {task.status.replace("-", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>{task.assignee}</TableCell>
                  <TableCell>{task.project}</TableCell>
                  <TableCell>{task.dueDate}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => console.log("Edit task", task._id)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => console.log("Duplicate task", task._id)}>
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => console.log("Delete task", task._id)}>
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredTasks.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No tasks found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
