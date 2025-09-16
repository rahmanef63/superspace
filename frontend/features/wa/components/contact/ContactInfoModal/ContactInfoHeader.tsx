import { Button } from "@/components/ui/button";
import { DialogHeader } from "@/components/ui/dialog";
import { X } from "lucide-react";

interface ContactInfoHeaderProps {
  onClose: () => void;
}

export function ContactInfoHeader({ onClose }: ContactInfoHeaderProps) {
  return (
    <DialogHeader className="p-3 md:p-4 border-b border-wa-border flex flex-row items-center justify-between bg-wa-surface">
      <h2 className="text-base md:text-lg font-semibold text-wa-text">Contact Info</h2>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onClose}
        className="text-wa-muted hover:text-wa-text hover:bg-wa-hover h-8 w-8 md:h-10 md:w-10"
      >
        <X className="h-4 w-4 md:h-5 md:w-5" />
      </Button>
    </DialogHeader>
  );
}
