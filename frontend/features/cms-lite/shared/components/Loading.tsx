import { Loader2 } from "lucide-react";

export function Loading({ size = "md" }: { size?: "sm" | "md" | "lg" } = {}) {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className={`${sizes[size]} animate-spin text-primary`} />
    </div>
  );
}

export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className={`${sizes[size]} animate-spin text-primary`} />
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="border rounded-lg p-12 text-center">
      <p className="text-foreground/60 mb-2">{title}</p>
      {description && <p className="text-sm text-foreground/50 mb-4">{description}</p>}
      {action}
    </div>
  );
}
