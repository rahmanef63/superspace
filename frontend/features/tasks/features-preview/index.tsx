/**
 * Tasks Feature Preview
 * 
 * Mock preview showing task management interface
 */

"use client"

import * as React from 'react'
import { CheckSquare, Square, Clock, AlertCircle, Flag, Calendar, Plus, Filter, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import { defineFeaturePreview } from '@/frontend/shared/preview'
import type { FeaturePreviewProps } from '@/frontend/shared/preview'

interface Task {
  id: string
  title: string
  priority: 'high' | 'medium' | 'low'
  status: 'todo' | 'in-progress' | 'done'
  dueDate?: string
  assignee?: string
}

interface TasksMockData {
  tasks: Task[]
  stats: {
    total: number
    completed: number
    inProgress: number
    overdue: number
  }
}

const priorityConfig = {
  high: { color: 'text-red-500', bg: 'bg-red-500/10' },
  medium: { color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  low: { color: 'text-blue-500', bg: 'bg-blue-500/10' },
}

function TasksPreview({ mockData, compact, interactive }: FeaturePreviewProps) {
  const data = mockData.data as unknown as TasksMockData
  const completionRate = (data.stats.completed / data.stats.total) * 100

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Tasks</span>
          <Badge variant="secondary">{data.stats.completed}/{data.stats.total}</Badge>
        </div>
        <Progress value={completionRate} className="h-2" />
        {data.tasks.filter(t => t.status !== 'done').slice(0, 2).map((task) => (
          <div key={task.id} className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
            <Square className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs truncate flex-1">{task.title}</span>
            <Flag className={cn("h-3 w-3", priorityConfig[task.priority].color)} />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckSquare className="h-5 w-5" />
          <h3 className="font-semibold">Tasks</h3>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-8 gap-1" disabled={!interactive}>
            <Filter className="h-3 w-3" />
            Filter
          </Button>
          <Button size="sm" className="h-8 gap-1" disabled={!interactive}>
            <Plus className="h-4 w-4" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Sprint Progress</span>
            <span className="text-sm text-muted-foreground">{Math.round(completionRate)}%</span>
          </div>
          <Progress value={completionRate} className="h-2" />
          <div className="grid grid-cols-4 gap-2 mt-4">
            <div className="text-center">
              <div className="text-lg font-bold">{data.stats.total}</div>
              <div className="text-[10px] text-muted-foreground">Total</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-500">{data.stats.completed}</div>
              <div className="text-[10px] text-muted-foreground">Done</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-500">{data.stats.inProgress}</div>
              <div className="text-[10px] text-muted-foreground">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-500">{data.stats.overdue}</div>
              <div className="text-[10px] text-muted-foreground">Overdue</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Active Tasks</CardTitle>
        </CardHeader>
        <ScrollArea className="h-[200px]">
          <CardContent className="space-y-2">
            {data.tasks.map((task) => (
              <div 
                key={task.id} 
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors",
                  task.status === 'done' && "opacity-50"
                )}
              >
                <Checkbox 
                  checked={task.status === 'done'} 
                  disabled={!interactive}
                  className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                />
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-sm",
                    task.status === 'done' && "line-through text-muted-foreground"
                  )}>{task.title}</p>
                  {task.dueDate && (
                    <div className="flex items-center gap-1 mt-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{task.dueDate}</span>
                    </div>
                  )}
                </div>
                <Badge 
                  variant="outline" 
                  className={cn("text-xs gap-1", priorityConfig[task.priority].bg)}
                >
                  <Flag className={cn("h-3 w-3", priorityConfig[task.priority].color)} />
                  {task.priority}
                </Badge>
                {task.assignee && (
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-[10px] bg-muted">
                      {task.assignee.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
          </CardContent>
        </ScrollArea>
      </Card>
    </div>
  )
}

// Register the preview
export default defineFeaturePreview({
  featureId: 'tasks',
  name: 'Tasks',
  description: 'Task and project management',
  component: TasksPreview,
  category: 'productivity',
  tags: ['tasks', 'todo', 'projects', 'kanban'],
  mockDataSets: [
    {
      id: 'default',
      name: 'Sprint Tasks',
      description: 'Current sprint tasks',
      data: {
        stats: { total: 12, completed: 5, inProgress: 4, overdue: 1 },
        tasks: [
          { id: '1', title: 'Implement authentication flow', priority: 'high', status: 'in-progress', dueDate: 'Today', assignee: 'Alice' },
          { id: '2', title: 'Design dashboard mockups', priority: 'medium', status: 'in-progress', dueDate: 'Tomorrow', assignee: 'Bob' },
          { id: '3', title: 'Write API documentation', priority: 'low', status: 'todo', dueDate: 'Fri', assignee: 'Charlie' },
          { id: '4', title: 'Fix navigation bug', priority: 'high', status: 'done', assignee: 'Diana' },
          { id: '5', title: 'Update dependencies', priority: 'medium', status: 'todo', dueDate: 'Next week' },
        ],
      },
    },
  ],
})
