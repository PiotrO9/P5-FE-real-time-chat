<script setup lang="ts">
import type { Reaction } from '~/types/Chat';

interface GroupedReaction {
    userIds: (string | number)[];
    reactions: Reaction[];
}

interface Props {
    messageId: string | number;
    currentUserId: string | number;
    groupedReactions: Record<string, GroupedReaction>;
    userReactions: Reaction[];
    isDeleting: boolean;
    position: 'left' | 'right';
}

interface Emits {
    (e: 'reaction-click', emoji: string): void;
    (e: 'show-change', show: boolean): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const showReactionPicker = ref(false);
const reactionsContainerRef = ref<HTMLDivElement | null>(null);

const groupedEmojiCategories = [
    {
        label: 'Quick',
        emojis: ['👍', '❤️', '😄', '😮', '😢', '🙏'],
    },
    {
        label: 'Positive',
        emojis: ['😁', '😂', '🥳', '😎', '🤩', '😇', '😋', '🤗'],
    },
    {
        label: 'Negative',
        emojis: ['😕', '😞', '😡', '😠', '😭', '🤬', '😤', '😢'],
    },
    {
        label: 'Gestures',
        emojis: ['👍', '👎', '👏', '🙌', '🤝', '🤞', '✌️', '👊'],
    },
    {
        label: 'Emotions',
        emojis: ['😅', '🤔', '😳', '😬', '🥹', '😴', '🤯', '🥶'],
    },
    {
        label: 'Animals',
        emojis: ['🐶', '🐱', '🐻', '🦊', '🐸', '🐼', '🐧', '🦄'],
    },
    {
        label: 'Symbols',
        emojis: ['⭐', '🔥', '💯', '✨', '⚡', '🎯', '🎉', '💎'],
    },
];

function hasUserReaction(emoji: string): boolean {
    const reactionGroup = props.groupedReactions[emoji];
    if (!reactionGroup) return false;
    const foundReaction = reactionGroup.reactions.find(
        (r) => r.emoji === emoji,
    );
    if (!foundReaction) return false;
    return foundReaction.userIds.some(
        (userId) => String(userId) === String(props.currentUserId),
    );
}

function handleReactionPickerMouseEnter() {
    showReactionPicker.value = true;
    emit('show-change', true);
}

function handleReactionPickerMouseLeave() {
    showReactionPicker.value = false;
    emit('show-change', false);
}

function handleReactionClick(emoji: string) {
    emit('reaction-click', emoji);
    showReactionPicker.value = false;
    emit('show-change', false);
}

function handleReactionKeyDown(event: KeyboardEvent, emoji: string) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleReactionClick(emoji);
    }
}

function showTooltip() {
    if (!props.isDeleting) {
        showReactionPicker.value = true;
        emit('show-change', true);
    }
}

function hideTooltip() {
    if (!showReactionPicker.value) return;
    setTimeout(() => {
        if (!reactionsContainerRef.value?.matches(':hover')) {
            showReactionPicker.value = false;
            emit('show-change', false);
        }
    }, 200);
}

defineExpose({
    showTooltip,
    hideTooltip,
    showReactionPicker,
});
</script>

<template>
    <div
        v-if="showReactionPicker"
        ref="reactionsContainerRef"
        class="absolute top-1/2 z-20 flex max-h-44 w-64 -translate-y-1/2 flex-col gap-1 overflow-y-auto rounded-2xl border border-gray-200 bg-white p-1.5 shadow-xl dark:border-gray-700 dark:bg-gray-800"
        :class="{
            'left-0 -translate-y-[120%]': position === 'left',
            'right-0 -translate-y-[120%]': position === 'right',
        }"
        @mouseenter="handleReactionPickerMouseEnter"
        @mouseleave="handleReactionPickerMouseLeave"
    >
        <div
            v-for="group in groupedEmojiCategories"
            :key="group.label"
            class="flex flex-col"
        >
            <p
                class="mb-0.5 ml-1 text-xs font-medium text-gray-500 dark:text-gray-400"
            >
                {{ group.label }}
            </p>
            <div class="flex flex-wrap gap-1">
                <button
                    v-for="emoji in group.emojis"
                    :key="emoji"
                    type="button"
                    tabindex="0"
                    :aria-label="`Add reaction ${emoji}`"
                    class="flex size-8 items-center justify-center rounded-full text-lg transition-transform hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:bg-gray-700"
                    :class="{
                        'bg-blue-50 dark:bg-blue-900': hasUserReaction(emoji),
                        'hover:scale-110': true,
                    }"
                    @click="handleReactionClick(emoji)"
                    @keydown="handleReactionKeyDown($event, emoji)"
                >
                    {{ emoji }}
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
::-webkit-scrollbar {
    width: 6px;
}

::-webkit-scrollbar-thumb {
    background-color: #ccc;
    border-radius: 3px;
}

@media (prefers-color-scheme: dark) {
    ::-webkit-scrollbar-thumb {
        background-color: #4b5563;
    }
}
</style>
