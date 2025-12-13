"use client"

import React, { useState } from "react"
import {
    CheckCircle,
    XCircle,
    Clock,
    FileText,
    Search,
    Filter,
    Check,
    X,
    History,
    ArrowRight,
    MessageSquare
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import type { ApprovalsData, ApprovalRequest } from "../types"

interface ApprovalsDashboardProps {
    data: ApprovalsData
    isLoading?: boolean
    onApprove?: (requestId: string, comment?: string) => Promise<void>
    onReject?: (requestId: string, reason?: string) => Promise<void>
}

export default function ApprovalsDashboard({
    data,
    isLoading,
    onApprove,
    onReject
}: ApprovalsDashboardProps) {
    const [activeTab, setActiveTab] = useState("overview")
    const [searchQuery, setSearchQuery] = useState("")
    const [priorityFilter, setPriorityFilter] = useState<string>("all")
    const [typeFilter, setTypeFilter] = useState<string>("all")

    // Dialog state
    const [actionDialog, setActionDialog] = useState<{
        open: boolean
        type: "approve" | "reject"
        request: ApprovalRequest | null
    }>({ open: false, type: "approve", request: null })
    const [comment, setComment] = useState("")
    const [isProcessing, setIsProcessing] = useState(false)

    if (isLoading) {
        return <div className="p-8 text-center text-muted-foreground">Loading approvals data...</div>
    }

    // Filter pending requests
    const filteredPending = data.pendingRequests.filter(request => {
        const matchesSearch = searchQuery === "" ||
            request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            request.requester.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesPriority = priorityFilter === "all" || request.priority === priorityFilter
        const matchesType = typeFilter === "all" || request.type === typeFilter
        return matchesSearch && matchesPriority && matchesType
    })

    // Get history (non-pending) requests
    const historyRequests = data.recentRequests.filter(r => r.status !== "pending")

    const openActionDialog = (type: "approve" | "reject", request: ApprovalRequest) => {
        setActionDialog({ open: true, type, request })
        setComment("")
    }

    const handleAction = async () => {
        if (!actionDialog.request) return
        setIsProcessing(true)

        try {
            if (actionDialog.type === "approve" && onApprove) {
                await onApprove(actionDialog.request.id, comment || undefined)
            } else if (actionDialog.type === "reject" && onReject) {
                await onReject(actionDialog.request.id, comment || undefined)
            }
            setActionDialog({ open: false, type: "approve", request: null })
        } catch (error) {
            console.error("Action failed:", error)
        } finally {
            setIsProcessing(false)
        }
    }

    const RequestCard = ({ request, showActions = true }: { request: ApprovalRequest, showActions?: boolean }) => (
        <div className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors">
            <div className="flex items-start gap-4">
                <div className={`p-2 rounded-full ${request.priority === 'high' ? 'bg-red-100 text-red-600' :
                        request.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-blue-100 text-blue-600'
                    }`}>
                    <FileText className="h-5 w-5" />
                </div>
                <div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold">{request.title}</p>
                        <Badge variant="outline" className="text-[10px]">{request.type}</Badge>
                        {request.priority === 'high' && (
                            <Badge variant="destructive" className="text-[10px] h-5">High Priority</Badge>
                        )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                        Requested by <span className="font-medium text-foreground">{request.requester}</span> • {request.department} • {request.date}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                {showActions && request.status === 'pending' ? (
                    <>
                        <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => openActionDialog("approve", request)}
                        >
                            <Check className="h-4 w-4 mr-1" /> Approve
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => openActionDialog("reject", request)}
                        >
                            <X className="h-4 w-4 mr-1" /> Reject
                        </Button>
                    </>
                ) : (
                    <Badge variant={request.status === 'approved' ? 'default' : 'destructive'}>
                        {request.status === 'approved' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {request.status === 'rejected' && <XCircle className="h-3 w-3 mr-1" />}
                        {request.status}
                    </Badge>
                )}
            </div>
        </div>
    )

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                        <Clock className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{data.stats.pending}</div>
                        <p className="text-xs text-muted-foreground">
                            Requests awaiting action
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Approved</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{data.stats.approved}</div>
                        <p className="text-xs text-muted-foreground">
                            Total approved requests
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                        <XCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{data.stats.rejected}</div>
                        <p className="text-xs text-muted-foreground">
                            Total rejected requests
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Review Time</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.stats.avgTime}</div>
                        <p className="text-xs text-muted-foreground">
                            Per request
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="pending" className="gap-2">
                        Pending
                        {data.stats.pending > 0 && (
                            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
                                {data.stats.pending}
                            </Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Recent Requests</CardTitle>
                                <Button variant="ghost" size="sm" onClick={() => setActiveTab("pending")}>
                                    View All <ArrowRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>
                            <CardDescription>Latest approval requests across departments</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {data.recentRequests.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                        <p>No approval requests yet</p>
                                    </div>
                                ) : (
                                    data.recentRequests.slice(0, 5).map((request) => (
                                        <RequestCard key={request.id} request={request} />
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Pending Tab - FULLY IMPLEMENTED */}
                <TabsContent value="pending" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Needs Your Review</CardTitle>
                                    <CardDescription>
                                        {filteredPending.length} request{filteredPending.length !== 1 ? 's' : ''} awaiting your decision
                                    </CardDescription>
                                </div>
                            </div>
                            {/* Filters */}
                            <div className="flex flex-wrap items-center gap-3 pt-4">
                                <div className="relative flex-1 min-w-[200px] max-w-sm">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search requests..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                                    <SelectTrigger className="w-[140px]">
                                        <SelectValue placeholder="Priority" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Priorities</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="low">Low</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={typeFilter} onValueChange={setTypeFilter}>
                                    <SelectTrigger className="w-[140px]">
                                        <SelectValue placeholder="Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="expense">Expense</SelectItem>
                                        <SelectItem value="leave">Leave</SelectItem>
                                        <SelectItem value="document">Document</SelectItem>
                                        <SelectItem value="purchase">Purchase</SelectItem>
                                        <SelectItem value="custom">Custom</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {filteredPending.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground">
                                        <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-20 text-green-500" />
                                        <p className="font-medium">All caught up!</p>
                                        <p className="text-sm mt-1">No pending requests need your review</p>
                                    </div>
                                ) : (
                                    filteredPending.map((request) => (
                                        <RequestCard key={request.id} request={request} />
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* History Tab - FULLY IMPLEMENTED */}
                <TabsContent value="history" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <History className="h-5 w-5" />
                                        Approval History
                                    </CardTitle>
                                    <CardDescription>
                                        Past decisions and their outcomes
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {historyRequests.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground">
                                        <History className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                        <p className="font-medium">No history yet</p>
                                        <p className="text-sm mt-1">Completed approvals will appear here</p>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        {/* Timeline line */}
                                        <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-border" />

                                        {historyRequests.map((request, index) => (
                                            <div key={request.id} className="relative pl-12 pb-6 last:pb-0">
                                                {/* Timeline dot */}
                                                <div className={`absolute left-0 w-10 h-10 rounded-full flex items-center justify-center ${request.status === 'approved'
                                                        ? 'bg-green-100 text-green-600'
                                                        : 'bg-red-100 text-red-600'
                                                    }`}>
                                                    {request.status === 'approved'
                                                        ? <CheckCircle className="h-5 w-5" />
                                                        : <XCircle className="h-5 w-5" />
                                                    }
                                                </div>

                                                {/* Content */}
                                                <div className="border rounded-lg p-4 bg-card">
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <p className="font-semibold">{request.title}</p>
                                                                <Badge variant="outline" className="text-[10px]">
                                                                    {request.type}
                                                                </Badge>
                                                            </div>
                                                            <p className="text-sm text-muted-foreground mt-1">
                                                                {request.requester} • {request.department}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <Badge variant={request.status === 'approved' ? 'default' : 'destructive'}>
                                                                {request.status}
                                                            </Badge>
                                                            <p className="text-xs text-muted-foreground mt-1">
                                                                {request.date}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Approve/Reject Confirmation Dialog */}
            <Dialog open={actionDialog.open} onOpenChange={(open) => !open && setActionDialog({ ...actionDialog, open: false })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {actionDialog.type === "approve" ? "Approve Request" : "Reject Request"}
                        </DialogTitle>
                        <DialogDescription>
                            {actionDialog.type === "approve"
                                ? "Are you sure you want to approve this request?"
                                : "Please provide a reason for rejecting this request."
                            }
                        </DialogDescription>
                    </DialogHeader>

                    {actionDialog.request && (
                        <div className="py-4">
                            <div className="border rounded-lg p-3 bg-muted/50">
                                <p className="font-medium">{actionDialog.request.title}</p>
                                <p className="text-sm text-muted-foreground">
                                    By {actionDialog.request.requester} • {actionDialog.request.type}
                                </p>
                            </div>

                            <div className="mt-4 space-y-2">
                                <Label htmlFor="comment">
                                    {actionDialog.type === "approve" ? "Comment (optional)" : "Reason"}
                                </Label>
                                <Textarea
                                    id="comment"
                                    placeholder={actionDialog.type === "approve"
                                        ? "Add a comment..."
                                        : "Why is this request being rejected?"
                                    }
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    rows={3}
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setActionDialog({ ...actionDialog, open: false })}
                            disabled={isProcessing}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant={actionDialog.type === "approve" ? "default" : "destructive"}
                            onClick={handleAction}
                            disabled={isProcessing || (actionDialog.type === "reject" && !comment.trim())}
                        >
                            {isProcessing ? "Processing..." : actionDialog.type === "approve" ? "Approve" : "Reject"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

