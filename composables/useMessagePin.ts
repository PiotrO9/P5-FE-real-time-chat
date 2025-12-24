import type { Message } from '~/types/Chat';
import { pinMessage, unpinMessage } from '~/services/chatService';
import { useMessageHelpers } from './useMessageHelpers';
import { useToast } from './useToast';

export function useMessagePin(message: Ref<Message>, chatStore: any) {
    const isPinning = ref(false);
    const isPinned = computed(() => message.value.isPinned ?? false);
    const { error: toastError } = useToast();

    async function togglePin() {
        if (isPinning.value) return message.value.isPinned ?? false;

        const chatId = message.value.chatId;
        const shouldUnpin = message.value.isPinned === true;

        try {
            isPinning.value = true;

            if (shouldUnpin) {
                await unpinMessage(chatId, message.value.id);
                chatStore.removePinnedMessage(chatId, message.value.id);
                message.value.isPinned = false;
                message.value.pinnedBy = undefined;
                message.value.pinnedAt = undefined;
                return false;
            } else {
                if (message.value.isPinned === true) {
                    return true;
                }

                const res = await pinMessage(chatId, message.value.id);
                const { mapMessageFromBackend } = useMessageHelpers();

                if (res?.data) {
                    const pinnedData = res.data;
                    if (pinnedData.message) {
                        const mappedMessage = mapMessageFromBackend(
                            pinnedData.message,
                        );
                        message.value.isPinned = mappedMessage.isPinned ?? true;
                        message.value.pinnedBy = mappedMessage.pinnedBy;
                        message.value.pinnedAt = mappedMessage.pinnedAt;
                        const pinnedMessageForStore = {
                            ...message.value,
                            isPinned: mappedMessage.isPinned ?? true,
                            pinnedBy: mappedMessage.pinnedBy,
                            pinnedAt: mappedMessage.pinnedAt,
                        };
                        chatStore.addPinnedMessage(
                            chatId,
                            pinnedMessageForStore,
                        );
                    } else {
                        message.value.isPinned = true;
                        chatStore.addPinnedMessage(chatId, message.value);
                    }
                } else {
                    message.value.isPinned = true;
                    chatStore.addPinnedMessage(chatId, message.value);
                }
                return true;
            }
        } catch (error: any) {
            const errorMessage =
                error?.response?._data?.message || error?.message;
            toastError(errorMessage || 'Failed to update pin status');
            return message.value.isPinned ?? false;
        } finally {
            isPinning.value = false;
        }
    }

    return {
        isPinning,
        isPinned,
        togglePin,
    };
}
