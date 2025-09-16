// API-related types
import type { Chat, Message } from './core';

export interface WhatsAppAPI {
  getChats(): Promise<Chat[]>;
  getArchivedChats(): Promise<Chat[]>;
  getMessages(chatId: string): Promise<Message[]>;
  sendMessage(chatId: string, text: string): Promise<Message>;
  markAsRead(chatId: string, messageId: string): Promise<void>;
}
