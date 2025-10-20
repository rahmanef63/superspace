import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  MessageSquare,
  FileText,
  Activity,
  Calendar,
} from "lucide-react";

interface OverviewProps {
  workspaceId: Id<"workspaces">;
}

export function Overview({ workspaceId }: OverviewProps) {
  const workspace = useQuery(api.workspace.workspaces.getWorkspace, { workspaceId });
  const members = useQuery(api.workspace.workspaces.getWorkspaceMembers, { workspaceId });
  const documents = useQuery(api.menu.page.documents.getWorkspaceDocuments, { workspaceId }) || [];

  const stats = [
    {
      title: "Total Members",
      value: members?.length || 0,
      icon: Users,
      accent: "bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400",
    },
    {
      title: "Messages Today",
      value: 0, // Removed the problematic query
      icon: MessageSquare,
      accent: "bg-green-100 text-green-600 dark:bg-green-950/40 dark:text-green-400",
    },
    {
      title: "Documents",
      value: documents?.length || 0,
      icon: FileText,
      accent: "bg-purple-100 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400",
    },
    {
      title: "Active Now",
      value: 5, // Mock data
      icon: Activity,
      accent: "bg-orange-100 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400",
    },
  ];

  return (
    <div className="container flex-col mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Welcome back!</h1>
        <p className="text-muted-foreground">Here's what's happening in {workspace?.name}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="h-full">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.accent}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Documents */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Recent Documents</CardTitle>
              <FileText className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {documents.slice(0, 5).map((doc: any) => (
              <div key={doc._id} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 text-primary rounded flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{doc.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(doc._creationTime).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <Button variant="secondary" className="flex flex-col items-center gap-2 py-6">
                <MessageSquare className="w-6 h-6" />
                <span className="text-sm font-medium">Start Chat</span>
              </Button>
              <Button variant="secondary" className="flex flex-col items-center gap-2 py-6">
                <FileText className="w-6 h-6" />
                <span className="text-sm font-medium">New Document</span>
              </Button>
              <Button variant="secondary" className="flex flex-col items-center gap-2 py-6">
                <Users className="w-6 h-6" />
                <span className="text-sm font-medium">Invite Members</span>
              </Button>
              <Button variant="secondary" className="flex flex-col items-center gap-2 py-6">
                <Calendar className="w-6 h-6" />
                <span className="text-sm font-medium">Schedule Meeting</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
