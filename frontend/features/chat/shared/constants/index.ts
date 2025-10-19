import type { TabType } from '../types';
import { MessageSquare, Phone, CircleDot, Bot, Star, Archive, Settings } from 'lucide-react';

export const DEFAULT_TAB: TabType = 'chats';

export const MESSAGE_STATUS_TIMEOUT = {
  SENT: 1000,
  DELIVERED: 2000,
};

export const PLACEHOLDERS = {
  SEARCH_CHATS: 'Search chats',
  SEARCH_ARCHIVED: 'Search archived chats',
  COMPOSE_MESSAGE: 'Type a message',
};

export const RAIL_ITEMS = [
  { id: 'chats' as TabType, label: 'Chats', icon: MessageSquare },
  { id: 'calls' as TabType, label: 'Calls', icon: Phone },
  { id: 'status' as TabType, label: 'Status', icon: CircleDot },
  { id: 'ai' as TabType, label: 'AI Assistant', icon: Bot },
  { id: 'starred' as TabType, label: 'Starred', icon: Star },
  { id: 'archived' as TabType, label: 'Archived', icon: Archive },
  { id: 'settings' as TabType, label: 'Settings', icon: Settings },
];
