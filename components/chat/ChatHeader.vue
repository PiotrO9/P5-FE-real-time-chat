<script setup lang="ts">
import type { Chat } from '~/types/Chat';
import ChatInitial from './ChatInitial.vue';

interface Props {
    selectedChat: Chat | null;
}

interface Emits {
    (e: 'toggle-actions' | 'back'): void;
}

const { selectedChat } = defineProps<Props>();

const emit = defineEmits<Emits>();

const chatStore = useChatStore();

const isGroup = computed(() => selectedChat?.isGroup);
const chatInitial = computed(() => {
    return isGroup.value
        ? (selectedChat?.name[0]?.toUpperCase() ?? '?')
        : (selectedChat?.otherUser.username[0]?.toUpperCase() ?? '?');
});
const displayName = computed(() => {
    if (!selectedChat) return 'Chat';

    return selectedChat.isGroup
        ? selectedChat.name
        : selectedChat.otherUser?.username || selectedChat.name || 'Chat';
});

function formatLastSeen(lastSeen?: string): string {
    if (!lastSeen) return 'Never';

    const date = new Date(lastSeen);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Now';

    if (diffMins < 60) return `Last seen ${diffMins} min ago`;

    if (diffMins < 1440) return `Last seen ${Math.floor(diffMins / 60)} hrs ago`;

    return `Last seen ${date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
    })}`;
}

const lastSeenText = computed(() => {
    if (isGroup.value) return null;

    if (selectedChat?.otherUser?.isOnline) return 'Active now';

    if (!selectedChat?.otherUser?.lastSeen) return null;

    return formatLastSeen(selectedChat.otherUser.lastSeen);
});

function handleToggleActions() {
    if (!selectedChat) return;

    const isCurrentlyOpen = chatStore.currentChatDetails?.id === selectedChat.id;

    if (isCurrentlyOpen) {
        chatStore.closeChatDetails();
    } else {
        chatStore.openChatDetails(selectedChat);
    }

    emit('toggle-actions');
}

function handleBack() {
    emit('back');
}

function handleBackKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleBack();
    }
}
</script>

<template>
    <div
        class="flex items-start justify-between rounded-t-[1.125rem] border-b border-gray-200 bg-white px-3 py-4 backdrop-blur supports-[backdrop-filter]:bg-white dark:border-gray-700 dark:bg-gray-900 dark:supports-[backdrop-filter]:bg-gray-900 md:px-4"
    >
        <div class="flex min-w-0 flex-1 items-center gap-3">
            <button
                type="button"
                tabindex="0"
                aria-label="Back to chats list"
                class="flex flex-shrink-0 items-center justify-center rounded-full bg-gray-100 p-1.5 transition-colors dark:hover:bg-gray-800 md:hidden"
                @click="handleBack"
                @keydown="handleBackKeyDown"
            >
                <Icon name="arrow-left" class="size-5 text-gray-600 dark:text-gray-400" />
            </button>
            <ChatInitial :chat-initial :chat-id="selectedChat?.id" />
            <div class="flex min-w-0 flex-col">
                <h2
                    class="min-w-0 truncate text-base font-semibold text-gray-900 dark:text-gray-100 md:text-lg"
                >
                    {{ displayName }}
                </h2>
                <p v-if="lastSeenText" class="text-xs text-gray-500 dark:text-gray-400">
                    {{ lastSeenText }}
                </p>
            </div>
        </div>
        <div class="flex flex-shrink-0 items-center gap-2">
            <ActionsMenu
                v-if="selectedChat"
                class="flex-shrink-0"
                @click="handleToggleActions"
                @keydown.enter="handleToggleActions"
                @keydown.space.prevent="handleToggleActions"
            />
        </div>
    </div>
</template>
