"use client";

import type { ReactNode } from "react";
import { toast as sonnerToast, type ExternalToast } from "sonner";

type ToastVariant = "default" | "destructive" | "success" | "info" | "warning";

type ToastOptions = {
  title?: string;
  description?: ReactNode;
  variant?: ToastVariant;
} & Omit<ExternalToast, "description">;

export type UseToastReturn = {
  toast: (options: ToastOptions) => string | number;
  dismiss: typeof sonnerToast.dismiss;
};

function mapVariantToToast(variant: ToastVariant) {
  switch (variant) {
    case "destructive":
      return sonnerToast.error;
    case "success":
      return sonnerToast.success;
    case "info":
      return sonnerToast.info;
    case "warning":
      return sonnerToast.warning;
    default:
      return sonnerToast;
  }
}

export function useToast(): UseToastReturn {
  const toast = ({ title, description, variant = "default", ...rest }: ToastOptions) => {
    const runner = mapVariantToToast(variant);

    // When only a description is provided, treat it as the message.
    const message = title ?? (typeof description === "string" ? description : "");
    const toastDescription = title ? description : undefined;

    return runner(message, {
      ...rest,
      description: toastDescription,
    });
  };

  return {
    toast,
    dismiss: sonnerToast.dismiss,
  };
}
