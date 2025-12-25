<script setup lang="ts">
import type { Message } from '~/types/Chat';
import { Pin } from 'lucide-vue-next';

interface Props {
    message: Message | null;
}

interface Emits {
    (e: 'click'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const message = computed(() => props.message);
const hasMessage = computed(() => message.value !== null);
const { formatMessageTime, truncateMessage } = useMessageHelpers();

function handleClick() {
    if (!hasMessage.value) return;

    emit('click');
}

function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleClick();
    }
}
</script>

<template>
    <button
        v-if="hasMessage"
        type="button"
        tabindex="0"
        aria-label="Open pinned messages"
        class="w-full border-l-4 border-yellow-400 bg-yellow-50 px-4 py-3 text-left transition-colors hover:bg-yellow-100 focus-visible:outline-primary dark:border-yellow-500 dark:bg-yellow-900/40 dark:hover:bg-yellow-900/60"
        @click="handleClick"
        @keydown="handleKeyDown"
    >
        <div class="flex items-center gap-3">
            <Pin
                class="size-5 flex-shrink-0"
                style="color: rgb(239 68 68)"
            />
            <div class="min-w-0 flex-1">
                <div class="mb-1 flex items-center gap-2">
                    <p
                        class="text-xs font-semibold text-yellow-900 dark:text-yellow-200"
                    >
                        {{ message?.senderUsername }}
                    </p>
                    <span class="text-xs text-yellow-700 dark:text-yellow-300"
                        >•</span
                    >
                    <p class="text-xs text-yellow-700 dark:text-yellow-300">
                        {{ formatMessageTime(message?.createdAt || '') }}
                    </p>
                </div>
                <p
                    class="line-clamp-2 text-sm text-yellow-900 dark:text-yellow-100"
                >
                    {{ truncateMessage(message?.content || '') }}
                </p>
            </div>
        </div>
    </button>
</template>
