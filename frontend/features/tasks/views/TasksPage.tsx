"use client"

import React, { useState } from "react"
import { useTasks } from "../hooks/useTasks"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { CheckSquare, Plus, Filter, Calendar, User, Flag } from "lucide-react"
import FeatureBadge from "@/frontend/shared/components/FeatureBadge"
import FeatureNotReady from "@/frontend/shared/components/FeatureNotReady"

/**
 * Tasks Page Component
 * Task management and tracking
 */
export default function TasksPage() {
  const { isLoading, error } = useTasks()
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all')

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading tasks...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-destructive">Error: {error.message}</div>
      </div>
    )
  }

  // Mock tasks for demo
  const mockTasks = [
    {
      id: "1",
      title: "Implement user authentication",
      description: "Add OAuth and SSO support",
      status: "in_progress",
      priority: "high",
      assignee: "John Doe",
      dueDate: "2025-01-25",
      completed: false
    },
    {
      id: "2",
      title: "Design landing page",
      description: "Create wireframes and mockups",
      status: "completed",
      priority: "medium",
      assignee: "Jane Smith",
      dueDate: "2025-01-20",
      completed: true
    },
    {
      id: "3",
      title: "Write API documentation",
      description: "Document all endpoints",
      status: "todo",
      priority: "low",
      assignee: "Bob Johnson",
      dueDate: "2025-02-01",
      completed: false
    },
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500'
      case 'medium': return 'text-yellow-500'
      case 'low': return 'text-blue-500'
      default: return 'text-gray-500'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge className="bg-green-500">Completed</Badge>
      case 'in_progress': return <Badge className="bg-blue-500">In Progress</Badge>
      case 'todo': return <Badge variant="outline">To Do</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b bg-background p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <CheckSquare className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Tasks</h1>
              <p className="text-sm text-muted-foreground">
                Task management and project tracking
              </p>
            </div>
          </div>
          <FeatureBadge status="development" />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant={filterStatus === 'all' ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('all')}
            >
              All Tasks
            </Button>
            <Button
              variant={filterStatus === 'active' ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('active')}
            >
              Active
            </Button>
            <Button
              variant={filterStatus === 'completed' ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('completed')}
            >
              Completed
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" disabled>
              <Filter className="h-4 w-4" />
            </Button>
            <Button disabled>
              <Plus className="mr-2 h-4 w-4" />
              New Task
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <FeatureNotReady
          featureName="Tasks"
          featureSlug="tasks"
          status="development"
          message="The task management feature is currently in development. Coming soon with task creation and assignment, project boards and kanban views, task dependencies and subtasks, time tracking and estimates, team collaboration, and progress reports and analytics."
          expectedRelease="Q2 2025"
        />

        {/* Preview UI */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Preview: Task List</h3>
          <div className="space-y-3">
            {mockTasks.map((task) => (
              <Card key={task.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Checkbox
                      checked={task.completed}
                      disabled
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className={`font-semibold mb-1 ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                            {task.title}
                          </h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            {task.description}
                          </p>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              {task.assignee}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(task.dueDate).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <Flag className={`h-4 w-4 ${getPriorityColor(task.priority)}`} />
                              <span className="capitalize">{task.priority}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(task.status)}
                          <Badge variant="outline" className="opacity-50">
                            Preview
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Stats Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockTasks.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">
                  {mockTasks.filter(t => t.completed).length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-500">
                  {mockTasks.filter(t => t.status === 'in_progress').length}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
