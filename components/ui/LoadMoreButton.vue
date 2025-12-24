<script setup lang="ts">
interface Props {
    isLoading: boolean;
}

interface Emits {
    (e: 'load-more'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const isLoadingMore = computed(() => props.isLoading);
const buttonText = computed(() => (isLoadingMore.value ? 'Loading...' : 'Load older'));
const ariaLabel = computed(() =>
    isLoadingMore.value ? 'Loading older messages' : 'Load older messages',
);

function handleClick() {
    emit('load-more');
}

function handleKeyDown(event: KeyboardEvent) {
    if (event.key !== 'Enter' && event.key !== ' ') return;

    event.preventDefault();
    emit('load-more');
}
</script>

<template>
    <div class="flex justify-center">
        <button
            type="button"
            class="text-sm text-blue-600 underline hover:text-blue-700 disabled:opacity-50"
            :aria-label="ariaLabel"
            :tabindex="0"
            :disabled="isLoadingMore"
            @click="handleClick"
            @keydown="handleKeyDown"
        >
            {{ buttonText }}
        </button>
    </div>
</template>
