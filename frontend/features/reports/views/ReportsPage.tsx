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

  }

  return (
    <div className="flex h-full flex-col space-y-4 p-4">
      <ReportsHeader
        workspaceId={workspaceId}
        onCreateReport={() => setCreateDialogOpen(true)}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="reports">Saved Reports</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          {/* Placeholder for dashboard content */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$45,231.89</div>
                <p className="text-xs text-muted-foreground">+20.1% from last month</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {savedReports?.map((report) => (
              <Card key={report._id}>
                <CardHeader>
                  <CardTitle>{report.name}</CardTitle>
                  <CardDescription>{report.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge variant="outline">{report.type}</Badge>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteReport(report._id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleExport("pdf")}>
                    <Download className="mr-2 h-4 w-4" /> Export
                  </Button>
                </CardFooter>
              </Card>
            ))}
            {(!savedReports || savedReports.length === 0) && (
              <div className="col-span-full py-10 text-center text-muted-foreground">
                No saved reports found.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="scheduled">
          <div className="py-10 text-center text-muted-foreground">
            Scheduled reports coming soon.
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Report</DialogTitle>
            <DialogDescription>
              Configure report settings and data sources.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="template" className="text-right">Template</Label>
              <Select
                value={formData.template}
                onValueChange={(v) => setFormData({ ...formData, template: v })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {REPORT_TEMPLATES.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(v: any) => setFormData({ ...formData, type: v })}
              >
                <SelectTrigger className="col-span-3">
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateReport} disabled={isProcessing}>
              {isProcessing ? "Creating..." : "Create Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
