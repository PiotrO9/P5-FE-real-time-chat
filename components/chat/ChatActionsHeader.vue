<script setup lang="ts">
interface Emits {
    (e: 'close'): void;
}

const emit = defineEmits<Emits>();

function handleToggleState() {
    emit('close');
}

function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleToggleState();
    }
}
</script>

<template>
    <div class="border-b bg-white p-4 backdrop-blur dark:border-gray-700 dark:bg-gray-900">
        <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Chat actions</h2>
            <button
                type="button"
                tabindex="0"
                aria-label="Close actions panel"
                class="flex size-8 items-center justify-center rounded-full bg-gray-100 p-2 transition-colors dark:bg-gray-700"
                @click="handleToggleState"
                @keydown="handleKeyDown"
            >
                <Icon name="remove" class="size-4 text-gray-600 dark:text-gray-300" />
            </button>
        </div>
    </div>
</template>
