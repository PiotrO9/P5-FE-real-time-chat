import { toNumber, toString } from '~/utils/typeHelpers';

export function useTypingUsers(currentUserId: Ref<number>) {
    const typingUsers = reactive<Record<string, Map<string | number, string>>>(
        {},
    );
    let typingTimeout: NodeJS.Timeout | null = null;
    let isTyping = false;

    const typingUsersByChat = computed(() => {
        const result: Record<string, string[]> = {};
        return result;
    });

    function getTypingUsers(chatId: string | null): string[] {
        if (!chatId) return [];
        const chatIdStr = String(chatId);
        const users = typingUsers[chatIdStr];
        return users ? Array.from(users.values()) : [];
    }

    function handleTypingStart(data: {
        chatId: string;
        userId: string;
        username: string;
    }) {
        const chatId = toString(data.chatId);
        const userId = toNumber(data.userId);

        if (String(userId) === String(currentUserId.value)) return;

        if (!typingUsers[chatId]) {
            typingUsers[chatId] = new Map();
        }
        typingUsers[chatId].set(userId, data.username);
    }

    function handleTypingStop(data: { chatId: string; userId: string }) {
        const chatId = toString(data.chatId);
        const userId = toNumber(data.userId);

        if (String(userId) === String(currentUserId.value)) return;

        if (typingUsers[chatId]) {
            typingUsers[chatId].delete(userId);
        }
    }

    function handleTypingInput(
        chatId: string,
        emit: (event: string, data: any) => void,
    ) {
        const chatIdStr = String(chatId);

        if (!isTyping) {
            emit('typing:start', { chatId: chatIdStr });
            isTyping = true;
        }

        if (typingTimeout) {
            clearTimeout(typingTimeout);
        }

        typingTimeout = setTimeout(() => {
            if (isTyping) {
                emit('typing:stop', { chatId: chatIdStr });
                isTyping = false;
            }
            typingTimeout = null;
        }, 3000);
    }

    function handleMessageSent(
        chatId: string,
        emit: (event: string, data: any) => void,
    ) {
        const chatIdStr = String(chatId);

        if (isTyping) {
            emit('typing:stop', { chatId: chatIdStr });
            isTyping = false;
        }

        if (typingTimeout) {
            clearTimeout(typingTimeout);
            typingTimeout = null;
        }
    }

    function updateTypingUsersByChat(chats: any[]) {
        const result: Record<string, string[]> = {};
        chats.forEach((chat) => {
            const chatId = String(chat.id);
            const users = typingUsers[chatId];
            if (users && users.size > 0) {
                result[chatId] = Array.from(users.values());
            }
        });
        return result;
    }

    function cleanup() {
        if (typingTimeout) {
            clearTimeout(typingTimeout);
            typingTimeout = null;
        }
    }

    return {
        typingUsers,
        typingUsersByChat,
        getTypingUsers,
        handleTypingStart,
        handleTypingStop,
        handleTypingInput,
        handleMessageSent,
        updateTypingUsersByChat,
        cleanup,
    };
}
