"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import {
  Search,
  Filter,
  MoreHorizontal,
  UserX,
  Shield,
  Loader2,
  User,
  Users,
  Building2,
  Mail,
  Calendar,
  X,
  RefreshCw,
  Eye,
  Ban,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { useTableSortAndFilter, ColumnDef } from "../hooks/useTableSortAndFilter";
import { EnhancedTableHeader } from "./EnhancedTableHeader";

function StatCard({ title, value, icon: Icon }: { title: string; value: number | string; icon: React.ElementType }) {
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

function UserDetailsDialog({ 
  user, 
  isOpen, 
  onClose,
  workspaces,
}: { 
  user: any; 
  isOpen: boolean; 
  onClose: () => void;
  workspaces: any[] | undefined;
}) {
  const userWorkspaces = useMemo(() => {
    if (!workspaces || !user) return [];
    // Filter workspaces where user is a member
    return workspaces.filter((ws: any) => ws.createdBy === user._id);
  }, [workspaces, user]);

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>
            View detailed information about this user
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* User Info */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.avatarUrl} alt={user.name} />
              <AvatarFallback className="text-xl">
                {(user.name || user.email || "?")
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold">{user.name || "Unknown"}</h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <Badge
                className={cn(
                  "mt-1",
                  user.status === "active" && "bg-green-100 text-green-800",
                  user.status === "inactive" && "bg-gray-100 text-gray-800",
                  user.status === "blocked" && "bg-red-100 text-red-800"
                )}
              >
                {user.status || "active"}
              </Badge>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">User ID</span>
              <p className="font-mono text-xs">{user._id}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Clerk ID</span>
              <p className="font-mono text-xs">{user.clerkId || "Not linked"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Created</span>
              <p>{user._creationTime ? formatDistanceToNow(user._creationTime, { addSuffix: true }) : "Unknown"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Workspaces Owned</span>
              <p>{userWorkspaces.length}</p>
            </div>
          </div>

          {/* Workspaces */}
          {userWorkspaces.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Owned Workspaces</h4>
              <div className="border rounded-lg divide-y max-h-[200px] overflow-y-auto">
                {userWorkspaces.map((ws: any) => (
                  <div key={ws._id} className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span>{ws.name}</span>
                      <Badge variant="outline" className="text-xs">{ws.type}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function PlatformUsersTable() {
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Platform admin queries
  // @ts-ignore - Generated types may not be immediately available
  const users = useQuery((api as any).dev.platformAdmin.listUsers, {}) as any[] | undefined;
  // @ts-ignore - Generated types may not be immediately available
  const workspaces = useQuery((api as any).dev.platformAdmin.listWorkspaces, {}) as any[] | undefined;

  // Define columns for sorting and filtering
  const columns: ColumnDef<any>[] = [
    {
      key: "name",
      label: "User",
      sortable: true,
      filterable: true,
    },
    {
      key: "email",
      label: "Email",
      sortable: true,
      filterable: true,
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      filterable: true,
    },
    {
      key: "_creationTime",
      label: "Created",
      sortable: true,
      sortFn: (a, b) => a._creationTime - b._creationTime,
    },
  ];

  // Use the sorting and filtering hook
  const {
    searchQuery,
    filters,
    sortConfig,
    setSearchQuery,
    handleSort,
    handleFilter,
    clearFilters,
    hasActiveFilters,
    processedData: filteredUsers,
  } = useTableSortAndFilter({
    data: users,
    columns,
    initialFilters: { status: "all" },
  });

  const stats = useMemo(() => {
    if (!users) return { total: 0, active: 0, inactive: 0, blocked: 0 };
    return {
      total: users.length,
      active: users.filter((u: any) => (u.status || "active") === "active").length,
      inactive: users.filter((u: any) => u.status === "inactive").length,
      blocked: users.filter((u: any) => u.status === "blocked").length,
    };
  }, [users]);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={stats.total} icon={Users} />
        <StatCard title="Active" value={stats.active} icon={CheckCircle} />
        <StatCard title="Inactive" value={stats.inactive} icon={UserX} />
        <StatCard title="Blocked" value={stats.blocked} icon={Ban} />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Platform Users</CardTitle>
              <CardDescription>
                View and manage all users across the platform
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select
              value={filters.status || "all"}
              onValueChange={(v) => handleFilter("status", v === "all" ? null : v)}
            >
              <SelectTrigger className="w-[130px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button variant="ghost" size="icon" onClick={clearFilters}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Table */}
          {users === undefined ? (
            <div className="p-8 text-center">
              <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin text-muted-foreground" />
              <p className="text-muted-foreground">Loading users...</p>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <EnhancedTableHeader
                      sortable={true}
                      sortDirection={sortConfig.key === "name" ? sortConfig.direction : null}
                      isActive={sortConfig.key === "name"}
                      onSort={() => handleSort("name")}
                    >
                      User
                    </EnhancedTableHeader>
                    <EnhancedTableHeader
                      sortable={true}
                      sortDirection={sortConfig.key === "email" ? sortConfig.direction : null}
                      isActive={sortConfig.key === "email"}
                      onSort={() => handleSort("email")}
                    >
                      Email
                    </EnhancedTableHeader>
                    <EnhancedTableHeader
                      sortable={true}
                      sortDirection={sortConfig.key === "status" ? sortConfig.direction : null}
                      isActive={sortConfig.key === "status"}
                      onSort={() => handleSort("status")}
                    >
                      Status
                    </EnhancedTableHeader>
                    <EnhancedTableHeader
                      sortable={true}
                      sortDirection={sortConfig.key === "_creationTime" ? sortConfig.direction : null}
                      isActive={sortConfig.key === "_creationTime"}
                      onSort={() => handleSort("_creationTime")}
                    >
                      Created
                    </EnhancedTableHeader>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-muted-foreground">No users found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user: any) => (
                      <TableRow key={user._id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.avatarUrl} alt={user.name} />
                              <AvatarFallback className="text-xs">
                                {(user.name || user.email || "?")
                                  .split(" ")
                                  .map((n: string) => n[0])
                                  .join("")
                                  .toUpperCase()
                                  .slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{user.name || "Unknown"}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{user.email}</TableCell>
                        <TableCell>
                          <Badge
                            className={cn(
                              "text-xs",
                              (user.status || "active") === "active" && "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
                              user.status === "inactive" && "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
                              user.status === "blocked" && "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                            )}
                          >
                            {user.status || "active"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {user._creationTime ? formatDistanceToNow(user._creationTime, { addSuffix: true }) : "Unknown"}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setSelectedUser(user)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                <Ban className="h-4 w-4 mr-2" />
                                Block User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <UserDetailsDialog
        user={selectedUser}
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        workspaces={workspaces}
      />
    </div>
  );
}
