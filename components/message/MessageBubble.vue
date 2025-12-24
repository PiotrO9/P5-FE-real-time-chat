<script setup lang="ts">
import type { Message } from '~/types/Chat';

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
    formattedTime: string;
    isEdited: boolean;
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
            'bg-blue-100 dark:bg-blue-900 text-gray-900 dark:text-gray-100':
                !props.isPinned && !isDeleted,
            'bg-yellow-500 dark:bg-yellow-500 text-white dark:text-yellow-50':
                props.isPinned && !isDeleted,
            'bg-gray-400 dark:bg-gray-600 text-white': isDeleted,
            'ring-2 ring-gray-900 dark:ring-gray-100 ring-offset-2 dark:ring-offset-gray-900':
                props.highlighted,
        };
    } else {
        return {
            'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100':
                !props.isPinned && !isDeleted,
            'bg-yellow-50 dark:bg-yellow-900/50 border-yellow-300 dark:border-yellow-500 text-gray-900 dark:text-yellow-50':
                props.isPinned && !isDeleted,
            'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600':
                isDeleted,
            'ring-2 ring-gray-900 dark:ring-gray-100 ring-offset-2 dark:ring-offset-gray-900':
                props.highlighted,
        };
    }
});

const isDeleted = computed(() => props.message.isDeleted === true);

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
        class="relative w-fit rounded-2xl px-3 py-2 text-xs shadow-sm transition-all duration-300 md:px-4 md:text-sm"
        :class="[isOwnMessage ? '' : 'max-w-full border', bubbleClasses]"
        :aria-label="ariaLabel"
    >
        <p v-if="isDeleting" class="whitespace-pre-wrap break-words italic">
            Deleting...
        </p>
        <p
            v-else-if="isDeleted"
            class="whitespace-pre-wrap break-words italic opacity-70"
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
                            ? 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500'
                            : 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500',
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
                    class="text-xs font-medium text-gray-700 opacity-80 dark:text-gray-300 dark:opacity-90"
                >
                    Forwarded from:
                    {{ message.forwardedFrom.chatName || 'Private chat' }}
                </p>
                <p
                    class="text-[10px] text-gray-600 opacity-60 dark:text-gray-400 dark:opacity-70"
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
                        })
                    }}
                </p>
            </div>
            <p class="whitespace-pre-wrap break-words text-gray-600">
                {{ message.content }}
            </p>
            <p
                class="mt-1 flex items-center gap-1 text-[10px] text-gray-600 opacity-70 dark:text-gray-400 dark:opacity-80"
            >
                {{ formattedTime }}
                <span v-if="isEdited" class="italic opacity-60 dark:opacity-70"
                    >(edited)</span
                >
            </p>
        </template>
    </div>
</template>
