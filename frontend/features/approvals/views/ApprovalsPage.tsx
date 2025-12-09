"use client"

import React, { useState } from "react"
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  Plus, 
  Check, 
  X, 
  AlertCircle,
  FileText,
  DollarSign,
  Calendar,
  Package,
  MoreHorizontal,
  MessageSquare,
  History
} from "lucide-react"
import { Id } from "@convex/_generated/dataModel"
import { useApprovals } from "../hooks/useApprovals"
import { FeatureHeader } from "@/frontend/shared/ui/layout/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ApprovalsPageProps {
  workspaceId?: Id<"workspaces"> | null
}

const REQUEST_TYPES = [
  { value: "expense", label: "Expense", icon: DollarSign, color: "text-green-500" },
  { value: "leave", label: "Leave Request", icon: Calendar, color: "text-blue-500" },
  { value: "document", label: "Document", icon: FileText, color: "text-purple-500" },
  { value: "purchase", label: "Purchase", icon: Package, color: "text-orange-500" },
  { value: "custom", label: "Custom", icon: AlertCircle, color: "text-gray-500" },
]

const PRIORITY_OPTIONS = [
  { value: "low", label: "Low", color: "bg-gray-100 text-gray-700" },
  { value: "normal", label: "Normal", color: "bg-blue-100 text-blue-700" },
  { value: "high", label: "High", color: "bg-orange-100 text-orange-700" },
  { value: "urgent", label: "Urgent", color: "bg-red-100 text-red-700" },
]

/**
 * Approvals Page Component
 * Complete approval workflow management
 */
