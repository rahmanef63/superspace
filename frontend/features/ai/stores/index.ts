import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';
import type { Id } from '@/convex/_generated/dataModel';
import type { KnowledgeSourceType } from '../components/WikiSelector';

// ============================================================================
// Types
// ============================================================================

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  metadata?: {
    tokenCount?: number;
    contextIds?: string[];
    model?: string;
  };
}

export interface AISession {
  _id: Id<"aiChatSessions">;
  workspaceId?: string;
  userId: string;
  title: string;
  isGlobal?: boolean;
  messages: AIMessage[];
  status: 'active' | 'archived';
  createdAt: number;
  updatedAt: number;
}

export interface AIStoreState {
  // State
  workspaceId: Id<"workspaces"> | null;
  userId: string | null;
  sessions: AISession[];
  selectedSessionId: Id<"aiChatSessions"> | null;
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  globalMode: boolean; // true = personal/global sessions, false = workspace sessions
  
  // Knowledge sources
  knowledgeEnabled: boolean; // Master toggle for knowledge
  selectedKnowledgeSources: KnowledgeSourceType[];

  // Computed
  selectedSession: AISession | null;

  // Actions
  init: (workspaceId: Id<"workspaces"> | null, userId: string | null) => void;
  setSessions: (sessions: AISession[]) => void;
  setSelectedSession: (sessionId: Id<"aiChatSessions"> | null) => void;
  setLoading: (loading: boolean) => void;
  setSending: (sending: boolean) => void;
  setError: (error: string | null) => void;
  setGlobalMode: (global: boolean) => void;
  setKnowledgeEnabled: (enabled: boolean) => void;
  setKnowledgeSources: (sources: KnowledgeSourceType[]) => void;
  
  // Session actions
  addSession: (session: AISession) => void;
  updateSession: (sessionId: Id<"aiChatSessions">, updates: Partial<AISession>) => void;
  removeSession: (sessionId: Id<"aiChatSessions">) => void;
  
  // Message actions
  addMessage: (sessionId: Id<"aiChatSessions">, message: AIMessage) => void;
  
  // Reset
  reset: () => void;
}

// ============================================================================
// Store
// ============================================================================

const initialState = {
  workspaceId: null,
  userId: null,
  sessions: [],
  selectedSessionId: null,
  isLoading: false,
  isSending: false,
  error: null,
  selectedSession: null,
  globalMode: false,
  knowledgeEnabled: true, // Knowledge enabled by default
  selectedKnowledgeSources: ['wiki'] as KnowledgeSourceType[], // Default to wiki enabled
};

export const useAIStore = create<AIStoreState>()((set, get) => ({
  ...initialState,

  // Initialize store with workspace and user
  init: (workspaceId, userId) => {
    set({ 
      workspaceId, 
      userId,
      sessions: [],
      selectedSessionId: null,
      isLoading: false,
      error: null,
    });
  },

  // Set sessions from query
  setSessions: (sessions) => {
    const state = get();
    set({ 
      sessions,
      // Update selectedSession if it exists in new sessions
      selectedSession: state.selectedSessionId 
        ? sessions.find(s => s._id === state.selectedSessionId) || null
        : null,
    });
  },

  // Select a session
  setSelectedSession: (sessionId) => {
    const sessions = get().sessions;
    const selectedSession = sessionId 
      ? sessions.find(s => s._id === sessionId) || null
      : null;
    set({ 
      selectedSessionId: sessionId,
      selectedSession,
    });
  },

  setLoading: (loading) => set({ isLoading: loading }),
  setSending: (sending) => set({ isSending: sending }),
  setError: (error) => set({ error }),
  setGlobalMode: (global) => set({ globalMode: global, selectedSessionId: null, selectedSession: null }),
  setKnowledgeEnabled: (enabled) => set({ knowledgeEnabled: enabled }),
  setKnowledgeSources: (sources) => set({ selectedKnowledgeSources: sources }),

  // Add a new session
  addSession: (session) => {
    set((state) => ({
      sessions: [session, ...state.sessions],
      selectedSessionId: session._id,
      selectedSession: session,
    }));
  },

  // Update a session
  updateSession: (sessionId, updates) => {
    set((state) => {
      const newSessions = state.sessions.map(s => 
        s._id === sessionId ? { ...s, ...updates } : s
      );
      const selectedSession = state.selectedSessionId === sessionId
        ? newSessions.find(s => s._id === sessionId) || null
        : state.selectedSession;
      return {
        sessions: newSessions,
        selectedSession,
      };
    });
  },

  // Remove a session
  removeSession: (sessionId) => {
    set((state) => {
      const newSessions = state.sessions.filter(s => s._id !== sessionId);
      const wasSelected = state.selectedSessionId === sessionId;
      return {
        sessions: newSessions,
        selectedSessionId: wasSelected ? null : state.selectedSessionId,
        selectedSession: wasSelected ? null : state.selectedSession,
      };
    });
  },

  // Add message to a session
  addMessage: (sessionId, message) => {
    set((state) => {
      const newSessions = state.sessions.map(s => {
        if (s._id === sessionId) {
          return {
            ...s,
            messages: [...s.messages, message],
            updatedAt: Date.now(),
          };
        }
        return s;
      });
      const selectedSession = state.selectedSessionId === sessionId
        ? newSessions.find(s => s._id === sessionId) || null
        : state.selectedSession;
      return {
        sessions: newSessions,
        selectedSession,
      };
    });
  },

  // Reset store
  reset: () => set(initialState),
}));

// ============================================================================
// Selectors (for performance optimization)
// ============================================================================

export const selectSessions = (state: AIStoreState) => state.sessions;
export const selectSelectedSession = (state: AIStoreState) => state.selectedSession;
export const selectIsLoading = (state: AIStoreState) => state.isLoading;
export const selectIsSending = (state: AIStoreState) => state.isSending;
