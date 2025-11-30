import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useState } from "react";

interface CanvasBuilderProps {
  workspaceId: Id<"workspaces">;
}

export function CanvasBuilder({ workspaceId }: CanvasBuilderProps) {
  // Temporarily disabled - canvas API not implemented
  const canvasPages: any[] = [];
  const createCanvasPage = () => Promise.resolve();
  const [selectedPageId, setSelectedPageId] = useState<Id<"canvasPages"> | null>(null);

  const handleCreatePage = async () => {
    // Temporarily disabled - canvas functionality not implemented
    console.log("Create canvas page:", { workspaceId });
  };

  return (
    <div className="h-full flex">
      {/* Sidebar */}
      <div className="w-64 bg-background border-r border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Canvas Pages</h3>
          <button
            onClick={handleCreatePage}
            className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            New Page
          </button>
        </div>

        <div className="space-y-2">
          {canvasPages?.map((page: any) => (
            <button
              key={page._id}
              onClick={() => setSelectedPageId(page._id)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                selectedPageId === page._id
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-muted"
              }`}
            >
              {page.name}
            </button>
          ))}
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 bg-muted relative">
        {selectedPageId ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Canvas Builder</h2>
              <p className="text-muted-foreground">
                Visual page builder coming soon...
              </p>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">No Page Selected</h2>
              <p className="text-muted-foreground">
                Select a canvas page from the sidebar or create a new one
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
