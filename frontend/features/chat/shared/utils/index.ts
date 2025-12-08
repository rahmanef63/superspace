// Core utility functions - consolidated from multiple files
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Date and time utilities
export function formatTimestamp(timestamp: string): string {
  if (timestamp.includes(':')) {
    return timestamp; // Already formatted
  }
  
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
  
  if (diffInHours < 24) {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  } else if (diffInHours < 168) { // Less than a week
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  } else {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  }
}

// Text utilities
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// truncateText is exported from @/frontend/shared/communications - don't duplicate here

// Validation utilities
export function isValidChatId(chatId: string | null): chatId is string {
  return typeof chatId === 'string' && chatId.length > 0;
}

// File utilities
export function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
}

export function isImageFile(fileName: string): boolean {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];
  const extension = fileName.split('.').pop()?.toLowerCase();
  return imageExtensions.includes(extension || '');
}

export function isVideoFile(fileName: string): boolean {
  const videoExtensions = ['mp4', 'mov', 'avi', 'mkv', 'webm'];
  const extension = fileName.split('.').pop()?.toLowerCase();
  return videoExtensions.includes(extension || '');
}

export function isAudioFile(fileName: string): boolean {
  const audioExtensions = ['mp3', 'wav', 'ogg', 'm4a', 'aac'];
  const extension = fileName.split('.').pop()?.toLowerCase();
  return audioExtensions.includes(extension || '');
}