export default function ApprovalsPage({ workspaceId }: ApprovalsPageProps) {
  const { isLoading, pendingApprovals, myRequests, createRequest, approveRequest, rejectRequest } = useApprovals(workspaceId)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [actionDialogOpen, setActionDialogOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [actionType, setActionType] = useState<"approve" | "reject">("approve")
  const [actionComment, setActionComment] = useState("")
  
  // Create form state
  const [newRequest, setNewRequest] = useState({
    title: "",
    description: "",
    type: "custom" as const,
    priority: "normal" as const,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!workspaceId) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">No Workspace Selected</h2>
          <p className="mt-2 text-muted-foreground">
            Please select a workspace to view approvals
          </p>
        </div>
      </div>
    )
  }

  const handleCreateRequest = async () => {
    if (!workspaceId || !newRequest.title) return
    setIsSubmitting(true)
    
    try {
      // Note: In a real app, you'd select approvers from workspace members
      await createRequest({
        workspaceId,
        title: newRequest.title,
        description: newRequest.description,
        type: newRequest.type,
        priority: newRequest.priority,
        approvers: [], // Would be populated with selected approvers
      })
      setCreateDialogOpen(false)
      setNewRequest({ title: "", description: "", type: "custom", priority: "normal" })
    } catch (error) {
      console.error("Failed to create request:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAction = async () => {
    if (!workspaceId || !selectedRequest) return
    setIsSubmitting(true)
    
    try {
      if (actionType === "approve") {
        await approveRequest({ 
          workspaceId, 
          requestId: selectedRequest._id,
          comment: actionComment || undefined
        })
      } else {
        await rejectRequest({ 
          workspaceId, 
          requestId: selectedRequest._id,
          reason: actionComment || undefined
        })
      }
      setActionDialogOpen(false)
      setSelectedRequest(null)
      setActionComment("")
    } catch (error) {
      console.error("Failed to process request:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const openActionDialog = (request: any, type: "approve" | "reject") => {
    setSelectedRequest(request)
    setActionType(type)
    setActionComment("")
    setActionDialogOpen(true)
  }

  const getTypeIcon = (type: string) => {
    const requestType = REQUEST_TYPES.find(t => t.value === type)
    return requestType?.icon || AlertCircle
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-700"><Check className="h-3 w-3 mr-1" />Approved</Badge>
      case "rejected":
        return <Badge variant="destructive"><X className="h-3 w-3 mr-1" />Rejected</Badge>
      case "pending":
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    const p = PRIORITY_OPTIONS.find(o => o.value === priority)
    return <Badge className={p?.color || ""}>{p?.label || priority}</Badge>
  }

  return (
    <div className="flex h-full flex-col">
      <FeatureHeader
        icon={CheckCircle}
        title="Approvals"
        subtitle="Manage approval requests and workflows"
        badge={{ text: "Beta", variant: "secondary" }}
        primaryAction={{
          label: "New Request",
          icon: Plus,
          onClick: () => setCreateDialogOpen(true),
        }}
      />

      <div className="flex-1 overflow-auto p-4">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">Loading approvals...</p>
          </div>
        ) : (
          <Tabs defaultValue="pending" className="space-y-4">
            <TabsList>
              <TabsTrigger value="pending" className="gap-2">
                <Clock className="h-4 w-4" />
                Pending ({pendingApprovals.length})
              </TabsTrigger>
              <TabsTrigger value="my-requests" className="gap-2">
                <FileText className="h-4 w-4" />
                My Requests ({myRequests.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4">
              {pendingApprovals.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
                    <CheckCircle className="h-12 w-12 text-green-500" />
                    <div className="text-center">
                      <h3 className="font-medium">All caught up!</h3>
                      <p className="text-sm text-muted-foreground">No pending approvals</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {pendingApprovals.map((request: any) => {
                    const TypeIcon = getTypeIcon(request.type)
                    return (
                      <Card key={request._id} className="overflow-hidden">
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-muted">
                                <TypeIcon className="h-5 w-5" />
                              </div>
                              <div>
                                <CardTitle className="text-base">{request.title}</CardTitle>
                                <CardDescription className="flex items-center gap-2 mt-1">
                                  <Avatar className="h-5 w-5">
                                    <AvatarFallback className="text-xs">
                                      {request.requesterName?.charAt(0) || "?"}
                                    </AvatarFallback>
                                  </Avatar>
                                  {request.requesterName || "Unknown"} • {new Date(request.createdAt).toLocaleDateString()}
                                </CardDescription>
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <History className="h-4 w-4 mr-2" />
                                  View History
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <MessageSquare className="h-4 w-4 mr-2" />
                                  Add Comment
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardHeader>
                        <CardContent className="pb-3">
                          {request.description && (
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {request.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2">
                            {getPriorityBadge(request.priority)}
                            <Badge variant="outline" className="capitalize">{request.type}</Badge>
                          </div>
                        </CardContent>
                        <CardFooter className="border-t bg-muted/50 gap-2">
                          <Button 
                            size="sm" 
                            className="flex-1 gap-1"
                            onClick={() => openActionDialog(request, "approve")}
                          >
                            <Check className="h-4 w-4" />
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="flex-1 gap-1"
                            onClick={() => openActionDialog(request, "reject")}
                          >
                            <X className="h-4 w-4" />
                            Reject
                          </Button>
                        </CardFooter>
                      </Card>
                    )
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="my-requests" className="space-y-4">
              {myRequests.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
                    <FileText className="h-12 w-12 text-muted-foreground" />
                    <div className="text-center">
                      <h3 className="font-medium">No requests yet</h3>
                      <p className="text-sm text-muted-foreground">Create your first approval request</p>
                    </div>
                    <Button className="gap-2" onClick={() => setCreateDialogOpen(true)}>
                      <Plus className="h-4 w-4" />
                      Create Request
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {myRequests.map((request: any) => {
                    const TypeIcon = getTypeIcon(request.type)
                    return (
                      <Card key={request._id}>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div className="p-2 rounded-lg bg-muted">
                              <TypeIcon className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium truncate">{request.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                {new Date(request.createdAt).toLocaleDateString()} • {request.type}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {getPriorityBadge(request.priority)}
                              {getStatusBadge(request.status)}
                            </div>
                          </div>
                          {request.approvalHistory && request.approvalHistory.length > 0 && (
                            <div className="mt-3 pt-3 border-t">
                              <p className="text-xs text-muted-foreground">
                                Last action: {request.approvalHistory[request.approvalHistory.length - 1].action} 
                                {" "}on {new Date(request.approvalHistory[request.approvalHistory.length - 1].timestamp).toLocaleString()}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Create Request Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Approval Request</DialogTitle>
            <DialogDescription>
              Submit a new request for approval
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newRequest.title}
                onChange={(e) => setNewRequest({ ...newRequest, title: e.target.value })}
                placeholder="Enter request title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={newRequest.type}
                onValueChange={(value: any) => setNewRequest({ ...newRequest, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {REQUEST_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <type.icon className={`h-4 w-4 ${type.color}`} />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={newRequest.priority}
                onValueChange={(value: any) => setNewRequest({ ...newRequest, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newRequest.description}
                onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                placeholder="Describe your request"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateRequest} disabled={!newRequest.title || isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve/Reject Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" ? "Approve Request" : "Reject Request"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "approve" 
                ? "Are you sure you want to approve this request?"
                : "Please provide a reason for rejection"
              }
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="p-3 bg-muted rounded-lg">
              <h4 className="font-medium">{selectedRequest.title}</h4>
              {selectedRequest.description && (
                <p className="text-sm text-muted-foreground mt-1">{selectedRequest.description}</p>
              )}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="comment">
              {actionType === "approve" ? "Comment (optional)" : "Reason for rejection"}
            </Label>
            <Textarea
              id="comment"
              value={actionComment}
              onChange={(e) => setActionComment(e.target.value)}
              placeholder={actionType === "approve" ? "Add a comment..." : "Why is this being rejected?"}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant={actionType === "reject" ? "destructive" : "default"}
              onClick={handleAction} 
              disabled={isSubmitting || (actionType === "reject" && !actionComment)}
            >
              {isSubmitting ? "Processing..." : actionType === "approve" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
