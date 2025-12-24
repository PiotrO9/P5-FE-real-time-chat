<script setup lang="ts">
interface GroupedReaction {
    userIds: (string | number)[];
    reactions: any[];
}

interface Props {
    groupedReactions: Record<string, GroupedReaction>;
    hasUserReaction: (emoji: string) => boolean;
    getReactionCount: (emoji: string) => number;
    alignment: 'left' | 'right';
}

interface Emits {
    (e: 'reaction-click', emoji: string, event: Event): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

function handleReactionBadgeClick(emoji: string, event: Event) {
    event.stopPropagation();
    emit('reaction-click', emoji, event);
}

function handleReactionBadgeKeyDown(event: KeyboardEvent, emoji: string) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        event.stopPropagation();
        emit('reaction-click', emoji, event);
    }
}
</script>

<template>
    <div
        v-if="Object.keys(groupedReactions).length > 0"
        class="mt-1 flex flex-wrap gap-1 px-1"
        :class="alignment === 'right' ? 'justify-end' : ''"
    >
        <button
            v-for="(reactionGroup, emoji) in groupedReactions"
            :key="emoji"
            type="button"
            tabindex="0"
            :aria-label="`${getReactionCount(emoji)} reactions ${emoji}, click to ${hasUserReaction(emoji) ? 'remove' : 'add'} reaction`"
            class="flex items-center gap-1 rounded-full border border-gray-300 bg-gray-100 px-2 py-0.5 text-xs transition-colors hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700"
            :class="{
                'border-blue-300 bg-blue-100 dark:border-blue-600 dark:bg-blue-900':
                    hasUserReaction(emoji),
            }"
            @click="handleReactionBadgeClick(emoji, $event)"
            @keydown="handleReactionBadgeKeyDown($event, emoji)"
        >
            <span>{{ emoji }}</span>
            <span class="font-medium text-gray-700 dark:text-gray-300">{{
                getReactionCount(emoji)
            }}</span>
        </button>
    </div>
</template>
