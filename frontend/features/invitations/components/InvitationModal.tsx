"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { 
  X, 
  Mail, 
  Users, 
  UserPlus,
  Send,
  Loader2
} from "lucide-react";
import type { InvitationModalProps } from "../types";

export function InvitationModal({ workspaceId, type, onClose }: InvitationModalProps) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState<Id<"roles"> | "">("");
  const [isLoading, setIsLoading] = useState(false);

  const sendWorkspaceInvitation = useMutation(api.workspace.invitations.sendWorkspaceInvitation);
  const sendPersonalInvitation = useMutation(api.workspace.invitations.sendPersonalInvitation);
  
  const roles = useQuery(
    api.workspace.roles.getAllRoles,
    workspaceId ? { workspaceId } : undefined
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      alert("Please enter an email address");
      return;
    }

    if (type === "workspace" && !selectedRoleId) {
      alert("Please select a role");
      return;
    }

    setIsLoading(true);

    try {
      if (type === "workspace" && workspaceId) {
        await sendWorkspaceInvitation({
          workspaceId,
          inviteeEmail: email.trim(),
          roleId: selectedRoleId as Id<"roles">,
          message: message.trim() || undefined,
        });
      } else {
        await sendPersonalInvitation({
          inviteeEmail: email.trim(),
          message: message.trim() || undefined,
        });
      }

      // Show success notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-500 text-primary px-6 py-3 rounded-lg shadow-lg z-50';
      notification.textContent = 'Invitation sent successfully!';
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
      onClose();
    } catch (error) {
      console.error("Failed to send invitation:", error);
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-red-500 text-primary px-6 py-3 rounded-lg shadow-lg z-50';
      notification.textContent = error instanceof Error ? error.message : "Failed to send invitation";
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            {type === "workspace" ? (
              <Users className="w-5 h-5 text-blue-600" />
            ) : (
              <UserPlus className="w-5 h-5 text-green-600" />
            )}
            <h2 className="text-lg font-semibold">
              {type === "workspace" ? "Invite to Workspace" : "Send Contact Request"}
            </h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter email address"
                required
              />
            </div>
          </div>

          {type === "workspace" && roles && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role *
              </label>
              <select
                value={selectedRoleId}
                onChange={(e) => setSelectedRoleId(e.target.value as Id<"roles"> | "")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a role</option>
                {roles.map((role) => (
                  <option key={role._id} value={role._id}>
                    {role.name} - {role.description}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Personal Message (Optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder={
                type === "workspace" 
                  ? "Add a personal message to your workspace invitation..."
                  : "Add a personal message to your Contact request..."
              }
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Invitation
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
