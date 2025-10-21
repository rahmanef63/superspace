import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import type { ShareDialogState } from "../types";

interface ShareDialogProps {
  state: ShareDialogState;
  onClose: () => void;
}

export function ShareDialog({ state, onClose }: ShareDialogProps) {
  const handleCopy = () => {
    if (state.shareableId) {
      navigator.clipboard.writeText(state.shareableId);
      toast.success("Shareable ID copied to clipboard");
    }
  };

  return (
    <Dialog open={state.isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Menu Item</DialogTitle>
          <DialogDescription>
            Share this menu item with other workspaces using the ID below.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Shareable Menu ID</Label>
            <div className="flex gap-2">
              <Input
                value={state.shareableId || ""}
                readOnly
                className="font-mono text-sm"
              />
              <Button onClick={handleCopy} size="sm">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Anyone with this ID can import this menu item into their workspace.
          </p>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
