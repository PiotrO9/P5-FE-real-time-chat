<script setup lang="ts">
import type { Chat } from '~/types/Chat';
import { onMounted, onUnmounted } from 'vue';
import ChatHeader from '~/components/chat/ChatHeader.vue';
import MessageList from '~/components/message/MessageList.vue';
import PinnedMessagePreview from '~/components/message/PinnedMessagePreview.vue';

interface Props {
    selectedChat: Chat | null;
    canLoadMore?: boolean;
    isLoadingMore?: boolean;
    typingUsers?: string[];
    availableChats?: Chat[];
}

interface Emits {
    (e: 'load-more' | 'toggle-actions' | 'open-pinned-messages' | 'back'): void;
    (e: 'delete-message', messageId: string | number): void;
    (
        e: 'reaction-updated',
        messageId: string | number,
        emoji: string,
        action: 'add' | 'remove',
    ): void;
    (e: 'pin-updated', messageId: string | number, isPinned: boolean): void;
    (e: 'reply', message: Chat['messages'][0]): void;
    (e: 'scroll-to-message', messageId: string | number): void;
    (e: 'mark-latest-as-read'): void;
    (
        e: 'forward-message',
        targetChatId: string,
        messageId: string | number,
    ): void;
}

const chatStore = useChatStore();

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const messagesContainerRef = ref<HTMLDivElement | null>(null);
const highlightedMessageId = ref<string | number | null>(null);

const selectedChat = computed(() => props.selectedChat);
const canLoadMore = computed(() => props.canLoadMore ?? false);
const isLoadingMore = computed(() => props.isLoadingMore ?? false);
const hasMessages = computed(
    () => (selectedChat.value?.messages.length ?? 0) > 0,
);
const messages = computed(() => selectedChat.value?.messages ?? []);

const pinnedMessages = computed(() => {
    if (!selectedChat.value) return [];
    return chatStore.getPinnedMessages(selectedChat.value.id);
});

const lastPinnedMessage = computed(() => {
    if (pinnedMessages.value.length === 0) return null;
    const sorted = [...pinnedMessages.value].sort((a, b) => {
        const dateA = a.pinnedAt
            ? new Date(a.pinnedAt).getTime()
            : new Date(a.createdAt).getTime();
        const dateB = b.pinnedAt
            ? new Date(b.pinnedAt).getTime()
            : new Date(b.createdAt).getTime();
        return dateB - dateA;
    });
    return sorted[0];
});
const typingUsersRef = computed(() => props.typingUsers ?? []);
const { typingText } = useTypingText(typingUsersRef);

watch(
    () => selectedChat,
    () => {
        chatStore.closeChatDetails();
    },
    { deep: true },
);

function scrollToBottom() {
    const el = messagesContainerRef.value;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
}

function handleToggleActions() {
    emit('toggle-actions');
}

function handleLoadMore() {
    emit('load-more');
}

function handleDeleteMessage(messageId: string | number) {
    emit('delete-message', messageId);
}

function handleReactionUpdated(
    messageId: string | number,
    emoji: string,
    action: 'add' | 'remove',
) {
    emit('reaction-updated', messageId, emoji, action);
}

function handlePinUpdated(messageId: string | number, isPinned: boolean) {
    emit('pin-updated', messageId, isPinned);
}

function handleReply(message: Chat['messages'][0]) {
    emit('reply', message);
}

async function handleScrollToMessage(messageId: string | number) {
    if (!selectedChat.value) return;

    const messageExists = selectedChat.value.messages.some((msg) => {
        return String(msg.id) === String(messageId);
    });

    if (!messageExists && props.canLoadMore && !props.isLoadingMore) {
    }

    const messageElement = messagesContainerRef.value?.querySelector(
        `[data-message-id="${messageId}"]`,
    );
    if (messageElement) {
        messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        highlightedMessageId.value = messageId;
        setTimeout(() => {
            highlightedMessageId.value = null;
        }, 2000);
    } else {
        emit('scroll-to-message', messageId);
    }
}

function handleForwardMessage(
    targetChatId: string,
    messageId: string | number,
) {
    emit('forward-message', targetChatId, messageId);
}

function handleOpenPinnedMessages() {
    emit('open-pinned-messages');
}

function handleBack() {
    emit('back');
}

function handleScroll() {
    const el = messagesContainerRef.value;
    if (!el) return;

    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;

    if (isNearBottom) {
        emit('mark-latest-as-read');
    }
}

onMounted(() => {
    const el = messagesContainerRef.value;
    if (el) {
        el.addEventListener('scroll', handleScroll);
    }
});

onUnmounted(() => {
    const el = messagesContainerRef.value;
    if (el) {
        el.removeEventListener('scroll', handleScroll);
    }
});

defineExpose({ scrollToBottom, handleScrollToMessage });
</script>

<template>
    <section v-if="selectedChat" class="flex h-full min-h-0 flex-1 flex-col">
        <ChatHeader
            :selected-chat
            @toggle-actions="handleToggleActions"
            @back="handleBack"
        />

        <PinnedMessagePreview
            v-if="lastPinnedMessage"
            :message="lastPinnedMessage"
            class="sticky top-0 z-10"
            @click="handleOpenPinnedMessages"
        />

        <div
            ref="messagesContainerRef"
            class="min-h-0 flex-1 space-y-4 overflow-y-auto overflow-x-hidden bg-white px-3 py-4 dark:bg-gray-900 md:px-6"
        >
            <LoadMoreButton
                v-if="canLoadMore"
                :is-loading="isLoadingMore"
                @load-more="handleLoadMore"
            />

            <EmptyState v-if="!hasMessages" />

            <MessageList
                v-else
                :messages="messages"
                :highlighted-message-id="highlightedMessageId"
                :available-chats="props.availableChats"
                @delete-message="handleDeleteMessage"
                @reaction-updated="handleReactionUpdated"
                @pin-updated="handlePinUpdated"
                @reply="handleReply"
                @scroll-to-message="handleScrollToMessage"
                @forward-message="handleForwardMessage"
            />
        </div>

        <Typing v-if="typingText" :typing-text />
    </section>
</template>
