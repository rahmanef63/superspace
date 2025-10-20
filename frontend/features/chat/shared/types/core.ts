// Core Chats Types - Shared across all modules
export type TabType = 'chats' | 'calls' | 'status' | 'ai' | 'starred' | 'archived' | 'settings' | 'profile';

export interface Message {
  id: string;
  text: string;
  timestamp: string;
  variant: 'sent' | 'received' | 'system';
  status?: 'sending' | 'sent' | 'delivered' | 'read';
  type?: 'text' | 'image' | 'video' | 'audio' | 'document';
  mediaUrl?: string;
  fileName?: string;
  fileSize?: string;
  isForwarded?: boolean;
}

export interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unreadCount?: number;
  isPinned?: boolean;
  isGroup?: boolean;
  isArchived?: boolean;
  isMuted?: boolean;
  avatar?: string;
  participants?: string[];
  tags?: string[];
}

export interface Member {
  id: string;
  name: string;
  phoneNumber: string;
  avatar?: string;
  about?: string;
  username?: string;
  isOnline?: boolean;
  lastSeen?: string;
}

export interface MediaItem {
  id: string;
  url: string;
  alt?: string;
  type?: 'image' | 'video';
  timestamp?: string;
}
