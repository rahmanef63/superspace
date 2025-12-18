/**
 * Pending Invitations Section
 * 
 * Displays pending workspace and personal invitations for the current user.
 * Allows accepting or declining invitations.
 */

"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Check, X, Calendar, Building2, User } from "lucide-react";
import { formatRelativeTime } from "@/frontend/shared/foundation/utils/core/format";
import { useToast } from "@/hooks/use-toast";
import type { Id } from "@/convex/_generated/dataModel";

export function PendingInvitationsSection() {
    const { toast } = useToast();

    // Fetch pending invitations
    const rawInvitations = useQuery(api.workspace.invitations.getUserInvitations, {
        type: "received",
        status: "pending"
    });

    // Filter only pending (API status filter might be optional or returning all, ensure we filter)
    const invitations = rawInvitations?.filter((i: any) => i.status === "pending") ?? [];

    const acceptInvitation = useMutation(api.workspace.invitations.acceptInvitation);
    const declineInvitation = useMutation(api.workspace.invitations.declineInvitation);

    const handleAccept = async (invitationId: Id<"invitations">) => {
        try {
            await acceptInvitation({ invitationId });
            toast({
                title: "Invitation Accepted",
                description: "You have joined the workspace.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to accept invitation",
                variant: "destructive",
            });
        }
    };

    const handleDecline = async (invitationId: Id<"invitations">) => {
        if (!confirm("Are you sure you want to decline this invitation?")) return;
        try {
            await declineInvitation({ invitationId });
            toast({
                title: "Invitation Declined",
                description: "The invitation has been declined.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to decline invitation",
                variant: "destructive",
            });
        }
    };

    if (!invitations || invitations.length === 0) {
        return null; // Don't show anything if no pending invitations
    }

    return (
        <Card className="border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-900/10">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-medium flex items-center gap-2">
                        <Mail className="h-5 w-5 text-blue-600" />
                        Pending Invitations
                        <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300">
                            {invitations.length}
                        </Badge>
                    </CardTitle>
                    <CardDescription>
                        You have pending invitations to join workspaces
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {invitations.map((inv: any) => (
                        <div
                            key={inv._id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 bg-background rounded-lg border shadow-sm"
                        >
                            <div className="flex items-start gap-3">
                                <div className="mt-1">
                                    {inv.type === "workspace" ? (
                                        <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                                            <Building2 className="h-4 w-4 text-primary" />
                                        </div>
                                    ) : (
                                        <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                                            <User className="h-4 w-4 text-orange-600" />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-medium text-sm">
                                        {inv.type === "workspace" ? (
                                            <>
                                                Invited to <span className="font-bold">{inv.workspace?.name ?? "a workspace"}</span> relative to role <span className="italic">{inv.role?.name ?? "Member"}</span>
                                            </>
                                        ) : (
                                            <>
                                                Friend request from <span className="font-bold">{inv.inviter?.name ?? inv.inviterEmail ?? "Someone"}</span>
                                            </>
                                        )}
                                    </h4>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        From: {inv.inviter?.name} ({inv.inviterEmail}) • {formatRelativeTime(inv._creationTime)}
                                    </p>
                                    {inv.message && (
                                        <div className="mt-2 text-xs bg-muted/50 p-2 rounded text-muted-foreground italic">
                                            "{inv.message}"
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-center">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 text-destructive hover:text-destructive"
                                    onClick={() => handleDecline(inv._id)}
                                >
                                    Decline
                                </Button>
                                <Button
                                    size="sm"
                                    className="h-8 gap-1.5"
                                    onClick={() => handleAccept(inv._id)}
                                >
                                    <Check className="h-3.5 w-3.5" />
                                    Accept
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
