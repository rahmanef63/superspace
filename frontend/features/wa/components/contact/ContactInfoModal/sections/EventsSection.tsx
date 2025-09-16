import { Calendar } from "lucide-react";

interface EventsSectionProps {
  isMobile: boolean;
}

export function EventsSection({ isMobile }: EventsSectionProps) {
  return (
    <div className={`text-center ${isMobile ? 'py-8' : 'py-12'}`}>
      <Calendar className={`text-wa-muted mx-auto mb-4 ${isMobile ? 'h-12 w-12' : 'h-16 w-16'}`} />
      <p className={`text-wa-muted ${isMobile ? 'text-base' : 'text-lg'}`}>No events to display</p>
    </div>
  );
}
