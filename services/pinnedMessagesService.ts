import type { Message } from '~/types/Chat';
import { fetchPinnedMessages } from './chatService';
import { useMessageHelpers } from '~/composables/useMessageHelpers';
import { useChatStore } from '~/stores/chatStore';

export class PinnedMessagesService {
    async fetchPinnedMessagesForChat(chatId: string): Promise<Message[]> {
        try {
            const { mapMessageFromBackend } = useMessageHelpers();
            const chatStore = useChatStore();
            const res = await fetchPinnedMessages(chatId);
            const raw = res?.data;
            const pinnedItems: any[] = Array.isArray(raw?.pinnedMessages)
                ? raw.pinnedMessages
                : [];

            const mappedMessages = pinnedItems.map((pinnedItem) => {
                const message = mapMessageFromBackend(pinnedItem.message);

                return {
                    ...message,
                    isPinned: true,
                    pinnedBy: pinnedItem.pinnedBy
                        ? {
                              id: pinnedItem.pinnedBy.id,
                              username: pinnedItem.pinnedBy.username,
                          }
                        : undefined,
                    pinnedAt: pinnedItem.pinnedAt
                        ? typeof pinnedItem.pinnedAt === 'string'
                            ? pinnedItem.pinnedAt
                            : pinnedItem.pinnedAt.toISOString()
                        : undefined,
                };
            });

            chatStore.setPinnedMessages(chatId, mappedMessages);
            return mappedMessages;
        } catch (err: any) {
            console.error('Error fetching pinned messages:', err);
            return [];
        }
    }
}

export const pinnedMessagesService = new PinnedMessagesService();
