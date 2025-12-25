<script setup lang="ts">
import type EmojiTooltip from '../ui/EmojiTooltip.vue';
import MessageContextMenu from './MessageContextMenu.vue';
import { Smile, Reply, MoreVertical } from 'lucide-vue-next';

interface Props {
    messageId: string | number;
    currentUserId: string | number;
    groupedReactions: Record<string, any>;
    userReactions: any[];
    isDeleting: boolean;
    isDeleted?: boolean;
    position: 'left' | 'right';
    isOwnMessage: boolean;
    isPinned: boolean;
    shouldShow: boolean;
    shouldRender?: boolean;
    showContextMenu: boolean;
}

interface Emits {
    (
        e:
            | 'reply-click'
            | 'context-menu-toggle'
            | 'mouseenter'
            | 'mouseleave'
            | 'delete'
            | 'pin'
            | 'forward'
            | 'context-menu-mouseenter'
            | 'context-menu-mouseleave'
            | 'emoji-click'
            | 'focusin'
            | 'focusout',
    ): void;
    (e: 'reaction-click', emoji: string): void;
    (e: 'tooltip-show-change', show: boolean): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const emojiTooltipRef = ref<InstanceType<typeof EmojiTooltip> | null>(null);
const contextMenuRef = ref<HTMLDivElement | null>(null);
const emojiTooltipContainerRef = ref<HTMLDivElement | null>(null);

function handleEmojiButtonClick() {
    emit('emoji-click');
    emojiTooltipRef.value?.showTooltip();
}

function handleTooltipShowChange(show: boolean) {
    emit('tooltip-show-change', show);
}

defineExpose({
    emojiTooltipRef,
    contextMenuRef,
    emojiTooltipContainerRef,
});
</script>

<template>
    <div
        v-if="shouldRender !== false"
        class="flex shrink-0 items-center gap-1 transition-opacity duration-200"
        :class="{
            'opacity-100': shouldShow,
            'opacity-0': !shouldShow,
            'top-0': isOwnMessage,
        }"
        @mouseenter="emit('mouseenter')"
        @mouseleave="emit('mouseleave')"
        @focusin="emit('focusin')"
        @focusout="emit('focusout')"
    >
        <div
            ref="emojiTooltipContainerRef"
            class="relative"
            @mouseenter="emit('mouseenter')"
        >
            <button
                type="button"
                tabindex="0"
                aria-label="Add reaction"
                :disabled="props.isDeleted"
                class="flex size-8 items-center justify-center rounded-full border border-gray-300 bg-white shadow-sm transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700 dark:disabled:hover:bg-gray-800"
                @click.stop="handleEmojiButtonClick"
                @keydown="
                    (e) =>
                        e.key === 'Enter' &&
                        !props.isDeleted &&
                        handleEmojiButtonClick()
                "
            >
                <Smile
                    class="size-4 text-gray-600 dark:text-gray-300"
                />
            </button>
            <EmojiTooltip
                ref="emojiTooltipRef"
                :message-id="messageId"
                :current-user-id="currentUserId"
                :grouped-reactions="groupedReactions"
                :user-reactions="userReactions"
                :is-deleting="isDeleting"
                :position="position"
                @reaction-click="emit('reaction-click', $event)"
                @show-change="handleTooltipShowChange"
            />
        </div>
        <button
            type="button"
            tabindex="0"
            aria-label="Reply to message"
            :disabled="props.isDeleted"
            class="flex size-8 items-center justify-center rounded-full border border-gray-300 bg-white shadow-sm transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700 dark:disabled:hover:bg-gray-800"
            @click.stop="!props.isDeleted && emit('reply-click')"
            @keydown="
                (e) =>
                    !props.isDeleted &&
                    (e.key === 'Enter' || e.key === ' ') &&
                    emit('reply-click')
            "
        >
            <Reply
                class="size-4 text-gray-600 dark:text-gray-300"
            />
        </button>
        <div class="relative">
            <button
                type="button"
                tabindex="0"
                aria-label="Context menu"
                :disabled="props.isDeleted"
                class="flex size-8 items-center justify-center rounded-full border border-gray-300 bg-white shadow-sm transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700 dark:disabled:hover:bg-gray-800"
                @click.stop="!props.isDeleted && emit('context-menu-toggle')"
                @keydown="
                    (e) =>
                        !props.isDeleted &&
                        (e.key === 'Enter' || e.key === ' ') &&
                        emit('context-menu-toggle')
                "
            >
                <MoreVertical
                    class="size-4 text-gray-600 dark:text-gray-300"
                />
            </button>
            <MessageContextMenu
                v-if="showContextMenu"
                ref="contextMenuRef"
                :is-own-message="isOwnMessage"
                :is-pinned="isPinned"
                :is-deleted="isDeleted"
                :position="position"
                @delete="emit('delete')"
                @pin="emit('pin')"
                @forward="emit('forward')"
                @mouseenter="emit('context-menu-mouseenter')"
                @mouseleave="emit('context-menu-mouseleave')"
            />
        </div>
    </div>
</template>
