import type { Chat, Message } from '~/types/Chat';

export const useChatStore = defineStore('chat', () => {
    const currentChatDetails = ref<Chat | null>(null);
    const pinnedMessages = ref<Record<string, Message[]>>({});

    function openChatDetails(chat: Chat) {
        currentChatDetails.value = chat;
    }

    function closeChatDetails() {
        currentChatDetails.value = null;
    }

    function setPinnedMessages(chatId: string, messages: Message[]) {
        pinnedMessages.value[chatId] = messages;
    }

    function addPinnedMessage(chatId: string, message: Message) {
        if (!pinnedMessages.value[chatId]) {
            pinnedMessages.value[chatId] = [];
        }
        const exists = pinnedMessages.value[chatId].some(
            (m) => m.id === message.id,
        );
        if (!exists) {
            pinnedMessages.value[chatId].push(message);
        }
    }

    function removePinnedMessage(chatId: string, messageId: string | number) {
        if (!pinnedMessages.value[chatId]) return;
        pinnedMessages.value[chatId] = pinnedMessages.value[chatId].filter(
            (m) => String(m.id) !== String(messageId),
        );
    }

    function getPinnedMessages(chatId: string): Message[] {
        return pinnedMessages.value[chatId] || [];
    }

    return {
        currentChatDetails,
        pinnedMessages,
        openChatDetails,
        closeChatDetails,
        setPinnedMessages,
        addPinnedMessage,
        removePinnedMessage,
        getPinnedMessages,
    };
});
