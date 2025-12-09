"use client"

import React, { useMemo, useState } from "react"
import type { Id } from "@convex/_generated/dataModel"
import { toast } from "sonner"
import {
  CheckSquare,
  Plus,
  Calendar as CalendarIcon,
  User,
  Flag,
  Trash2,
  Settings,
  Download,
  Filter,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { FeatureHeader } from "@/frontend/shared/ui/layout/header"
import { useTasks } from "../hooks/useTasks"
import type { Task, TaskPriority } from "../types"

interface TasksPageProps {
  workspaceId?: Id<"workspaces"> | null
}

const PRIORITY_OPTIONS: TaskPriority[] = ["low", "medium", "high"]

const priorityBadgeVariant: Record<TaskPriority, string> = {
  low: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  medium: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  high: "bg-red-500/10 text-red-600 dark:text-red-400",
}

const statusBadgeVariant: Record<Task["status"], string> = {
  todo: "bg-slate-500/10 text-slate-600 dark:text-slate-300",
  in_progress: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  completed: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
}

const formatDate = (timestamp: number | null | undefined) => {
  if (!timestamp) return "No due date"
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

const isOverdue = (task: Task) => {
  if (task.dueDate == null) return false
  if (task.status === "completed") return false
  return task.dueDate < Date.now()
}

const NEW_TASK_DEFAULT_STATE = {
  title: "",
  description: "",
  priority: "medium" as TaskPriority,
  dueDate: "",
}

export default function TasksPage({ workspaceId }: TasksPageProps) {
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "completed">("all")
  const [newTask, setNewTask] = useState(NEW_TASK_DEFAULT_STATE)

  const {
    tasks,
    stats,
    isLoading,
    error,
    isCreating,
    isUpdating,
    isRemoving,
    createTask,
    updateTask,
    deleteTask,
  } = useTasks(workspaceId)

  const filteredTasks = useMemo(() => {
    switch (filterStatus) {
      case "active":
        return tasks.filter((task) => task.status !== "completed")
      case "completed":
        return tasks.filter((task) => task.status === "completed")
      default:
        return tasks
    }
  }, [filterStatus, tasks])

  if (!workspaceId) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center">
          <CheckSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold">No Workspace Selected</h2>
          <p className="mt-2 text-muted-foreground">
            Select a workspace to start managing tasks.
          </p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground">Loading tasks...</div>
      </div>
    )
  }

  const handleCreateTask = async () => {
    const title = newTask.title.trim()
    if (!title) {
      toast.error("Task title is required")
      return
    }

    try {
      const dueDate = newTask.dueDate ? new Date(`${newTask.dueDate}T00:00:00`).getTime() : null
      await createTask({
        title,
        description: newTask.description.trim() || undefined,
        priority: newTask.priority,
        dueDate: dueDate ?? undefined,
      })
      toast.success("Task created")
      setNewTask(NEW_TASK_DEFAULT_STATE)
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to create task")
    }
  }

  const handleToggleStatus = async (task: Task) => {
    const nextStatus = task.status === "completed" ? "todo" : "completed"
    try {
      await updateTask(task.id, { status: nextStatus })
      toast.success(nextStatus === "completed" ? "Task completed" : "Task reopened")
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to update task status")
    }
  }

  const handleDeleteTask = async (task: Task) => {
    const confirmed = window.confirm(`Delete "${task.title}"?`)
    if (!confirmed) return

    try {
      await deleteTask(task.id)
      toast.success("Task deleted")
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to delete task")
    }
  }

  return (
    <div className="flex h-full flex-col p-6 gap-6">
      <FeatureHeader
        icon={CheckSquare}
        title="Tasks"
        subtitle="Track work, manage owners, and stay ahead of deadlines"
        badge={{ text: "Beta", variant: "secondary" }}
        primaryAction={{
          label: "New Task",
          icon: Plus,
          onClick: () => {},
        }}
        secondaryActions={[
          {
            id: "filter",
            label: "Filter",
            icon: Filter,
            onClick: () => {},
          },
          {
            id: "export",
            label: "Export",
            icon: Download,
            onClick: () => {},
          },
          {
            id: "settings",
            label: "Settings",
            icon: Settings,
            onClick: () => {},
          },
        ]}
      />

      {/* Filter bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card p-4">
        <div className="flex items-center gap-2">
          <Button
            variant={filterStatus === "all" ? "secondary" : "outline"}
            size="sm"
            onClick={() => setFilterStatus("all")}
          >
            All
          </Button>
          <Button
            variant={filterStatus === "active" ? "secondary" : "outline"}
            size="sm"
            onClick={() => setFilterStatus("active")}
          >
            Active
          </Button>
          <Button
            variant={filterStatus === "completed" ? "secondary" : "outline"}
            size="sm"
            onClick={() => setFilterStatus("completed")}
          >
            Completed
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleCreateTask}
            disabled={isCreating}
          >
            <Plus className="mr-2 h-4 w-4" />
            {isCreating ? "Creating..." : "Create Task"}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {error ? (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        ) : null}

        <div className="grid gap-4 pb-6 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold text-emerald-500">{stats.completed}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Overdue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold text-red-500">{stats.overdue}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create a task</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label htmlFor="task-title">Title</Label>
              <Input
                id="task-title"
                value={newTask.title}
                onChange={(event) => setNewTask((prev) => ({ ...prev, title: event.target.value }))}
                placeholder="e.g. Follow up with new customer leads"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="task-description">Description</Label>
              <Textarea
                id="task-description"
                value={newTask.description}
                rows={3}
                onChange={(event) =>
                  setNewTask((prev) => ({ ...prev, description: event.target.value }))
                }
                placeholder="Add more context, checklist, or links"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Priority</Label>
              <Select
                value={newTask.priority}
                onValueChange={(value: TaskPriority) =>
                  setNewTask((prev) => ({ ...prev, priority: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option === "low" && "Low"}
                      {option === "medium" && "Medium"}
                      {option === "high" && "High"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="task-due-date">Due date</Label>
              <Input
                id="task-due-date"
                type="date"
                value={newTask.dueDate}
                onChange={(event) =>
                  setNewTask((prev) => ({ ...prev, dueDate: event.target.value }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {filteredTasks.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
            <h3 className="text-lg font-semibold text-foreground">No tasks yet</h3>
            <p className="mt-2 text-sm">
              Create your first task to keep the team aligned.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTasks.map((task) => {
              const overdue = isOverdue(task)

              return (
                <Card
                  key={task.id}
                  className={overdue ? "border-red-500/40" : undefined}
                >
                  <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex flex-1 gap-4">
                      <Checkbox
                        checked={task.status === "completed"}
                        onCheckedChange={() => handleToggleStatus(task)}
                        disabled={isUpdating}
                        className="mt-1 shrink-0"
                      />
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-3">
                          <h4
                            className={`text-base font-semibold ${
                              task.status === "completed"
                                ? "text-muted-foreground line-through"
                                : ""
                            }`}
                          >
                            {task.title}
                          </h4>
                          <Badge className={statusBadgeVariant[task.status]}>
                            {task.status === "in_progress" ? "In Progress" : task.status === "todo" ? "To Do" : "Completed"}
                          </Badge>
                          <Badge className={priorityBadgeVariant[task.priority]}>
                            Priority: {task.priority}
                          </Badge>
                          {overdue ? (
                            <Badge variant="destructive">Overdue</Badge>
                          ) : null}
                        </div>
                        {task.description ? (
                          <p className="text-sm text-muted-foreground">{task.description}</p>
                        ) : null}
                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="h-4 w-4" />
                            {formatDate(task.dueDate ?? null)}
                          </span>
                          {task.assigneeId ? (
                            <span className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              Assigned
                            </span>
                          ) : null}
                          <span className="flex items-center gap-1">
                            <Flag className="h-4 w-4" />
                            Updated {formatDate(task.updatedAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteTask(task)}
                        disabled={isRemoving}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete task</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
