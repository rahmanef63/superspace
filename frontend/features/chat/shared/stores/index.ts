import { create } from 'zustand';
import { toast } from 'sonner';
import type { WhatsAppStore, Message, TabType, Chat } from '../types';
import { DEFAULT_TAB, MESSAGE_STATUS_TIMEOUT } from '../constants';
import type { ChatRepository } from '../data/repositories/chat.repository';

export const useWhatsAppStore = create<WhatsAppStore>()((set, get) => ({
  // Initial state
  activeTab: DEFAULT_TAB,
  selectedChatId: null,
  sidebarCollapsed: false,
  chats: [],
  archivedChats: [],
  messages: {},
  isLoading: false,
  repo: undefined,
  workspaceId: null,
  globalMode: false,

  // Actions
  init: (repo: ChatRepository, workspaceId: string | null) => set({ repo, workspaceId }),
  setGlobalMode: (global: boolean) => set({ globalMode: global }),
  setActiveTab: (tab: TabType) => set({ activeTab: tab }),

  setSelectedChat: (chatId: string | null) => set({ selectedChatId: chatId }),

  toggleSidebar: () => set((state) => ({
    sidebarCollapsed: !state.sidebarCollapsed
  })),

  addChat: (chat: Chat) => set((state) => {
    // Prevent duplicates
    if (state.chats.some((c) => c.id === chat.id)) {
      return state;
    }
    return { chats: [chat, ...state.chats] };
  }),

  addMessage: (chatId: string, message: Message) => set((state) => ({
    messages: {
      ...state.messages,
      [chatId]: [...(state.messages[chatId] || []), message],
    },
  })),

  loadChats: async () => {
    const chatRepository = get().repo;
    if (!chatRepository) return;
    set({ isLoading: true });
    try {
      const [chats, archivedChats] = await Promise.all([
        chatRepository.getChats({ global: Boolean(get().globalMode) }),
        chatRepository.getArchivedChats({ global: Boolean(get().globalMode) }),
      ]);
      set({
        chats: chats,
        archivedChats: archivedChats,
        isLoading: false
      });
    } catch (error) {
      console.error('Failed to load chats:', error);
      toast.error('Gagal memuat daftar chat');
      set({ isLoading: false });
    }
  },

  loadMessages: async (chatId: string) => {
    try {
      const repo = get().repo;
      const messages = repo ? await repo.getMessages(chatId) : [];
      set((state) => ({
        messages: { ...state.messages, [chatId]: messages },
      }));
    } catch (error) {
      console.error('Failed to load messages:', error);
      toast.error('Gagal memuat pesan');
    }
  },

  sendMessage: async (chatId: string, text: string) => {
    try {
      const repo = get().repo;
      if (!repo) return;
      const message = await repo.sendMessage(chatId, text);
      get().addMessage(chatId, message);

      // Simulate message status updates
      setTimeout(() => {
        set((state) => ({
          messages: {
            ...state.messages,
            [chatId]: state.messages[chatId]?.map(m =>
              m.id === message.id ? { ...m, status: 'sent' } : m
            ) || [],
          },
        }));
      }, MESSAGE_STATUS_TIMEOUT.SENT);

      setTimeout(() => {
        set((state) => ({
          messages: {
            ...state.messages,
            [chatId]: state.messages[chatId]?.map(m =>
              m.id === message.id ? { ...m, status: 'delivered' } : m
            ) || [],
          },
        }));
      }, MESSAGE_STATUS_TIMEOUT.DELIVERED);

      // Optional: simulate read after a bit longer to reflect UI like Chats
      setTimeout(() => {
        set((state) => ({
          messages: {
            ...state.messages,
            [chatId]: state.messages[chatId]?.map(m =>
              m.id === message.id ? { ...m, status: 'read' } : m
            ) || [],
          },
        }));
      }, MESSAGE_STATUS_TIMEOUT.DELIVERED + 3000);
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Gagal mengirim pesan');
    }
  },

  markAsRead: async (chatId: string, messageId: string) => {
    try {
      const repo = get().repo;
      if (!repo) return;
      await repo.markAsRead(chatId, messageId);
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
      // Avoid noisy toast for background action
    }
  },
}));

// Initialize store with data - now uses consolidated repository
export const initializeWhatsApp = async () => {
  try {
    await useWhatsAppStore.getState().loadChats();
  } catch (error) {
    console.error('Failed to initialize Chats data:', error);
  }
};
