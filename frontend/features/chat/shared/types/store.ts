// Store-related types
import type { TabType, Message, Chat } from './core';
import type { ChatRepository } from '../data/repositories/chat.repository';

export interface WhatsAppStore {
  activeTab: TabType;
  selectedChatId: string | null;
  sidebarCollapsed: boolean;
  chats: Chat[];
  archivedChats: Chat[];
  messages: Record<string, Message[]>;
  isLoading: boolean;
  repo?: ChatRepository;
  workspaceId?: string | null;
  globalMode?: boolean;

  // Actions
  init: (repo: ChatRepository, workspaceId: string | null) => void;
  setGlobalMode: (global: boolean) => void;
  setActiveTab: (tab: TabType) => void;
  setSelectedChat: (chatId: string | null) => void;
  toggleSidebar: () => void;
  addMessage: (chatId: string, message: Message) => void;
  sendMessage: (chatId: string, text: string) => Promise<void>;
  loadChats: () => Promise<void>;
  loadMessages: (chatId: string) => Promise<void>;
  markAsRead: (chatId: string, messageId: string) => Promise<void>;
}
