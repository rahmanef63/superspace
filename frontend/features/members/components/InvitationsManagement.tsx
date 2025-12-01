"use client";

import { useState, useMemo } from "react";
import type { Id } from "@convex/_generated/dataModel";
import {
  useWorkspaceInvitations,
  useCancelInvitation,
  useResendInvitation,
  useInvitationStats,
  useSearchInvitations,
  useCleanupExpiredInvitations,
  useRoles,
} from "../api";
import {
  Mail,
  Clock,
  XCircle,
  CheckCircle,
  RefreshCw,
  Search,
  Trash2,
  Filter,
  MoreHorizontal,
  Send,
  AlertTriangle,
  Users,
  Loader2,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface InvitationsManagementProps {
  workspaceId: Id<"workspaces">;
}

type InvitationStatus = "pending" | "accepted" | "declined" | "expired";

const STATUS_CONFIG: Record<InvitationStatus, { label: string; icon: React.ElementType; color: string }> = {
  pending: { label: "Pending", icon: Clock, color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
  accepted: { label: "Accepted", icon: CheckCircle, color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
  declined: { label: "Declined", icon: XCircle, color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
  expired: { label: "Expired", icon: AlertTriangle, color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400" },
};

function StatCard({ title, value, icon: Icon, description }: { title: string; value: number; icon: React.ElementType; description?: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{title}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function InvitationRow({
  invitation,
  onCancel,
  onResend,
  roles,
}: {
  invitation: any;
  onCancel: (id: Id<"invitations">) => Promise<void>;
  onResend: (id: Id<"invitations">, roleId?: Id<"roles">) => Promise<void>;
  roles: any[] | undefined;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [showResendDialog, setShowResendDialog] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<Id<"roles"> | "">(invitation.roleId || "");

  const statusConfig = STATUS_CONFIG[invitation.status as InvitationStatus] || STATUS_CONFIG.pending;
  const StatusIcon = statusConfig.icon;

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this invitation?")) return;
    setIsLoading(true);
    try {
      await onCancel(invitation._id);
      toast.success("Invitation cancelled");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to cancel");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsLoading(true);
    try {
      await onResend(invitation._id, selectedRoleId || undefined);
      toast.success("Invitation resent");
      setShowResendDialog(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to resend");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/invite/${invitation.token}`;
    navigator.clipboard.writeText(link);
    toast.success("Invitation link copied!");
  };

  const isExpiringSoon = invitation.status === "pending" && 
    invitation.expiresAt - Date.now() < 24 * 60 * 60 * 1000;

  return (
    <>
      <div className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <Mail className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="font-medium truncate">{invitation.inviteeEmail}</div>
            <div className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
              <span>Invited by {invitation?.inviter?.name || "Unknown"}</span>
              {invitation?.role?.name && (
                <>
                  <span>•</span>
                  <Badge variant="outline" className="text-xs py-0">
                    {invitation.role.name}
                  </Badge>
                </>
              )}
              {isExpiringSoon && invitation.status === "pending" && (
                <>
                  <span>•</span>
                  <Badge variant="destructive" className="text-xs py-0">
                    Expiring soon
                  </Badge>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge className={cn("gap-1", statusConfig.color)}>
            <StatusIcon className="h-3 w-3" />
            {statusConfig.label}
          </Badge>

          {invitation.status === "pending" && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleCopyLink}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Invite Link
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleCancel} className="text-destructive">
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel Invitation
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {(invitation.status === "expired" || invitation.status === "declined") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowResendDialog(true)}
              disabled={isLoading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Resend
            </Button>
          )}
        </div>
      </div>

      <Dialog open={showResendDialog} onOpenChange={setShowResendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resend Invitation</DialogTitle>
            <DialogDescription>
              Resend invitation to {invitation.inviteeEmail}. You can optionally change the role.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <label className="text-sm font-medium mb-2 block">Role</label>
            <Select value={selectedRoleId} onValueChange={(v) => setSelectedRoleId(v as Id<"roles">)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roles?.map((role) => (
                  <SelectItem key={role._id} value={role._id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResendDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleResend} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Resend
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function InvitationsManagement({ workspaceId }: InvitationsManagementProps) {
  const [activeTab, setActiveTab] = useState<InvitationStatus | "all">("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCleaningUp, setIsCleaningUp] = useState(false);

  const stats = useInvitationStats(workspaceId);
  const roles = useRoles(workspaceId);
  
  // Get invitations based on active tab
  const invitations = useWorkspaceInvitations(
    workspaceId,
    activeTab === "all" ? undefined : activeTab
  );

  const cancelInvitation = useCancelInvitation();
  const resendInvitation = useResendInvitation();
  const cleanupExpired = useCleanupExpiredInvitations();

  // Filter by search
  const filteredInvitations = useMemo(() => {
    if (!invitations) return [];
    if (!searchQuery) return invitations;
    
    const query = searchQuery.toLowerCase();
    return invitations.filter((inv: any) =>
      inv.inviteeEmail.toLowerCase().includes(query) ||
      inv.inviter?.name?.toLowerCase().includes(query)
    );
  }, [invitations, searchQuery]);

  const handleCancel = async (invitationId: Id<"invitations">) => {
    await cancelInvitation({ invitationId });
  };

  const handleResend = async (invitationId: Id<"invitations">, roleId?: Id<"roles">) => {
    await resendInvitation({ invitationId, roleId });
  };

  const handleCleanupExpired = async () => {
    setIsCleaningUp(true);
    try {
      const result = await cleanupExpired({ workspaceId });
      toast.success(`Cleaned up ${result.cleanedCount} expired invitations`);
    } catch (error) {
      toast.error("Failed to cleanup expired invitations");
    } finally {
      setIsCleaningUp(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard title="Total" value={stats.total} icon={Users} />
          <StatCard title="Pending" value={stats.pending} icon={Clock} />
          <StatCard title="Accepted" value={stats.accepted} icon={CheckCircle} />
          <StatCard title="Declined" value={stats.declined} icon={XCircle} />
          <StatCard title="Expired" value={stats.expired} icon={AlertTriangle} />
        </div>
      )}

      {/* Expiring soon warning */}
      {stats && stats.expiringSoon > 0 && (
        <Card className="border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-900/10">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <div className="flex-1">
              <p className="font-medium text-yellow-800 dark:text-yellow-400">
                {stats.expiringSoon} invitation{stats.expiringSoon > 1 ? "s" : ""} expiring within 24 hours
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Invitations</CardTitle>
              <CardDescription>Manage workspace invitations</CardDescription>
            </div>
            {stats && stats.expired > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCleanupExpired}
                disabled={isCleaningUp}
              >
                {isCleaningUp ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Cleanup Expired
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Search & Filter */}
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending" className="gap-1">
                <Clock className="h-3 w-3" />
                Pending
                {stats?.pending ? <Badge variant="secondary" className="ml-1 h-5 px-1.5">{stats.pending}</Badge> : null}
              </TabsTrigger>
              <TabsTrigger value="accepted" className="gap-1">
                <CheckCircle className="h-3 w-3" />
                Accepted
              </TabsTrigger>
              <TabsTrigger value="declined" className="gap-1">
                <XCircle className="h-3 w-3" />
                Declined
              </TabsTrigger>
              <TabsTrigger value="expired" className="gap-1">
                <AlertTriangle className="h-3 w-3" />
                Expired
              </TabsTrigger>
            </TabsList>

            <div className="mt-4 border rounded-lg divide-y">
              {filteredInvitations.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Mail className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No invitations found</p>
                </div>
              ) : (
                filteredInvitations.map((inv: any) => (
                  <InvitationRow
                    key={inv._id}
                    invitation={inv}
                    onCancel={handleCancel}
                    onResend={handleResend}
                    roles={roles}
                  />
                ))
              )}
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
