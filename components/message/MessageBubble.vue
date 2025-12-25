<script setup lang="ts">
import type { Message } from '~/types/Chat';
import { Pin } from 'lucide-vue-next';

interface Props {
    message: Message;
    isOwnMessage: boolean;
    isPinned: boolean;
    isDeleting: boolean;
    isEditing: boolean;
    editContent: string;
    isUpdating: boolean;
    highlighted?: boolean;
    senderDisplayName: string;
    editTextareaRef?: (el: any) => void;
}

interface Emits {
    (e: 'cancel-edit' | 'save-edit'): void;
    (e: 'keydown', event: KeyboardEvent): void;
    (e: 'update:editContent', value: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const bubbleClasses = computed(() => {
    const isDeleted = props.message.isDeleted === true;

    if (props.isOwnMessage) {
        return {
            'opacity-50': props.isDeleting || isDeleted,
            'bg-primary text-white': !props.isPinned && !isDeleted,
            'bg-yellow-50 dark:bg-yellow-900/50 border-2 border-yellow-300 dark:border-yellow-500 text-gray-900 dark:text-yellow-50':
                props.isPinned && !isDeleted,
            'bg-gray-400 dark:bg-gray-600 text-white': isDeleted,
            'ring-2 ring-gray-900 dark:ring-gray-100 ring-offset-2 dark:ring-offset-gray-900':
                props.highlighted,
        };
    }

    return {
        'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100':
            !props.isPinned && !isDeleted,
        'bg-yellow-50 dark:bg-yellow-900/50 border-yellow-300 dark:border-yellow-500 text-gray-900 dark:text-white':
            props.isPinned && !isDeleted,
        'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600':
            isDeleted,
        'ring-2 ring-gray-900 dark:ring-gray-100 ring-offset-2 dark:ring-offset-gray-900':
            props.highlighted,
    };
});

const isDeleted = computed(() => props.message.isDeleted === true);

const borderRadiusClass = computed(() => {
    const baseClass = 'rounded-lg';

    if (props.isEditing || props.isDeleting || isDeleted.value) {
        return `${baseClass} md:rounded-2xl`;
    }

    const contentLength = props.message.content?.length || 0;

    if (contentLength <= 50) {
        return `${baseClass} md:rounded-full`;
    }

    if (contentLength <= 150) {
        return `${baseClass} md:rounded-3xl`;
    }

    if (contentLength <= 300) {
        return `${baseClass} md:rounded-2xl`;
    }

    return `${baseClass} md:rounded-xl`;
});

const ariaLabel = computed(() => {
    if (props.isDeleting) return 'Deleting message...';

    if (isDeleted.value) return 'Deleted message';

    if (props.isOwnMessage) {
        return `Message from you${props.isPinned ? ' (pinned)' : ''}`;
    }

    return `Message from ${props.senderDisplayName}${props.isPinned ? ' (pinned)' : ''}`;
});
</script>

<template>
    <div
        class="relative w-fit px-3 py-2 text-xs shadow-sm transition-all duration-300 md:px-4 md:text-sm"
        :class="[
            borderRadiusClass,
            isOwnMessage ? '' : 'max-w-full border',
            bubbleClasses,
        ]"
        :aria-label="ariaLabel"
    >
        <Pin
            v-if="isPinned && !isDeleting && !isDeleted"
            class="absolute -right-1 -top-1 size-3 rotate-[45deg]"
            style="color: rgb(239 68 68)"
            aria-label="Pinned message"
        />
        <p v-if="isDeleting" class="whitespace-pre-wrap break-words italic">
            Deleting...
        </p>
        <p
            v-else-if="isDeleted"
            class="whitespace-pre-wrap break-words text-sm font-medium italic text-gray-700 dark:text-gray-300"
        >
            Message has been deleted
        </p>
        <template v-else-if="isEditing">
            <textarea
                :ref="editTextareaRef"
                :value="editContent"
                :disabled="isUpdating"
                :class="[
                    'm-0 w-full resize-none border-none bg-transparent p-0 focus:outline-none focus:ring-0',
                    isOwnMessage
                        ? 'text-gray-900 placeholder-gray-500 dark:text-gray-100 dark:placeholder-gray-400'
                        : 'text-gray-900 placeholder-gray-500 dark:text-gray-100 dark:placeholder-gray-400',
                ]"
                rows="3"
                aria-label="Edit message"
                @keydown="emit('keydown', $event)"
                @blur="emit('cancel-edit')"
                @input="
                    (e) =>
                        $emit(
                            'update:editContent',
                            (e.target as HTMLTextAreaElement).value,
                        )
                "
            />
            <div class="mt-2 flex items-center justify-end gap-2">
                <button
                    type="button"
                    tabindex="0"
                    aria-label="Cancel edit"
                    :class="[
                        'rounded-lg px-3 py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                        isOwnMessage
                            ? 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus-visible:ring-gray-400 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 dark:focus-visible:ring-gray-500'
                            : 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus-visible:ring-gray-400 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 dark:focus-visible:ring-gray-500',
                    ]"
                    @mousedown.prevent
                    @click.stop="emit('cancel-edit')"
                    @keydown="(e) => e.key === 'Enter' && emit('cancel-edit')"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    tabindex="0"
                    aria-label="Save changes"
                    :disabled="
                        isUpdating ||
                        !editContent ||
                        editContent.trim() === message.content
                    "
                    :class="[
                        'rounded-lg px-3 py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                        isOwnMessage
                            ? 'bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-primary-500'
                            : 'bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-primary-500',
                    ]"
                    @mousedown.prevent
                    @click.stop="emit('save-edit')"
                    @keydown="(e) => e.key === 'Enter' && emit('save-edit')"
                >
                    {{ isUpdating ? 'Saving...' : 'Save' }}
                </button>
            </div>
        </template>
        <template v-else>
            <div
                v-if="message.forwardedFrom"
                class="mb-2 border-b border-current border-opacity-20 pb-2 dark:border-opacity-30"
            >
                <p
                    class="text-xs font-medium opacity-80"
                    :class="
                        isOwnMessage
                            ? 'text-white'
                            : 'text-gray-700 dark:text-gray-300 dark:opacity-90'
                    "
                >
                    Forwarded from:
                    {{ message.forwardedFrom.chatName || 'Private chat' }}
                </p>
                <p
                    class="text-[10px] opacity-60"
                    :class="
                        isOwnMessage
                            ? 'text-white'
                            : 'text-gray-600 dark:text-gray-400 dark:opacity-70'
                    "
                >
                    {{ message.forwardedFrom.senderUsername }} •
                    {{
                        new Date(
                            message.forwardedFrom.originalCreatedAt,
                        ).toLocaleString('en-US', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                        })
                    }}
                </p>
            </div>
            <p
                class="whitespace-pre-wrap break-words"
                :class="
                    isOwnMessage
                        ? isPinned
                            ? 'text-gray-900 dark:text-yellow-50'
                            : 'text-white'
                        : isPinned
                          ? 'text-gray-900 dark:text-white'
                          : 'text-gray-900 dark:text-white'
                "
            >
                {{ message.content }}
            </p>
        </template>
    </div>
</template>
