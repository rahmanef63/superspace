import { Suspense } from "react";
import { LoadingSpinner } from "../loading";
import { Id } from "@convex/_generated/dataModel";

// Simple fallback components for missing features
const ChatFallback = () => <div className="p-6 text-center text-gray-500">Chat feature coming soon</div>;
const DocumentsFallback = () => <div className="p-6 text-center text-gray-500">Document editor coming soon</div>;
const CanvasFallback = () => <div className="p-6 text-center text-gray-500">Canvas builder coming soon</div>;

// Simple dashboard stub to avoid dynamic import resolution issues in the monorepo
function Dashboard(props: { workspaceId?: Id<"workspaces">;[key: string]: any }) {
  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold">Dashboard</h3>
      <p className="text-sm text-muted-foreground">Workspace: {String(props.workspaceId ?? 'none')}</p>
    </div>
  );
}

interface LazyComponentProps {
  component: 'dashboard' | 'menu-store' | 'chat' | 'documents' | 'canvas';
  workspaceId?: Id<"workspaces">;
  conversationId?: Id<"conversations">;
  [key: string]: any;
}

export function LazyLoader({ component, workspaceId, conversationId, ...props }: LazyComponentProps) {
  const getComponent = () => {
    switch (component) {
      case 'dashboard':
        if (!workspaceId) return <div>Workspace ID required for dashboard</div>;
        return <Dashboard workspaceId={workspaceId} {...props} />;

      case 'menu-store':
        // For now, return a placeholder since MenuStore has import issues
        return <div className="p-6 text-center text-gray-500">Menu Store coming soon</div>;

      case 'chat':
        return <ChatFallback />;

      case 'documents':
        return <DocumentsFallback />;

      case 'canvas':
        return <CanvasFallback />;

      default:
        return <div>Component not found</div>;
    }
  };

  return (
    <Suspense fallback={<LoadingSpinner />}>
      {getComponent()}
    </Suspense>
  );
}
