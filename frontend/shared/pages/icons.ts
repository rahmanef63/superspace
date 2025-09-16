import * as Icons from "lucide-react";
import type { ElementType } from "react";

export function iconFromName(name?: string): ElementType | undefined {
  if (!name) return undefined;
  const lib = Icons as unknown as Record<string, ElementType>;
  return lib[name] || undefined;
}
