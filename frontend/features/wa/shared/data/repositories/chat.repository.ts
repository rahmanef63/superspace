import type { Chat, Message } from '../../types';

export interface ChatRepository {
  getChats(opts?: { global?: boolean }): Promise<Chat[]>;
  getArchivedChats(opts?: { global?: boolean }): Promise<Chat[]>;
  getMessages(chatId: string): Promise<Message[]>;
  sendMessage(chatId: string, text: string): Promise<Message>;
  markAsRead(chatId: string, messageId: string): Promise<void>;
}

export abstract class AbstractChatRepository implements ChatRepository {
  abstract getChats(opts?: { global?: boolean }): Promise<Chat[]>;
  abstract getArchivedChats(opts?: { global?: boolean }): Promise<Chat[]>;
  abstract getMessages(chatId: string): Promise<Message[]>;
  abstract sendMessage(chatId: string, text: string): Promise<Message>;
  abstract markAsRead(chatId: string, messageId: string): Promise<void>;
}
