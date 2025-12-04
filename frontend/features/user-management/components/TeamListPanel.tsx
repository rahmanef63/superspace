/**
 * TeamListPanel
 * 
 * Displays teams and friends list for quick management.
 * Allows creating teams and adding members.
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Users, 
  Plus, 
  Search,
  UserPlus,
  MoreHorizontal,
  Crown,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Id } from "@convex/_generated/dataModel";
import type { Team, HierarchyMemberOverview, TeamMember } from "../types";
import { useCreateTeam, useFriends, useTeamMembers } from "../api";
import { useToast } from "@/hooks/use-toast";

interface TeamListPanelProps {
  workspaceId: Id<"workspaces">;
  teams: Team[];
  overview: HierarchyMemberOverview | null | undefined;
  className?: string;
}

export function TeamListPanel({
  workspaceId,
  teams,
  overview,
  className,
}: TeamListPanelProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedTeamId, setSelectedTeamId] = React.useState<Id<"userTeams"> | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const [newTeamName, setNewTeamName] = React.useState("");
  const [newTeamDescription, setNewTeamDescription] = React.useState("");
  
  const friends = useFriends();
  const teamMembers = useTeamMembers(selectedTeamId ?? undefined);
  const createTeam = useCreateTeam();
  const { toast } = useToast();

  const filteredTeams = React.useMemo(() => {
    if (!searchQuery) return teams;
    const query = searchQuery.toLowerCase();
    return teams.filter(
      (team) =>
        team.name.toLowerCase().includes(query) ||
        team.description?.toLowerCase().includes(query)
    );
  }, [teams, searchQuery]);

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) return;

    try {
      await createTeam({
        workspaceId,
        name: newTeamName.trim(),
        description: newTeamDescription.trim() || undefined,
      });
      toast({
        title: "Team created",
        description: `Team "${newTeamName}" has been created successfully.`,
      });
      setNewTeamName("");
      setNewTeamDescription("");
      setIsCreateDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create team",
        variant: "destructive",
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={cn("flex h-full gap-4", className)}>
      {/* Left: Teams list */}
      <div className="w-1/2 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
            Teams ({teams.length})
          </h3>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="h-7 gap-1">
                <Plus className="w-3.5 h-3.5" />
                Create Team
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Team</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="teamName">Team Name</Label>
                  <Input
                    id="teamName"
                    placeholder="e.g., Marketing Team"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teamDescription">Description (optional)</Label>
                  <Textarea
                    id="teamDescription"
                    placeholder="Describe the team's purpose..."
                    value={newTeamDescription}
                    onChange={(e) => setNewTeamDescription(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleCreateTeam} disabled={!newTeamName.trim()}>
                  Create Team
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative mb-3">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search teams..."
            className="pl-8 h-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <ScrollArea className="flex-1">
          <div className="space-y-2 pr-3">
            {filteredTeams.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No teams yet</p>
                <p className="text-xs">Create a team to group users for batch operations</p>
              </div>
            ) : (
              filteredTeams.map((team) => (
                <Card
                  key={String(team._id)}
                  className={cn(
                    "cursor-pointer transition-colors hover:bg-muted/50",
                    selectedTeamId === team._id && "border-primary bg-primary/5"
                  )}
                  onClick={() => setSelectedTeamId(team._id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded-md flex items-center justify-center text-xs font-medium text-white"
                          style={{ backgroundColor: team.color ?? "#6366f1" }}
                        >
                          {team.icon ?? getInitials(team.name)}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{team.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {team.memberCount ?? 0} members
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <UserPlus className="w-4 h-4 mr-2" />
                            Add Members
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Team
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    {team.description && (
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                        {team.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Right: Team members or Friends */}
      <div className="w-1/2 flex flex-col border-l pl-4">
        {selectedTeamId ? (
          <>
            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide mb-3">
              Team Members
            </h3>
            <ScrollArea className="flex-1">
              <div className="space-y-2 pr-3">
                {!teamMembers || teamMembers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <UserPlus className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No members yet</p>
                    <Button size="sm" variant="outline" className="mt-2">
                      Add Members
                    </Button>
                  </div>
                ) : (
                  (teamMembers as TeamMember[]).map((member) => (
                    <div
                      key={String(member._id)}
                      className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-2.5">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={member.user?.avatarUrl ?? undefined} />
                          <AvatarFallback className="text-xs">
                            {getInitials(member.user?.name ?? "?")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium flex items-center gap-1">
                            {member.user?.name ?? "Unknown"}
                            {member.role === "leader" && (
                              <Crown className="w-3.5 h-3.5 text-yellow-500" />
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {member.user?.email}
                          </div>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {member.role}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </>
        ) : (
          <>
            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide mb-3">
              Friends ({friends?.length ?? 0})
            </h3>
            <ScrollArea className="flex-1">
              <div className="space-y-2 pr-3">
                {!friends || friends.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No friends yet</p>
                    <p className="text-xs">Add friends to quickly invite them to workspaces</p>
                  </div>
                ) : (
                  friends.map((friendship: any) => (
                    <div
                      key={String(friendship._id)}
                      className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-2.5">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={friendship.friend?.avatarUrl ?? undefined} />
                          <AvatarFallback className="text-xs">
                            {getInitials(friendship.friend?.name ?? "?")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium">
                            {friendship.friend?.name ?? "Unknown"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {friendship.friend?.email}
                          </div>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" className="h-7 gap-1">
                        <UserPlus className="w-3.5 h-3.5" />
                        Invite
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </>
        )}
      </div>
    </div>
  );
}

export default TeamListPanel;
