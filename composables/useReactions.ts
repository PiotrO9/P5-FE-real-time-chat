import type { Chat } from '~/types/Chat';
import { findById, compareIds } from '~/utils/idHelpers';

export function useReactions(
    chats: Ref<Chat[]>,
    selectedChatId: Ref<string | null>,
    currentUserId: Ref<number>,
    user: Ref<any>,
) {
    function handleReactionUpdated(
        messageId: string | number,
        emoji: string,
        action: 'add' | 'remove',
    ) {
        if (!selectedChatId.value) return;
        const chat = findById(chats.value, selectedChatId.value);
        if (!chat) return;

        const message = findById(chat.messages, messageId);
        if (!message) return;

        if (!message.reactions) {
            message.reactions = [];
        }

        if (action === 'add') {
            const existingReaction = message.reactions.find(
                (reaction) => reaction.emoji === emoji,
            );

            if (existingReaction) {
                if (!existingReaction.userIds.includes(currentUserId.value)) {
                    existingReaction.userIds.push(currentUserId.value);
                }
            } else {
                message.reactions.push({
                    emoji,
                    userIds: [currentUserId.value],
                    username: user.value?.username || '',
                });
            }
        } else {
            const existingReaction = message.reactions.find(
                (reaction) => reaction.emoji === emoji,
            );

            if (existingReaction) {
                existingReaction.userIds = existingReaction.userIds.filter(
                    (id) => !compareIds(id, currentUserId.value),
                );

                if (existingReaction.userIds.length === 0) {
                    message.reactions = message.reactions.filter(
                        (reaction) => reaction.emoji !== emoji,
                    );
                }
            }
        }
    }

    function addReactionToMessage(
        chatId: string,
        messageId: string | number,
        emoji: string,
        userId: string | number,
        username: string,
    ) {
        const chat = findById(chats.value, chatId);
        if (!chat) return;

        const message = findById(chat.messages, messageId);
        if (!message) return;

        if (!message.reactions) {
            message.reactions = [];
        }

        const existingReaction = message.reactions.find(
            (reaction) => reaction.emoji === emoji,
        );

        if (existingReaction) {
            if (
                !existingReaction.userIds.some((id) => compareIds(id, userId))
            ) {
                existingReaction.userIds.push(userId);
            }
        } else {
            message.reactions.push({
                emoji,
                userIds: [userId],
                username,
            });
        }
    }

    function removeReactionFromMessage(
        chatId: string,
        messageId: string | number,
        emoji: string,
        userId: string | number,
    ) {
        const chat = findById(chats.value, chatId);
        if (!chat) return;

        const message = findById(chat.messages, messageId);
        if (!message || !message.reactions) return;

        const existingReaction = message.reactions.find(
            (reaction) => reaction.emoji === emoji,
        );

        if (existingReaction) {
            existingReaction.userIds = existingReaction.userIds.filter(
                (id) => !compareIds(id, userId),
            );

            if (existingReaction.userIds.length === 0) {
                message.reactions = message.reactions.filter(
                    (r) => r.emoji !== emoji,
                );
            }
        }
    }

    return {
        handleReactionUpdated,
        addReactionToMessage,
        removeReactionFromMessage,
    };
}
