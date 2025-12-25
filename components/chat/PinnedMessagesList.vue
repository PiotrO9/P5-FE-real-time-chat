<script setup lang="ts">
import type { Message } from '~/types/Chat';
import { Pin } from 'lucide-vue-next';

interface Props {
    pinnedMessages: Message[];
    isLoading: boolean;
}

interface Emits {
    (e: 'message-click', messageId: string | number): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

const { formatMessageTime, truncateMessage } = useMessageHelpers();

function handlePinnedMessageClick(messageId: string | number) {
    emit('message-click', messageId);
}
</script>

<template>
    <div
        class="border-t border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900"
    >
        <h3 class="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
            Pinned messages ({{ pinnedMessages.length }})
        </h3>
        <div v-if="isLoading" class="text-sm text-gray-600 dark:text-gray-400">
            Loading...
        </div>
        <div
            v-else-if="pinnedMessages.length === 0"
            class="text-sm text-gray-500 dark:text-gray-100"
        >
            No pinned messages
        </div>
        <div v-else class="max-h-96 space-y-2 overflow-y-auto">
            <button
                v-for="pinnedMessage in pinnedMessages"
                :key="pinnedMessage.id"
                type="button"
                tabindex="0"
                :aria-label="`Go to message from ${pinnedMessage.senderUsername}`"
                class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-left text-xs transition-colors hover:bg-gray-100 focus-visible:border-primary dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-800"
                @click="handlePinnedMessageClick(pinnedMessage.id)"
                @keydown.enter="handlePinnedMessageClick(pinnedMessage.id)"
            >
                <div class="flex items-start justify-between gap-2">
                    <div class="min-w-0 flex-1">
                        <div class="mb-1 flex flex-wrap items-center gap-2">
                            <p
                                class="font-medium text-gray-900 dark:text-gray-100"
                            >
                                {{ pinnedMessage.senderUsername }}
                            </p>
                            <span
                                v-if="pinnedMessage.pinnedBy"
                                class="text-[10px] text-gray-400 dark:text-gray-500"
                            >
                                pinned by {{ pinnedMessage.pinnedBy.username }}
                            </span>
                        </div>
                        <p
                            class="mb-1 line-clamp-2 text-gray-600 dark:text-gray-400"
                        >
                            {{ truncateMessage(pinnedMessage.content) }}
                        </p>
                        <div
                            class="flex items-center gap-2 text-gray-400 dark:text-gray-500"
                        >
                            <p class="text-[10px]">
                                {{ formatMessageTime(pinnedMessage.createdAt) }}
                            </p>
                            <span
                                v-if="pinnedMessage.pinnedAt"
                                class="text-[10px]"
                            >
                                • pinned
                                {{ formatMessageTime(pinnedMessage.pinnedAt) }}
                            </span>
                        </div>
                    </div>
                    <Pin
                        class="size-4 flex-shrink-0"
                        style="color: #ef4444"
                    />
                </div>
            </button>
        </div>
    </div>
</template>
