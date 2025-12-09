/**
 * QuickInvitePanel
 * 
 * Provides quick invite features:
 * - Invite Contacts to workspace with checkboxes
 * - Invite to hierarchy (workspace + children)
 * - Bulk team invitations
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  UserPlus, 
  Users,
  GitBranch,
  Send,
  Check,
  X,
  Search,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { Id } from "@convex/_generated/dataModel";
import type { ContactForQuickInvite, Team, PropagationStrategy } from "../types";
import { 
  useBulkInviteContacts, 
  useInviteToHierarchy,
  useInviteTeamToWorkspaces,
  useRoles,
} from "../api";
import { useToast } from "@/hooks/use-toast";

interface QuickInvitePanelProps {
  workspaceId: Id<"workspaces">;
  Contacts: ContactForQuickInvite[];
  teams: Team[];
  className?: string;
}

export function QuickInvitePanel({
  workspaceId,
  Contacts,
  teams,
  className,
}: QuickInvitePanelProps) {
  // State
  const [mode, setMode] = React.useState<"Contacts" | "hierarchy" | "team">("Contacts");
  const [selectedContactIds, setSelectedContactIds] = React.useState<Set<string>>(new Set());
  const [selectedTeamId, setSelectedTeamId] = React.useState<string>("");
  const [selectedRoleId, setSelectedRoleId] = React.useState<string>("");
  const [hierarchyEmail, setHierarchyEmail] = React.useState("");
  const [propagateToChildren, setPropagateToChildren] = React.useState(true);
  const [propagationStrategy, setPropagationStrategy] = React.useState<PropagationStrategy>("same");
  const [message, setMessage] = React.useState("");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  // Hooks
  const roles = useRoles(workspaceId);
  const bulkInviteContacts = useBulkInviteContacts();
  const inviteToHierarchy = useInviteToHierarchy();
  const inviteTeamToWorkspaces = useInviteTeamToWorkspaces();
  const { toast } = useToast();

  // Filter Contacts
  const filteredContacts = React.useMemo(() => {
    if (!searchQuery) return Contacts;
    const query = searchQuery.toLowerCase();
    return Contacts.filter(
      (f) =>
        f.name?.toLowerCase().includes(query) ||
        f.email?.toLowerCase().includes(query)
    );
  }, [Contacts, searchQuery]);

  // Available (non-pending) Contacts
  const availableContacts = filteredContacts.filter((f) => !f.hasPendingInvite);

  const toggleContactSelection = (ContactId: string) => {
    const newSet = new Set(selectedContactIds);
    if (newSet.has(ContactId)) {
      newSet.delete(ContactId);
    } else {
      newSet.add(ContactId);
    }
    setSelectedContactIds(newSet);
  };

  const selectAllContacts = () => {
    setSelectedContactIds(new Set(availableContacts.map((f) => String(f._id))));
  };

  const clearSelection = () => {
    setSelectedContactIds(new Set());
  };

  const getInitials = (name?: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Handle bulk invite Contacts
  const handleBulkInviteContacts = async () => {
    if (selectedContactIds.size === 0 || !selectedRoleId) return;

    setIsSubmitting(true);
    try {
      const result = await bulkInviteContacts({
        workspaceId,
        ContactIds: Array.from(selectedContactIds) as Id<"users">[],
        roleId: selectedRoleId as Id<"roles">,
        message: message || undefined,
      });

      toast({
        title: "Invitations sent",
        description: `Successfully sent ${result.successCount} of ${result.totalInvites} invitations.`,
      });

      setSelectedContactIds(new Set());
      setMessage("");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send invitations",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle hierarchy invite
  const handleHierarchyInvite = async () => {
    if (!hierarchyEmail || !selectedRoleId) return;

    setIsSubmitting(true);
    try {
      const result = await inviteToHierarchy({
        workspaceId,
        inviteeEmail: hierarchyEmail,
        baseRoleId: selectedRoleId as Id<"roles">,
        propagateToChildren,
        propagationStrategy,
        message: message || undefined,
      });

      toast({
        title: "Hierarchy invitation sent",
        description: `Successfully invited to ${result.successCount} of ${result.totalWorkspaces} workspaces.`,
      });

      setHierarchyEmail("");
      setMessage("");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send hierarchy invitation",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle team invite
  const handleTeamInvite = async () => {
    if (!selectedTeamId || !selectedRoleId) return;

    setIsSubmitting(true);
    try {
      const result = await inviteTeamToWorkspaces({
        teamId: selectedTeamId as Id<"userTeams">,
        workspaceIds: [workspaceId],
        roleId: selectedRoleId as Id<"roles">,
        message: message || undefined,
      });

      toast({
        title: "Team invited",
        description: `Successfully sent ${result.successCount} of ${result.totalInvites} invitations.`,
      });

      setSelectedTeamId("");
      setMessage("");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to invite team",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn("flex h-full gap-4", className)}>
      {/* Left: Mode selection and form */}
      <div className="w-1/2 flex flex-col">
        {/* Mode tabs */}
        <div className="flex gap-2 mb-4">
          <Button
            size="sm"
            variant={mode === "Contacts" ? "default" : "outline"}
            onClick={() => setMode("Contacts")}
            className="flex-1 gap-1.5"
          >
            <UserPlus className="w-4 h-4" />
            Contacts
          </Button>
          <Button
            size="sm"
            variant={mode === "hierarchy" ? "default" : "outline"}
            onClick={() => setMode("hierarchy")}
            className="flex-1 gap-1.5"
          >
            <GitBranch className="w-4 h-4" />
            Hierarchy
          </Button>
          <Button
            size="sm"
            variant={mode === "team" ? "default" : "outline"}
            onClick={() => setMode("team")}
            className="flex-1 gap-1.5"
          >
            <Users className="w-4 h-4" />
            Team
          </Button>
        </div>

        {/* Common: Role selection */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Role to assign</Label>
            <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roles?.map((role: any) => (
                  <SelectItem key={String(role._id)} value={String(role._id)}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: role.color ?? "#6366f1" }}
                      />
                      {role.name}
                      {role.level !== undefined && (
                        <span className="text-xs text-muted-foreground">
                          (Level {role.level})
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Mode-specific form */}
          {mode === "Contacts" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Select Contacts to invite</Label>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 text-xs"
                    onClick={selectAllContacts}
                  >
                    Select all
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 text-xs"
                    onClick={clearSelection}
                  >
                    Clear
                  </Button>
                </div>
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search Contacts..."
                  className="pl-8 h-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          )}

          {mode === "hierarchy" && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Email address</Label>
                <Input
                  type="email"
                  placeholder="user@example.com"
                  value={hierarchyEmail}
                  onChange={(e) => setHierarchyEmail(e.target.value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Propagate to child workspaces</Label>
                  <p className="text-xs text-muted-foreground">
                    Invite to this workspace and all its children
                  </p>
                </div>
                <Switch
                  checked={propagateToChildren}
                  onCheckedChange={setPropagateToChildren}
                />
              </div>
              {propagateToChildren && (
                <div className="space-y-2">
                  <Label>Role propagation strategy</Label>
                  <Select
                    value={propagationStrategy}
                    onValueChange={(v) => setPropagationStrategy(v as PropagationStrategy)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="same">
                        Same role in all workspaces
                      </SelectItem>
                      <SelectItem value="decreasing">
                        Decreasing role level (less power in children)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          {mode === "team" && (
            <div className="space-y-2">
              <Label>Select team</Label>
              <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={String(team._id)} value={String(team._id)}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded flex items-center justify-center text-[8px] text-white"
                          style={{ backgroundColor: team.color ?? "#6366f1" }}
                        >
                          {team.name[0]}
                        </div>
                        {team.name}
                        <span className="text-xs text-muted-foreground">
                          ({team.memberCount ?? 0} members)
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Advanced options toggle */}
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-between"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            Advanced options
            {showAdvanced ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>

          {showAdvanced && (
            <div className="space-y-2">
              <Label>Personal message (optional)</Label>
              <Textarea
                placeholder="Add a personal message to the invitation..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
              />
            </div>
          )}

          {/* Submit button */}
          <Button
            className="w-full gap-2"
            disabled={
              isSubmitting ||
              !selectedRoleId ||
              (mode === "Contacts" && selectedContactIds.size === 0) ||
              (mode === "hierarchy" && !hierarchyEmail) ||
              (mode === "team" && !selectedTeamId)
            }
            onClick={
              mode === "Contacts"
                ? handleBulkInviteContacts
                : mode === "hierarchy"
                ? handleHierarchyInvite
                : handleTeamInvite
            }
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {mode === "Contacts" && `Invite ${selectedContactIds.size} Contacts`}
            {mode === "hierarchy" && "Send hierarchy invitation"}
            {mode === "team" && "Invite entire team"}
          </Button>
        </div>
      </div>

      {/* Right: Contacts list (for Contacts mode) */}
      {mode === "Contacts" && (
        <div className="w-1/2 flex flex-col border-l pl-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-sm">
              Available Contacts ({availableContacts.length})
            </h3>
            {selectedContactIds.size > 0 && (
              <Badge variant="secondary">
                {selectedContactIds.size} selected
              </Badge>
            )}
          </div>
          <ScrollArea className="flex-1">
            <div className="space-y-1 pr-3">
              {availableContacts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <UserPlus className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No Contacts available to invite</p>
                  <p className="text-xs">
                    All your Contacts are already members or have pending invitations
                  </p>
                </div>
              ) : (
                availableContacts.map((Contact) => (
                  <div
                    key={String(Contact._id)}
                    className={cn(
                      "flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors",
                      selectedContactIds.has(String(Contact._id))
                        ? "bg-primary/10 border border-primary/30"
                        : "hover:bg-muted/50"
                    )}
                    onClick={() => toggleContactSelection(String(Contact._id))}
                  >
                    <Checkbox
                      checked={selectedContactIds.has(String(Contact._id))}
                      onCheckedChange={() => toggleContactSelection(String(Contact._id))}
                    />
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={Contact.avatarUrl} />
                      <AvatarFallback className="text-xs">
                        {getInitials(Contact.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {Contact.name ?? "Unknown"}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {Contact.email}
                      </div>
                    </div>
                  </div>
                ))
              )}

              {/* Contacts with pending invites */}
              {filteredContacts.some((f) => f.hasPendingInvite) && (
                <>
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mt-4 mb-2">
                    Pending Invitations
                  </div>
                  {filteredContacts
                    .filter((f) => f.hasPendingInvite)
                    .map((Contact) => (
                      <div
                        key={String(Contact._id)}
                        className="flex items-center gap-3 p-2 rounded-md opacity-50"
                      >
                        <Checkbox disabled checked={false} />
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={Contact.avatarUrl} />
                          <AvatarFallback className="text-xs">
                            {getInitials(Contact.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">
                            {Contact.name ?? "Unknown"}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {Contact.email}
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          Pending
                        </Badge>
                      </div>
                    ))}
                </>
              )}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Right: Info for hierarchy/team mode */}
      {(mode === "hierarchy" || mode === "team") && (
        <div className="w-1/2 flex flex-col border-l pl-4">
          <Card className="flex-1">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                {mode === "hierarchy" ? (
                  <>
                    <GitBranch className="w-4 h-4" />
                    Hierarchy Invitation
                  </>
                ) : (
                  <>
                    <Users className="w-4 h-4" />
                    Team Invitation
                  </>
                )}
              </CardTitle>
              <CardDescription>
                {mode === "hierarchy"
                  ? "Invite a user to this workspace and optionally all its child workspaces at once."
                  : "Invite all members of a team to this workspace with a single action."
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mode === "hierarchy" && (
                <>
                  <div className="p-3 bg-muted rounded-lg text-sm">
                    <h4 className="font-medium mb-2">How it works:</h4>
                    <ul className="space-y-1 text-muted-foreground text-xs">
                      <li className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-green-500 mt-0.5" />
                        <span>User receives invitations for each workspace</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-green-500 mt-0.5" />
                        <span>Role can be same or decrease per level</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-green-500 mt-0.5" />
                        <span>Tracks overall invitation status</span>
                      </li>
                    </ul>
                  </div>
                  {propagateToChildren && propagationStrategy === "decreasing" && (
                    <div className="p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg text-sm">
                      <div className="flex items-start gap-2 text-orange-700 dark:text-orange-400">
                        <AlertCircle className="w-4 h-4 mt-0.5" />
                        <div>
                          <p className="font-medium">Decreasing role level</p>
                          <p className="text-xs mt-1">
                            Each child workspace will have a lower privilege role 
                            (e.g., Admin → Manager → Staff)
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {mode === "team" && (
                <div className="p-3 bg-muted rounded-lg text-sm">
                  <h4 className="font-medium mb-2">How it works:</h4>
                  <ul className="space-y-1 text-muted-foreground text-xs">
                    <li className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-green-500 mt-0.5" />
                      <span>All team members receive invitations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-green-500 mt-0.5" />
                      <span>Same role applied to all members</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-green-500 mt-0.5" />
                      <span>Already-members are skipped</span>
                    </li>
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default QuickInvitePanel;
