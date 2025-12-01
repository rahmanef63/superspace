"use client";

import { useState } from "react";
import type { Id } from "@convex/_generated/dataModel";
import { useSendBulkInvitations, useRoles } from "../api";
import {
  Users,
  Mail,
  Send,
  Loader2,
  X,
  Plus,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface BulkInviteDialogProps {
  workspaceId: Id<"workspaces">;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

interface InviteEntry {
  email: string;
  roleId: Id<"roles"> | "";
  message?: string;
}

interface InviteResult {
  email: string;
  success: boolean;
  error?: string;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function BulkInviteDialog({ workspaceId, trigger, onSuccess }: BulkInviteDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [entries, setEntries] = useState<InviteEntry[]>([{ email: "", roleId: "" }]);
  const [globalRoleId, setGlobalRoleId] = useState<Id<"roles"> | "">("");
  const [globalMessage, setGlobalMessage] = useState("");
  const [results, setResults] = useState<InviteResult[] | null>(null);
  const [bulkInput, setBulkInput] = useState("");
  const [inputMode, setInputMode] = useState<"individual" | "bulk">("individual");

  const roles = useRoles(workspaceId);
  const sendBulkInvitations = useSendBulkInvitations();

  const addEntry = () => {
    setEntries([...entries, { email: "", roleId: globalRoleId }]);
  };

  const removeEntry = (index: number) => {
    if (entries.length === 1) return;
    setEntries(entries.filter((_, i) => i !== index));
  };

  const updateEntry = (index: number, field: keyof InviteEntry, value: string) => {
    const updated = [...entries];
    updated[index] = { ...updated[index], [field]: value };
    setEntries(updated);
  };

  const parseBulkInput = () => {
    const lines = bulkInput
      .split(/[\n,;]/)
      .map((line) => line.trim())
      .filter(Boolean);
    
    const emails = lines.filter(isValidEmail);
    const newEntries: InviteEntry[] = emails.map((email) => ({
      email,
      roleId: globalRoleId,
    }));

    if (newEntries.length > 0) {
      setEntries(newEntries);
      setBulkInput("");
      setInputMode("individual");
      toast.success(`Parsed ${newEntries.length} email(s)`);
    } else {
      toast.error("No valid emails found");
    }
  };

  const handleSubmit = async () => {
    const validEntries = entries.filter((e) => isValidEmail(e.email) && e.roleId);
    
    if (validEntries.length === 0) {
      toast.error("Please add at least one valid email with a role");
      return;
    }

    setIsLoading(true);
    setResults(null);

    try {
      const invitations = validEntries.map((e) => ({
        email: e.email,
        roleId: e.roleId as Id<"roles">,
        message: globalMessage || undefined,
      }));

      const response = await sendBulkInvitations({ workspaceId, invitations });
      
      setResults(response as InviteResult[]);
      
      const successCount = response.filter((r: any) => r.success).length;
      const failCount = response.filter((r: any) => !r.success).length;

      if (successCount > 0 && failCount === 0) {
        toast.success(`Successfully sent ${successCount} invitation(s)`);
        onSuccess?.();
        setTimeout(() => {
          setIsOpen(false);
          resetForm();
        }, 2000);
      } else if (successCount > 0) {
        toast.warning(`Sent ${successCount}, failed ${failCount}`);
      } else {
        toast.error(`All ${failCount} invitation(s) failed`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send invitations");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEntries([{ email: "", roleId: "" }]);
    setGlobalRoleId("");
    setGlobalMessage("");
    setResults(null);
    setBulkInput("");
    setInputMode("individual");
  };

  const validCount = entries.filter((e) => isValidEmail(e.email) && e.roleId).length;
  const invalidCount = entries.filter((e) => e.email && !isValidEmail(e.email)).length;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) resetForm();
    }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <Users className="h-4 w-4 mr-2" />
            Bulk Invite
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Invite Members</DialogTitle>
          <DialogDescription>
            Invite multiple people to your workspace at once
          </DialogDescription>
        </DialogHeader>

        {results ? (
          <div className="py-4 space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">{results.filter(r => r.success).length} Sent</span>
              </div>
              <div className="flex items-center gap-2 text-red-600">
                <XCircle className="h-5 w-5" />
                <span className="font-medium">{results.filter(r => !r.success).length} Failed</span>
              </div>
            </div>

            <div className="border rounded-lg divide-y max-h-[300px] overflow-y-auto">
              {results.map((result, index) => (
                <div key={index} className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {result.success ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm">{result.email}</span>
                  </div>
                  {result.error && (
                    <span className="text-xs text-red-500">{result.error}</span>
                  )}
                </div>
              ))}
            </div>

            <DialogFooter>
              <Button onClick={() => {
                setIsOpen(false);
                resetForm();
              }}>
                Done
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <>
            <div className="space-y-4 py-4">
              {/* Global Settings */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Default Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Default Role</label>
                    <Select value={globalRoleId} onValueChange={(v) => {
                      setGlobalRoleId(v as Id<"roles">);
                      setEntries(entries.map(e => ({ ...e, roleId: e.roleId || v as Id<"roles"> })));
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a default role" />
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

                  <div>
                    <label className="text-sm font-medium mb-1 block">Message (Optional)</label>
                    <Textarea
                      value={globalMessage}
                      onChange={(e) => setGlobalMessage(e.target.value)}
                      placeholder="Add a personal message to all invitations..."
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Input Mode Toggle */}
              <div className="flex gap-2">
                <Button
                  variant={inputMode === "individual" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setInputMode("individual")}
                >
                  Individual
                </Button>
                <Button
                  variant={inputMode === "bulk" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setInputMode("bulk")}
                >
                  Paste List
                </Button>
              </div>

              {inputMode === "bulk" ? (
                <div className="space-y-2">
                  <Textarea
                    value={bulkInput}
                    onChange={(e) => setBulkInput(e.target.value)}
                    placeholder="Paste email addresses (one per line, or separated by commas)"
                    rows={5}
                  />
                  <Button onClick={parseBulkInput} disabled={!bulkInput.trim()}>
                    Parse Emails
                  </Button>
                </div>
              ) : (
                <>
                  {/* Email Entries */}
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {entries.map((entry, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="flex-1 relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            value={entry.email}
                            onChange={(e) => updateEntry(index, "email", e.target.value)}
                            placeholder="email@example.com"
                            className={cn(
                              "pl-9",
                              entry.email && !isValidEmail(entry.email) && "border-red-500"
                            )}
                          />
                        </div>
                        <Select
                          value={entry.roleId}
                          onValueChange={(v) => updateEntry(index, "roleId", v)}
                        >
                          <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Role" />
                          </SelectTrigger>
                          <SelectContent>
                            {roles?.map((role) => (
                              <SelectItem key={role._id} value={role._id}>
                                {role.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeEntry(index)}
                          disabled={entries.length === 1}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <Button variant="outline" onClick={addEntry} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Another
                  </Button>
                </>
              )}

              {/* Summary */}
              <div className="flex items-center gap-4 text-sm">
                <span className="text-green-600">{validCount} valid</span>
                {invalidCount > 0 && (
                  <span className="text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {invalidCount} invalid
                  </span>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isLoading || validCount === 0}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send {validCount} Invitation{validCount !== 1 ? "s" : ""}
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
