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
import type { RenameDialogState } from "../types";

interface RenameDialogProps {
  state: RenameDialogState;
  onClose: () => void;
  onNameChange: (name: string) => void;
  onConfirm: () => void;
}

export function RenameDialog({
  state,
  onClose,
  onNameChange,
  onConfirm,
}: RenameDialogProps) {
  return (
    <Dialog open={state.isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename Menu Item</DialogTitle>
          <DialogDescription>
            Enter a new name for "{state.item?.name}"
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="newName">New Name</Label>
            <Input
              id="newName"
              value={state.newName}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Enter new name..."
              onKeyDown={(e) => {
                if (e.key === "Enter" && state.newName.trim()) {
                  onConfirm();
                }
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={!state.newName.trim()}>
            Rename
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
