"use client"

import React from "react"
import { CheckCircle, Clock, XCircle, Plus, Check, X } from "lucide-react"
import { Id } from "@convex/_generated/dataModel"
import { useApprovals } from "../hooks/useApprovals"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface ApprovalsPageProps {
  workspaceId?: Id<"workspaces"> | null
}

/**
 * Approvals Page Component
 */
export default function ApprovalsPage({ workspaceId }: ApprovalsPageProps) {
  const { isLoading, pendingApprovals, myRequests, approveRequest, rejectRequest } = useApprovals(workspaceId)

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

  const handleApprove = async (requestId: Id<"approvalRequests">) => {
    await approveRequest({ workspaceId, requestId })
  }

  const handleReject = async (requestId: Id<"approvalRequests">) => {
    await rejectRequest({ workspaceId, requestId })
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-3">
          <CheckCircle className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-xl font-bold">Approvals</h1>
            <p className="text-sm text-muted-foreground">
              Manage approval requests
            </p>
          </div>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Request
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">Loading approvals...</p>
          </div>
        ) : (
          <Tabs defaultValue="pending">
            <TabsList>
              <TabsTrigger value="pending" className="gap-2">
                <Clock className="h-4 w-4" />
                Pending ({pendingApprovals.length})
              </TabsTrigger>
              <TabsTrigger value="my-requests">
                My Requests ({myRequests.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="mt-4">
              {pendingApprovals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <CheckCircle className="h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">No pending approvals</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingApprovals.map((request: any) => (
                    <Card key={request._id}>
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>
                                {request.requesterName?.charAt(0) || "?"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-base">{request.title}</CardTitle>
                              <p className="text-sm text-muted-foreground">
                                {request.requesterName} • {new Date(request.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline">
                            <Clock className="mr-1 h-3 w-3" />
                            Pending
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                          {request.description}
                        </p>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            className="gap-1"
                            onClick={() => handleApprove(request._id)}
                          >
                            <Check className="h-4 w-4" />
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="gap-1"
                            onClick={() => handleReject(request._id)}
                          >
                            <X className="h-4 w-4" />
                            Reject
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="my-requests" className="mt-4">
              {myRequests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <CheckCircle className="h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">No requests yet</p>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Request
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {myRequests.map((request: any) => (
                    <Card key={request._id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{request.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {new Date(request.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge 
                            variant={
                              request.status === "approved" ? "default" :
                              request.status === "rejected" ? "destructive" : "secondary"
                            }
                          >
                            {request.status === "approved" && <Check className="mr-1 h-3 w-3" />}
                            {request.status === "rejected" && <X className="mr-1 h-3 w-3" />}
                            {request.status === "pending" && <Clock className="mr-1 h-3 w-3" />}
                            {request.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}
