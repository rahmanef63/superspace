"use client"

import React, { useState } from "react"
import type { Id } from "@convex/_generated/dataModel"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import {
  FileBarChart,
  Plus,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  Users,
  Activity,
  PieChart,
  BarChart3,
  LineChart,
  FileText,
  Clock,
  MoreHorizontal,
  Trash2,
  Copy,
  Eye,
  Share2,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { ReportsHeader } from "./ReportsHeader"

interface ReportsPageProps {
  workspaceId?: Id<"workspaces"> | null
}

// Report templates
const REPORT_TEMPLATES = [
  {
    id: "workspace-overview",
    name: "Workspace Overview",
    description: "Summary of workspace activity, members, and key metrics",
    icon: Activity,
    category: "general",
    dataSources: ["members", "tasks", "projects"],
    metrics: ["count", "completion_rate"],
  },
  {
    id: "member-activity",
    name: "Member Activity",
    description: "Detailed breakdown of member contributions and activity",
    icon: Users,
    category: "team",
    dataSources: ["members", "auditLogs"],
    metrics: ["activity_count", "engagement"],
  },
  {
    id: "task-completion",
    name: "Task Completion",
    description: "Track task progress and completion rates over time",
    icon: TrendingUp,
    category: "productivity",
    dataSources: ["tasks"],
    metrics: ["total", "completed", "pending"],
  },
  {
    id: "time-tracking",
    name: "Time Tracking",
    description: "Hours logged per project and member",
    icon: Clock,
    category: "productivity",
    dataSources: ["timeEntries", "projects"],
    metrics: ["hours", "average"],
  },
  {
    id: "sales-performance",
    name: "Sales Performance",
    description: "Revenue, deals, and sales pipeline analysis",
    icon: BarChart3,
    category: "sales",
    dataSources: ["deals", "accounts"],
    metrics: ["revenue", "deals_won", "pipeline_value"],
  },
  {
    id: "customer-insights",
    name: "Customer Insights",
    description: "Customer behavior and engagement metrics",
    icon: PieChart,
    category: "crm",
    dataSources: ["contacts", "activities"],
    metrics: ["engagement", "retention"],
  },
]

const TIME_RANGES = [
  { value: "today", label: "Today" },
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "90d", label: "Last 90 Days" },
]

interface ReportFormData {
  name: string
  description: string
  template: string
  type: "summary" | "detailed" | "comparison" | "trend"
  timeRange: string
}

const defaultFormData: ReportFormData = {
  name: "",
  description: "",
  template: "",
  type: "summary",
  timeRange: "30d",
}

