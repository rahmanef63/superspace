/**
 * Example Task List Component with Export/Import Functionality
 * Demonstrates how to integrate the export/import system
 */

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ExportButton } from "@/frontend/shared/ui/data-export"
import { ImportDialog } from "@/frontend/shared/ui/data-export"
import { Upload, RefreshCw } from "lucide-react"
import { useExportImport } from "@/frontend/shared/hooks/useExportImport"

// Mock data
const mockTasks = [
  {
    id: "1",
    title: "Setup project repository",
    status: "done",
    priority: "high",
    assignee: "John Doe",
    dueDate: "2024-01-15",
  },
  {
    id: "2",
    title: "Design user authentication",
    status: "in-progress",
    priority: "high",
    assignee: "Jane Smith",
    dueDate: "2024-01-20",
  },
  {
    id: "3",
    title: "Implement API endpoints",
    status: "todo",
    priority: "medium",
    assignee: "Bob Johnson",
    dueDate: "2024-01-25",
  },
]

export function TaskListWithExport() {
  const [tasks, setTasks] = useState(mockTasks)
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([])
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const { exportSelectedData, importFromFile, validateImportFile } = useExportImport("tasks")

  // Handle selection
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTaskIds(tasks.map(task => task.id))
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

  // Handle import
  const handleImportComplete = async (result: any) => {
    if (result.success) {
      // Refresh the task list
      // In a real app, you'd refetch from the database
      console.log("Import completed:", result)
    }
  }

  // Handle file import
  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file
    const isValid = await validateImportFile("tasks", file)
    if (!isValid) {
      alert("Invalid file format or structure")
      return
    }

    // Import file
    try {
      const result = await importFromFile("tasks", file, {
        skipFirstRow: true,
        updateExisting: true,
        createMissing: true,
      })

      handleImportComplete(result)
    } catch (error) {
      console.error("Import failed:", error)
      alert("Import failed. Please check the file format.")
    }
  }

  // Filter tasks
  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.assignee.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.status.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Status badge colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case "done":
        return "bg-green-500"
      case "in-progress":
        return "bg-blue-500"
      case "todo":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  // Priority badge colors
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Tasks</CardTitle>
          <div className="flex items-center gap-2">
            <ExportButton
              featureId="tasks"
              showOptions={true}
              disabled={selectedTaskIds.length === 0}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsImportDialogOpen(true)}
            >
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          {selectedTaskIds.length > 0 && (
            <Badge variant="secondary">
              {selectedTaskIds.length} selected
            </Badge>
          )}
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
              <TableHead>Due Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedTaskIds.includes(task.id)}
                    onCheckedChange={(checked) => handleSelectTask(task.id, !!checked)}
                  />
                </TableCell>
                <TableCell className="font-medium">{task.title}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(task.status)}>
                    {task.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getPriorityColor(task.priority)}>
                    {task.priority}
                  </Badge>
                </TableCell>
                <TableCell>{task.assignee}</TableCell>
                <TableCell>{task.dueDate}</TableCell>
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

      {/* Import Dialog */}
      <ImportDialog
        featureId="tasks"
        isOpen={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
        onImportComplete={handleImportComplete}
        allowedFormats={["json", "csv"]}
        maxFileSize={10 * 1024 * 1024} // 10MB
      />
    </Card>
  )
}