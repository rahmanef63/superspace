"use client";

import { useState, useMemo } from "react";
import type { Id } from "@convex/_generated/dataModel";
import { useSearchMembers, useRoles, useRemoveMember, useUpdateMemberRole } from "../api";
import {
  Search,
  Filter,
  MoreHorizontal,
  UserMinus,
  Shield,
  Loader2,
  User,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

interface MemberSearchProps {
  workspaceId: Id<"workspaces">;
  onSelectMember?: (member: any) => void;
}

function MemberCard({
  member,
  roles,
  onRemove,
  onUpdateRole,
  workspaceId,
}: {
  member: any;
  roles: any[] | undefined;
  onRemove: (userId: Id<"users">) => Promise<void>;
  onUpdateRole: (userId: Id<"users">, roleId: Id<"roles">) => Promise<void>;
  workspaceId: Id<"workspaces">;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<Id<"roles"> | "">(member.roleId);

  const handleRemove = async () => {
    if (!confirm(`Are you sure you want to remove ${member.name || member.email} from this workspace?`)) return;
    setIsLoading(true);
    try {
      await onRemove(member.userId);
      toast.success("Member removed");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to remove member");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedRoleId) return;
    setIsLoading(true);
    try {
      await onUpdateRole(member.userId, selectedRoleId);
      toast.success("Role updated");
      setShowRoleDialog(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update role");
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <div className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors rounded-lg">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={member.image} alt={member.name} />
            <AvatarFallback>{getInitials(member.name || member.email || "?")}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="font-medium truncate">{member.name || "Unknown"}</div>
            <div className="text-xs text-muted-foreground truncate">{member.email}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="gap-1"
            style={{ borderColor: member.role?.color, color: member.role?.color }}
          >
            <Shield className="h-3 w-3" />
            {member.role?.name || "Unknown Role"}
          </Badge>

          <Badge
            variant="secondary"
            className={cn(
              member.status === "active" && "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
              member.status === "inactive" && "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
              member.status === "pending" && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
            )}
          >
            {member.status}
          </Badge>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowRoleDialog(true)}>
                <Shield className="h-4 w-4 mr-2" />
                Change Role
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleRemove} className="text-destructive">
                <UserMinus className="h-4 w-4 mr-2" />
                Remove Member
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Member Role</DialogTitle>
            <DialogDescription>
              Update role for {member.name || member.email}
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
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: role.color }}
                      />
                      {role.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRoleDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateRole} disabled={isLoading || !selectedRoleId}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Role"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function MemberSearch({ workspaceId, onSelectMember }: MemberSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"active" | "inactive" | "pending" | "all">("all");
  const [roleFilter, setRoleFilter] = useState<Id<"roles"> | "all">("all");

  const roles = useRoles(workspaceId);
  const members = useSearchMembers(
    workspaceId,
    searchQuery,
    {
      status: statusFilter === "all" ? undefined : statusFilter,
      roleId: roleFilter === "all" ? undefined : roleFilter,
      limit: 50,
    }
  );

  const removeMember = useRemoveMember();
  const updateRole = useUpdateMemberRole();

  const handleRemove = async (userId: Id<"users">) => {
    await removeMember({ workspaceId, userId });
  };

  const handleUpdateRole = async (userId: Id<"users">, roleId: Id<"roles">) => {
    await updateRole({ workspaceId, userId, roleId });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setRoleFilter("all");
  };

  const hasFilters = searchQuery || statusFilter !== "all" || roleFilter !== "all";

  return (
    <div className="space-y-4">
      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
            <SelectTrigger className="w-[130px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>

          <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as typeof roleFilter)}>
            <SelectTrigger className="w-[150px]">
              <Shield className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {roles?.map((role) => (
                <SelectItem key={role._id} value={role._id}>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: role.color }}
                    />
                    {role.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasFilters && (
            <Button variant="ghost" size="icon" onClick={clearFilters}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Results count */}
      {members && (
        <div className="text-sm text-muted-foreground">
          {members.length} member{members.length !== 1 ? "s" : ""} found
        </div>
      )}

      {/* Members List */}
      <div className="border rounded-lg divide-y">
        {members === undefined ? (
          <div className="p-8 text-center">
            <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        ) : members.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No members found</p>
            {hasFilters && (
              <Button variant="link" onClick={clearFilters} className="mt-2">
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          members.map((member: any) => (
            <MemberCard
              key={member._id}
              member={member}
              roles={roles}
              onRemove={handleRemove}
              onUpdateRole={handleUpdateRole}
              workspaceId={workspaceId}
            />
          ))
        )}
      </div>
    </div>
  );
}