export default function ReportsPage({ workspaceId }: ReportsPageProps) {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [timeRange, setTimeRange] = useState<"today" | "7d" | "30d" | "90d">("30d")
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedReport, setSelectedReport] = useState<any>(null)
  const [formData, setFormData] = useState<ReportFormData>(defaultFormData)
  const [isProcessing, setIsProcessing] = useState(false)

  // Use analytics queries for report data
  const overview = useQuery(
    api.features.analytics.queries.getOverview,
    workspaceId ? { workspaceId, timeRange } : "skip"
  )

  const timeline = useQuery(
    api.features.analytics.queries.getActivityTimeline,
    workspaceId ? { workspaceId, timeRange: timeRange === "today" ? "7d" : timeRange } : "skip"
  )

  const memberStats = useQuery(
    api.features.analytics.queries.getMemberStats,
    workspaceId ? { workspaceId, timeRange: timeRange === "today" ? "7d" : timeRange } : "skip"
  )

  // Get saved reports
  const savedReports = useQuery(
    api.features.analytics.queries.getReports,
    workspaceId ? { workspaceId } : "skip"
  )

  // Mutations
  const createReport = useMutation(api.features.analytics.mutations.createReport)
  const deleteReport = useMutation(api.features.analytics.mutations.deleteReport)

  if (!workspaceId) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <FileBarChart className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-semibold">No Workspace Selected</h2>
          <p className="mt-2 text-muted-foreground">
            Please select a workspace to view reports
          </p>
        </div>
      </div>
    )
  }

  const handleCreateReport = async () => {
    if (!workspaceId || !formData.name.trim()) return
    setIsProcessing(true)

    // Find template config if selected
    const templateConfig = REPORT_TEMPLATES.find(t => t.id === formData.template)

    try {
      await createReport({
        workspaceId,
        name: formData.name.trim(),
        description: formData.description || undefined,
        type: formData.type,
        config: {
          dataSources: templateConfig?.dataSources || ["workspace"],
          metrics: templateConfig?.metrics || ["count"],
          timeRange: {
            type: formData.timeRange,
          },
        },
      })
      setCreateDialogOpen(false)
      setFormData(defaultFormData)
    } catch (error) {
      console.error("Failed to create report:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDeleteReport = async (reportId: Id<"analyticsReports">) => {
    if (!workspaceId) return
    try {
      await deleteReport({ workspaceId, reportId })
    } catch (error) {
      console.error("Failed to delete report:", error)
    }
  }

  const handleExport = (format: "pdf" | "csv" | "excel") => {
    // In a real implementation, this would generate and download the report
    console.log(`Exporting report in ${format} format`)
  }

  const openViewDialog = (report: any) => {
    setSelectedReport(report)
    setViewDialogOpen(true)
  }

  // Extract metrics from overview structure
  const totalMembers = overview?.members?.total ?? 0
  const totalTasks = overview?.tasks?.total ?? 0
  const completedTasks = overview?.tasks?.completed ?? 0
  const totalProjects = overview?.projects?.total ?? 0
  const totalDocuments = overview?.documents ?? 0

  const completionRate = totalTasks > 0 
    ? Math.round((completedTasks / totalTasks) * 100) 
    : 0

  const reports = savedReports || []
  const activityTimeline = timeline?.timeline || []

  return (
    <div className="flex h-full flex-col">
      <ReportsHeader
        onCreateReport={() => {
          setFormData(defaultFormData)
          setCreateDialogOpen(true)
        }}
      />

      {/* Time Range Filter */}
      <div className="border-b p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Time Range:</span>
          </div>
          <div className="flex items-center gap-1 rounded-md border p-1">
            {TIME_RANGES.map((range) => (
              <Button
                key={range.value}
                variant={timeRange === range.value ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setTimeRange(range.value as any)}
              >
                {range.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <div className="border-b px-4">
            <TabsList className="h-12">
              <TabsTrigger value="dashboard" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="saved" className="gap-2">
                <FileText className="h-4 w-4" />
                Saved Reports ({reports.length})
              </TabsTrigger>
              <TabsTrigger value="templates" className="gap-2">
                <Copy className="h-4 w-4" />
                Templates
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="p-6 space-y-6">
            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalMembers}</div>
                  <p className="text-xs text-muted-foreground">
                    Active workspace members
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{completedTasks}</div>
                  <p className="text-xs text-muted-foreground">
                    of {totalTasks} total tasks
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{completionRate}%</div>
                  <Progress value={completionRate} className="mt-2 h-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Projects</CardTitle>
                  <LineChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalProjects}</div>
                  <p className="text-xs text-muted-foreground">
                    {totalDocuments} documents
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Activity Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Activity Timeline
                </CardTitle>
                <CardDescription>
                  Daily activity over the selected time range
                </CardDescription>
              </CardHeader>
              <CardContent>
                {timeline === undefined ? (
                  <div className="flex h-[200px] items-center justify-center">
                    <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : activityTimeline.length === 0 ? (
                  <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                    No activity data available
                  </div>
                ) : (
                  <div className="space-y-2">
                    {activityTimeline.slice(0, 7).map((day: any, index: number) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className="w-20 text-sm text-muted-foreground">
                          {new Date(day.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                        </div>
                        <div className="flex-1">
                          <div 
                            className="h-6 rounded bg-primary/20"
                            style={{ width: `${Math.min(100, (day.count / Math.max(...activityTimeline.map((t: any) => t.count), 1)) * 100)}%` }}
                          />
                        </div>
                        <div className="w-12 text-right text-sm font-medium">
                          {day.count}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Member Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Member Activity
                </CardTitle>
                <CardDescription>
                  Top contributors this period
                </CardDescription>
              </CardHeader>
              <CardContent>
                {memberStats === undefined ? (
                  <div className="flex h-[150px] items-center justify-center">
                    <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (memberStats.memberActivity || []).length === 0 ? (
                  <div className="flex h-[150px] items-center justify-center text-muted-foreground">
                    No member activity data
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(memberStats.memberActivity || []).slice(0, 5).map((member: any, index: number) => (
                      <div key={member.userId || index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">Member {index + 1}</p>
                            <p className="text-xs text-muted-foreground">Active contributor</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{member.activityCount || 0}</p>
                          <p className="text-xs text-muted-foreground">activities</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Saved Reports Tab */}
          <TabsContent value="saved" className="p-6">
            {reports.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No Saved Reports</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Create your first custom report to get started
                </p>
                <Button 
                  className="mt-4"
                  onClick={() => {
                    setFormData(defaultFormData)
                    setCreateDialogOpen(true)
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Report
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {reports.map((report: any) => (
                  <Card key={report._id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{report.name}</CardTitle>
                          <CardDescription>
                            Created {new Date(report.createdAt).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openViewDialog(report)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExport("pdf")}>
                              <Download className="mr-2 h-4 w-4" />
                              Export
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Share2 className="mr-2 h-4 w-4" />
                              Share
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleDeleteReport(report._id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {report.description || "No description"}
                      </p>
                      <div className="mt-4 flex items-center gap-2">
                        <Badge variant="secondary">{report.type}</Badge>
                        <Badge variant="outline">{report.config?.timeRange?.type || "30d"}</Badge>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" size="sm" className="w-full" onClick={() => openViewDialog(report)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Report
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="p-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {REPORT_TEMPLATES.map((template) => {
                const Icon = template.icon
                return (
                  <Card 
                    key={template.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => {
                      setFormData({
                        ...defaultFormData,
                        name: template.name,
                        description: template.description,
                        template: template.id,
                      })
                      setCreateDialogOpen(true)
                    }}
                  >
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{template.name}</CardTitle>
                          <Badge variant="outline" className="mt-1">{template.category}</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {template.description}
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" size="sm" className="w-full">
                        <Plus className="mr-2 h-4 w-4" />
                        Use Template
                      </Button>
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Report Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Report</DialogTitle>
            <DialogDescription>
              Configure your custom report settings
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Report Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Monthly Performance Report"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="What does this report track?"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Report Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="summary">Summary</SelectItem>
                    <SelectItem value="detailed">Detailed</SelectItem>
                    <SelectItem value="comparison">Comparison</SelectItem>
                    <SelectItem value="trend">Trend</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Time Range</Label>
                <Select
                  value={formData.timeRange}
                  onValueChange={(value) => setFormData({ ...formData, timeRange: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_RANGES.map((range) => (
                      <SelectItem key={range.value} value={range.value}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.template && (
              <div className="rounded-lg border p-3 bg-muted/50">
                <p className="text-sm font-medium">Template: {formData.template}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Using predefined report configuration
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateReport} disabled={isProcessing || !formData.name.trim()}>
              {isProcessing ? "Creating..." : "Create Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Report Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedReport?.name}</DialogTitle>
            <DialogDescription>
              {selectedReport?.description || "Report details"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Report summary using the current metrics */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Total Members</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalMembers}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Tasks Completed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{completedTasks}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Completion Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{completionRate}%</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Total Projects</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalProjects}</div>
                </CardContent>
              </Card>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                Time Range: {selectedReport?.config?.timeRange?.type || "30 days"}
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => handleExport("pdf")}>
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
            <Button onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
