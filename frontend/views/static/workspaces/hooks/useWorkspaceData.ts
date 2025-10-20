import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";

export function useWorkspaceData(workspaceId: Id<"workspaces">) {
  const workspace = useQuery(api.workspace.workspaces.getWorkspace, { workspaceId });
  const members = useQuery(api.workspace.workspaces.getWorkspaceMembers, { workspaceId });
  const documents = useQuery(api.menu.page.documents.getWorkspaceDocuments, { workspaceId });

  return {
    workspace,
    members,
    documents,
    isLoading: workspace === undefined || members === undefined || documents === undefined,
  };
}
