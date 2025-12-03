/**
 * Analytics Feature Preview
 * 
 * Mock preview showing analytics dashboard interface
 */

"use client"

import * as React from 'react'
import { BarChart3, TrendingUp, TrendingDown, Users, Activity, Eye, Clock, ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { defineFeaturePreview } from '@/frontend/shared/preview'
import type { FeaturePreviewProps } from '@/frontend/shared/preview'

interface MetricData {
  label: string
  value: string
  change: string
  trend: 'up' | 'down'
}

interface ChartData {
  label: string
  value: number
  color: string
}

interface AnalyticsMockData {
  metrics: MetricData[]
  chart: ChartData[]
  topPages: { page: string; views: number; change: string }[]
}

function AnalyticsPreview({ mockData, compact, interactive }: FeaturePreviewProps) {
  const data = mockData.data as unknown as AnalyticsMockData

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Analytics</span>
          <Badge variant="secondary" className="text-xs">
            <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
            +12.5%
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {data.metrics.slice(0, 2).map((metric) => (
            <div key={metric.label} className="p-2 bg-muted/50 rounded-md">
              <p className="text-lg font-bold">{metric.value}</p>
              <p className="text-[10px] text-muted-foreground">{metric.label}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Metrics Grid */}
      <div className="grid grid-cols-4 gap-3">
        {data.metrics.map((metric) => (
          <Card key={metric.label}>
            <CardContent className="p-3">
              <div className="flex items-start justify-between">
                <span className="text-xs text-muted-foreground">{metric.label}</span>
                <Badge 
                  variant={metric.trend === 'up' ? 'default' : 'destructive'}
                  className={cn(
                    "text-[10px] px-1 h-5",
                    metric.trend === 'up' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                  )}
                >
                  {metric.trend === 'up' ? <TrendingUp className="h-3 w-3 mr-0.5" /> : <TrendingDown className="h-3 w-3 mr-0.5" />}
                  {metric.change}
                </Badge>
              </div>
              <p className="text-xl font-bold mt-1">{metric.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Simple Chart Visualization */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Activity Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-end justify-between gap-2 h-[120px] pt-4">
            {data.chart.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-1">
                <div 
                  className={cn("w-full rounded-t transition-all")}
                  style={{ 
                    height: `${item.value}%`,
                    backgroundColor: item.color,
                    minHeight: 8
                  }}
                />
                <span className="text-[10px] text-muted-foreground">{item.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Pages */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Top Pages
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.topPages.map((page, index) => (
            <div key={index} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm truncate flex-1">{page.page}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{page.views}</span>
                  <span className="text-xs text-green-500">{page.change}</span>
                </div>
              </div>
              <Progress value={(page.views / data.topPages[0].views) * 100} className="h-1" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

// Register the preview
export default defineFeaturePreview({
  featureId: 'analytics',
  name: 'Analytics',
  description: 'Workspace analytics and insights',
  component: AnalyticsPreview,
  category: 'insights',
  tags: ['analytics', 'metrics', 'reports', 'charts'],
  mockDataSets: [
    {
      id: 'default',
      name: 'Analytics Dashboard',
      description: 'Key metrics and charts',
      data: {
        metrics: [
          { label: 'Total Views', value: '24.5K', change: '+12.5%', trend: 'up' },
          { label: 'Visitors', value: '8.2K', change: '+8.3%', trend: 'up' },
          { label: 'Avg. Time', value: '4m 32s', change: '-2.1%', trend: 'down' },
          { label: 'Bounce Rate', value: '32%', change: '-5.4%', trend: 'up' },
        ],
        chart: [
          { label: 'Mon', value: 45, color: 'hsl(var(--chart-1))' },
          { label: 'Tue', value: 72, color: 'hsl(var(--chart-2))' },
          { label: 'Wed', value: 58, color: 'hsl(var(--chart-3))' },
          { label: 'Thu', value: 85, color: 'hsl(var(--chart-4))' },
          { label: 'Fri', value: 92, color: 'hsl(var(--chart-5))' },
          { label: 'Sat', value: 38, color: 'hsl(var(--chart-1))' },
          { label: 'Sun', value: 25, color: 'hsl(var(--chart-2))' },
        ],
        topPages: [
          { page: '/dashboard', views: 4523, change: '+15%' },
          { page: '/documents', views: 3214, change: '+8%' },
          { page: '/chat', views: 2876, change: '+23%' },
          { page: '/members', views: 1543, change: '-3%' },
        ],
      },
    },
  ],
})
