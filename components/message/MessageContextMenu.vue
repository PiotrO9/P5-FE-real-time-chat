<script setup lang="ts">
interface Props {
    isOwnMessage: boolean;
    isPinned: boolean;
    isDeleted?: boolean;
    position: 'left' | 'right';
}

interface Emits {
    (e: 'delete' | 'pin' | 'forward' | 'mouseenter' | 'mouseleave'): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

function handleKeyDown(event: KeyboardEvent, action: 'delete' | 'pin' | 'forward') {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();

        if (action === 'delete') {
            emit('delete');
        } else if (action === 'pin') {
            emit('pin');
        } else if (action === 'forward') {
            emit('forward');
        }
    }
}
</script>

<template>
    <div
        class="absolute bottom-full z-50 mb-1 min-w-40 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
        :class="position === 'left' ? 'left-0' : 'right-0'"
        @mouseenter="emit('mouseenter')"
        @mouseleave="emit('mouseleave')"
    >
        <button
            v-if="isOwnMessage"
            type="button"
            tabindex="0"
            aria-label="Delete message"
            :disabled="isDeleted"
            class="w-full px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent dark:text-gray-300 dark:hover:bg-gray-700 dark:disabled:hover:bg-transparent"
            @mousedown.stop.prevent
            @click.stop.prevent="!isDeleted && emit('delete')"
            @keydown="(e) => !isDeleted && handleKeyDown(e, 'delete')"
        >
            Delete
        </button>
        <button
            type="button"
            tabindex="0"
            :aria-label="isPinned ? 'Unpin message' : 'Pin message'"
            :disabled="isDeleted"
            class="w-full px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent dark:text-gray-300 dark:hover:bg-gray-700 dark:disabled:hover:bg-transparent"
            @mousedown.stop.prevent
            @click.stop.prevent="!isDeleted && emit('pin')"
            @keydown="(e) => !isDeleted && handleKeyDown(e, 'pin')"
        >
            {{ isPinned ? 'Unpin' : 'Pin' }}
        </button>
        <button
            type="button"
            tabindex="0"
            aria-label="Forward message"
            :disabled="isDeleted"
            class="w-full px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent dark:text-gray-300 dark:hover:bg-gray-700 dark:disabled:hover:bg-transparent"
            @mousedown.stop.prevent
            @click.stop.prevent="!isDeleted && emit('forward')"
            @keydown="(e) => !isDeleted && handleKeyDown(e, 'forward')"
        >
            Forward
        </button>
    </div>
</template>
