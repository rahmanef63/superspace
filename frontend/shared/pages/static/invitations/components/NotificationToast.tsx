"use client";

import { useEffect } from "react";
import { CheckCircle, XCircle, AlertCircle, Info } from "lucide-react";
import type { NotificationToastProps } from "../types";

export function NotificationToast({ 
  message, 
  type, 
  onClose, 
  duration = 3000 
}: NotificationToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const config = {
    success: {
      bg: "bg-green-500",
      icon: CheckCircle,
      duration: 3000
    },
    error: {
      bg: "bg-red-500",
      icon: XCircle,
      duration: 5000
    },
    warning: {
      bg: "bg-yellow-500",
      icon: AlertCircle,
      duration: 4000
    },
    info: {
      bg: "bg-blue-500",
      icon: Info,
      duration: 3000
    }
  };

  const { bg, icon: Icon } = config[type];

  return (
    <div className={`fixed top-4 right-4 ${bg} text-primary px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-3 animate-in slide-in-from-right max-w-md`}>
      <Icon className="w-5 h-5 flex-shrink-0" />
      <p className="text-sm font-medium">{message}</p>
      <button
        onClick={onClose}
        className="ml-2 text-primary hover:text-gray-200 transition-colors"
      >
        <XCircle className="w-4 h-4" />
      </button>
    </div>
  );
}

// Hook for managing notifications
export function useNotification() {
  const showNotification = (message: string, type: "success" | "error" | "warning" | "info") => {
    const colors = {
      success: "bg-green-500",
      error: "bg-red-500",
      warning: "bg-yellow-500",
      info: "bg-blue-500"
    };

    const icons = {
      success: "✓",
      error: "✕",
      warning: "⚠",
      info: "ℹ"
    };

    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 ${colors[type]} text-primary px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 animate-in slide-in-from-right`;
    notification.innerHTML = `<span class="font-bold">${icons[type]}</span> ${message}`;
    
    document.body.appendChild(notification);
    
    const duration = type === "error" ? 5000 : 3000;
    setTimeout(() => {
      notification.style.animation = "slide-out-to-right 0.3s ease-in-out";
      setTimeout(() => notification.remove(), 300);
    }, duration);
  };

  return { showNotification };
}
