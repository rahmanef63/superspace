import type { Chat, Message } from '../../types';
import { AbstractChatRepository } from '../repositories/chat.repository';
import type { Id } from '@/convex/_generated/dataModel';
import { api } from '@/convex/_generated/api';
import type { ConvexReactClient } from 'convex/react';

function formatTime(ts: number | undefined): string {
  if (!ts) return '';
  try {
    const d = new Date(ts);
    return d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return '';
  }
}

export class ConvexChatRepository extends AbstractChatRepository {
  private client: ConvexReactClient;
  private workspaceId: Id<'workspaces'>;
  private currentUserId: Id<'users'> | null = null;

  constructor(params: { client: ConvexReactClient; workspaceId: Id<'workspaces'> }) {
    super();
    this.client = params.client;
    this.workspaceId = params.workspaceId;
  }

  private async ensureUser() {
    if (this.currentUserId) return this.currentUserId;
    const user = await this.client.query(api.auth.auth.loggedInUser, {} as any);
    // user may be null if not logged in; keep null then
    this.currentUserId = (user?._id as Id<'users'>) ?? null;
    return this.currentUserId;
  }

  async getChats(opts?: { global?: boolean }): Promise<Chat[]> {
    await this.ensureUser();
    let items: any[] = [];
    if (opts?.global) {
      items = await this.client.query((api as any)["features/chat/conversations"].getGlobalConversations, {});
    } else {
      items = await this.client.query((api as any)["features/chat/conversations"].getWorkspaceConversations, {
        workspaceId: this.workspaceId,
      });
    }

    const chats: Chat[] = (items || []).map((c: any) => {
      const lastMsg = c.lastMessage;
      const isGroup = (c.participants?.length ?? 0) > 2 || c.type === 'group';
      const tags: string[] = [];
      tags.push(isGroup ? 'Group' : 'Direct');
      tags.push(c.workspaceId ? 'Workspace' : 'Global');
      if (c.type === 'personal') tags.push('Contacts');

      const otherParticipant = (c.participants || []).find(
        (p: any) => String(p.user?._id) !== String(this.currentUserId)
      );
      const derivedName =
        c.name ||
        (isGroup
          ? 'Group'
          : otherParticipant?.user?.name || 'Direct Chat');
      const derivedAvatar =
        c.metadata?.avatar ||
        (isGroup ? undefined : otherParticipant?.user?.avatarUrl);

      return {
        id: String(c._id),
        name: derivedName,
        lastMessage: lastMsg?.content || '',
        timestamp: formatTime(lastMsg?._creationTime),
        unreadCount: c.unreadCount || 0,
        isPinned: c.metadata?.isPinned || false,
        isMuted: c.metadata?.isMuted || false,
        isGroup,
        avatar: derivedAvatar,
        participants: (c.participants || []).map((p: any) => String(p.user?._id)),
        tags,
        description: c.metadata?.description,
      } as Chat;
    });

    return chats;
  }

  async getArchivedChats(opts?: { global?: boolean }): Promise<Chat[]> {
    // For now, return empty array as archived chats functionality might not be implemented yet
    return [];
  }

  async getMessages(chatId: string): Promise<Message[]> {
    try {
      const messages = await this.client.query((api as any)["features/chat/messages"].getConversationMessages, {
        conversationId: chatId as unknown as Id<'conversations'>,
      });

      const me = await this.ensureUser();

      const result: Message[] = (messages || []).map((m: any) => ({
        id: String(m._id),
        text: m.content || '',
        timestamp: formatTime(m._creationTime),
        variant: String(m.senderId) === String(me) ? 'sent' : 'received',
        type: (m.type as any) || 'text',
        mediaUrl: m.attachmentUrl || undefined,
        fileName: m.metadata?.fileName,
        fileSize: m.metadata?.fileSize ? String(m.metadata.fileSize) : undefined,
      }));

      return result;
    } catch (err) {
      console.error('[ConvexChatRepository.getMessages] failed', { chatId, err });
      return [];
    }
  }

  async sendMessage(chatId: string, text: string): Promise<Message> {
    const me = await this.ensureUser();
    const id = await this.client.mutation((api as any)["features/chat/messages"].sendMessage, {
      conversationId: chatId as unknown as Id<'conversations'>,
      content: text,
      type: 'text',
    });

    // Build optimistic message mirroring our output format
    const now = Date.now();
    return {
      id: String(id),
      text,
      timestamp: formatTime(now),
      variant: 'sent',
      status: 'sending',
      type: 'text',
    };
  }

  async markAsRead(chatId: string, messageId: string): Promise<void> {
    // Best-effort; ignore failures
    try {
      await this.client.mutation((api as any)["features/chat/messages"].markReadTo, {
        conversationId: chatId as unknown as Id<'conversations'>,
        messageId: messageId as unknown as Id<'messages'>,
      });
    } catch {}
  }
}



