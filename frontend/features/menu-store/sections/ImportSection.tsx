import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileInput } from "lucide-react";

interface ImportSectionProps {
  importMenuId: string;
  importing: boolean;
  onIdChange: (id: string) => void;
  onImport: () => void;
}

export function ImportSection({
  importMenuId,
  importing,
  onIdChange,
  onImport,
}: ImportSectionProps) {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="mb-2 text-xl font-semibold">Import Menu</h2>
        <p className="text-muted-foreground">
          Import a menu from another workspace using a shareable menu ID.
        </p>
      </div>

      <div className="max-w-md space-y-4">
        <div className="space-y-2">
          <Label htmlFor="menuId">Menu ID</Label>
          <Input
            id="menuId"
            placeholder="Enter shareable menu ID..."
            value={importMenuId}
            onChange={(e) => onIdChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && importMenuId.trim() && !importing) {
                onImport();
              }
            }}
          />
        </div>
        <Button
          onClick={onImport}
          disabled={!importMenuId.trim() || importing}
          className="w-full"
        >
          {importing ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Importing...
            </>
          ) : (
            <>
              <FileInput className="mr-2 h-4 w-4" />
              Import Menu
            </>
          )}
        </Button>
      </div>

      <div className="mt-8 rounded-lg bg-muted p-4">
        <h3 className="mb-2 font-medium">How to get a Menu ID:</h3>
        <ol className="list-inside list-decimal space-y-1 text-sm text-muted-foreground">
          <li>Go to the workspace that has the menu you want</li>
          <li>Find the menu item in the Installed tab</li>
          <li>Click the menu button (...) and select "Share"</li>
          <li>Copy the shareable ID and paste it here</li>
        </ol>
      </div>
    </div>
  );
}
