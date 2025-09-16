import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

interface EncryptionSectionProps {
  isMobile: boolean;
}

export function EncryptionSection({ isMobile }: EncryptionSectionProps) {
  return (
    <div className="space-y-6">
      <div className={`text-center bg-wa-surface rounded-wa-lg border border-wa-border ${
        isMobile ? 'py-6 px-4' : 'py-8 px-6'
      }`}>
        <Lock className={`text-wa-muted mx-auto mb-4 ${isMobile ? 'h-12 w-12' : 'h-16 w-16'}`} />
        <h3 className={`font-semibold text-wa-text mb-2 ${isMobile ? 'text-base' : 'text-lg'}`}>
          End-to-end encrypted
        </h3>
        <p className={`text-wa-muted max-w-md mx-auto ${isMobile ? 'text-sm' : 'text-sm'}`}>
          Messages and calls are secured with end-to-end encryption. Tap to verify.
        </p>
      </div>
      <Button 
        variant="outline" 
        className="w-full text-primary border-primary hover:bg-primary/10"
      >
        Learn more
      </Button>
    </div>
  );
}
