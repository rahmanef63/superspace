/**
 * Tasks Feature Preview
 * 
 * Shows what the upcoming Tasks feature will look like
 * with kanban boards, timeline views, and team assignments
 */

"use client"

import * as React from 'react'
import { useState } from 'react'
import {
  CheckSquare,
  Plus,
  Filter,
  LayoutGrid,
  List,
  Calendar,
  Clock,
  User,
  Tag,
  MoreHorizontal,
  Circle,
  CheckCircle2,
  AlertCircle,
  ArrowRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Checkbox } from '@/components/ui/checkbox'
import { defineFeaturePreview } from '@/frontend/shared/preview'
import type { FeaturePreviewProps } from '@/frontend/shared/preview'

interface Task {
  id: string
  title: string
  status: 'todo' | 'in-progress' | 'done'
  priority: 'low' | 'medium' | 'high'
  assignee: string
  dueDate: string
  tags: string[]
}

interface TasksMockData {
  stats: { total: number; completed: number; inProgress: number; overdue: number }
  tasks: Task[]
  view: 'list' | 'board' | 'calendar'
}

function TasksPreview({ mockData, compact, interactive }: FeaturePreviewProps) {
  const data = mockData.data as unknown as TasksMockData
  const [view, setView] = useState(data.view)
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set())

  const todoTasks = data.tasks.filter(t => t.status === 'todo')
  const inProgressTasks = data.tasks.filter(t => t.status === 'in-progress')
  const doneTasks = data.tasks.filter(t => t.status === 'done')

  const completionRate = data.stats.total > 0
    ? Math.round((data.stats.completed / data.stats.total) * 100)
    : 0

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'text-red-500'
      case 'medium': return 'text-yellow-500'
      case 'low': return 'text-green-500'
      default: return 'text-muted-foreground'
    }
  }

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Tasks</span>
          </div>
          <Badge variant="secondary">{data.stats.total} tasks</Badge>
        </div>
        <Progress value={completionRate} className="h-2" />
        <p className="text-xs text-muted-foreground text-center">{completionRate}% complete</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full border rounded-xl overflow-hidden bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-card">
        <div className="flex items-center gap-3">
          <CheckSquare className="h-5 w-5 text-primary" />
          <div>
            <h2 className="font-semibold">Tasks</h2>
            <p className="text-xs text-muted-foreground">Task management and tracking</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* View Toggles */}
          <div className="flex bg-muted/50 p-1 rounded-lg border">
            {[
              { id: 'list', icon: List },
              { id: 'board', icon: LayoutGrid },
              { id: 'calendar', icon: Calendar },
            ].map(({ id, icon: Icon }) => (
              <button
                key={id}
                className={cn(
                  "p-1.5 rounded-md transition-colors",
                  view === id ? "bg-background shadow-sm" : "hover:bg-muted"
                )}
                onClick={() => interactive && setView(id as any)}
                disabled={!interactive}
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" disabled={!interactive}>
            <Filter className="h-4 w-4" />
          </Button>
          <Button size="sm" className="gap-2" disabled={!interactive}>
            <Plus className="h-4 w-4" />
            New Task
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 p-4 border-b bg-muted/20">
        <div className="text-center">
          <p className="text-2xl font-bold">{data.stats.total}</p>
          <p className="text-xs text-muted-foreground">Total</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-yellow-500">{data.stats.inProgress}</p>
          <p className="text-xs text-muted-foreground">In Progress</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-500">{data.stats.completed}</p>
          <p className="text-xs text-muted-foreground">Completed</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-red-500">{data.stats.overdue}</p>
          <p className="text-xs text-muted-foreground">Overdue</p>
        </div>
      </div>

      {/* Content */}
      {view === 'board' ? (
        /* Kanban Board View */
        <div className="flex-1 flex p-4 gap-4 overflow-x-auto">
          {[
            { title: 'To Do', tasks: todoTasks, icon: Circle },
            { title: 'In Progress', tasks: inProgressTasks, icon: Clock },
            { title: 'Done', tasks: doneTasks, icon: CheckCircle2 },
          ].map((column) => (
            <div key={column.title} className="w-72 flex-shrink-0 flex flex-col bg-muted/30 rounded-lg">
              <div className="p-3 border-b flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <column.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm">{column.title}</span>
                  <Badge variant="secondary" className="h-5 text-xs">{column.tasks.length}</Badge>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6" disabled={!interactive}>
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              <ScrollArea className="flex-1 p-2">
                <div className="space-y-2">
                  {column.tasks.map((task) => (
                    <Card key={task.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-3 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium leading-tight">{task.title}</p>
                          <div className={cn("w-2 h-2 rounded-full mt-1.5", getPriorityColor(task.priority).replace('text-', 'bg-'))} />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex gap-1">
                            {task.tags.slice(0, 2).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-[10px] h-4">{tag}</Badge>
                            ))}
                          </div>
                          <Avatar className="h-5 w-5">
                            <AvatarFallback className="text-[10px]">{task.assignee.charAt(0)}</AvatarFallback>
                          </Avatar>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-1">
            {data.tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
              >
                <Checkbox
                  checked={task.status === 'done'}
                  disabled={!interactive}
                  className="data-[state=checked]:bg-green-500"
                />
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm font-medium", task.status === 'done' && "line-through text-muted-foreground")}>
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {task.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-[10px] h-4">{tag}</Badge>
                    ))}
                  </div>
                </div>
                <Badge variant={task.status === 'done' ? 'secondary' : task.status === 'in-progress' ? 'default' : 'outline'} className="text-xs">
                  {task.status === 'in-progress' ? 'In Progress' : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                </Badge>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {task.dueDate}
                </div>
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-[10px]">{task.assignee.charAt(0)}</AvatarFallback>
                </Avatar>
                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" disabled={!interactive}>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}

// Register the preview
export default defineFeaturePreview({
  featureId: 'tasks',
  name: 'Tasks',
  description: 'Task management with kanban boards and timeline views',
  component: TasksPreview,
  category: 'productivity',
  tags: ['tasks', 'kanban', 'todo', 'project-management', 'timeline'],
  mockDataSets: [
    {
      id: 'default',
      name: 'Task Board',
      description: 'Sample task list with kanban view',
      data: {
        view: 'board',
        stats: { total: 12, completed: 5, inProgress: 4, overdue: 2 },
        tasks: [
          { id: '1', title: 'Design new landing page', status: 'in-progress', priority: 'high', assignee: 'Alice', dueDate: 'Today', tags: ['design'] },
          { id: '2', title: 'Write API documentation', status: 'todo', priority: 'medium', assignee: 'Bob', dueDate: 'Tomorrow', tags: ['docs'] },
          { id: '3', title: 'Fix login bug', status: 'in-progress', priority: 'high', assignee: 'Charlie', dueDate: 'Today', tags: ['bug', 'urgent'] },
          { id: '4', title: 'Review pull request', status: 'todo', priority: 'low', assignee: 'Alice', dueDate: 'Dec 15', tags: ['review'] },
          { id: '5', title: 'Setup CI/CD pipeline', status: 'done', priority: 'medium', assignee: 'Bob', dueDate: 'Dec 10', tags: ['devops'] },
          { id: '6', title: 'Update dependencies', status: 'done', priority: 'low', assignee: 'Charlie', dueDate: 'Dec 8', tags: ['maintenance'] },
          { id: '7', title: 'User testing session', status: 'todo', priority: 'medium', assignee: 'Diana', dueDate: 'Dec 12', tags: ['testing'] },
          { id: '8', title: 'Implement dark mode', status: 'in-progress', priority: 'medium', assignee: 'Eve', dueDate: 'Dec 14', tags: ['feature'] },
        ],
      },
    },
  ],
})
