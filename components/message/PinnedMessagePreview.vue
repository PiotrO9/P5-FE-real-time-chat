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
        class="w-full border-l-4 border-indigo-400 bg-indigo-50 px-4 py-3 text-left transition-colors hover:bg-indigo-100 focus-visible:outline-primary dark:border-indigo-500 dark:bg-indigo-900/40 dark:hover:bg-indigo-900/60"
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
                        class="text-xs font-semibold text-indigo-900 dark:text-indigo-200"
                    >
                        {{ message?.senderUsername }}
                    </p>
                    <span class="text-xs text-indigo-700 dark:text-indigo-300"
                        >•</span
                    >
                    <p class="text-xs text-indigo-700 dark:text-indigo-300">
                        {{ formatMessageTime(message?.createdAt || '') }}
                    </p>
                </div>
                <p
                    class="line-clamp-2 text-sm text-indigo-900 dark:text-indigo-100"
                >
                    {{ truncateMessage(message?.content || '') }}
                </p>
            </div>
        </div>
    </button>
</template>
