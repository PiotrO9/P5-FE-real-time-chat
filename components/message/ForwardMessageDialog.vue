<script setup lang="ts">
import type { Chat } from '~/types/Chat';
import ChatItem from '~/components/chat/ChatItem.vue';
import { compareIds } from '~/utils/idHelpers';

interface Props {
    open: boolean;
    chats: Chat[];
    currentChatId: string | null;
}

interface Emits {
    (e: 'update:open', value: boolean): void;
    (e: 'select-chat', chatId: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const searchQuery = ref('');
const dialogRef = ref<HTMLDialogElement | null>(null);

const filteredChats = computed(() => {
    if (!props.chats || props.chats.length === 0) {
        return [];
    }

    const query = searchQuery.value.trim().toLowerCase();

    if (query.length === 0) {
        return props.chats.filter(
            (chat) => !props.currentChatId || !compareIds(chat.id, props.currentChatId),
        );
    }

    return props.chats.filter(
        (chat) =>
            (!props.currentChatId || !compareIds(chat.id, props.currentChatId)) &&
            chat.name.toLowerCase().includes(query),
    );
});

watch(
    () => props.open,
    (newValue) => {
        if (!dialogRef.value) return;

        if (newValue) {
            nextTick(() => {
                if (dialogRef.value) {
                    dialogRef.value.showModal();
                    searchQuery.value = '';
                }
            });
        } else {
            dialogRef.value.close();
        }
    },
    { immediate: true },
);

function handleSelectChat(chatId: string) {
    emit('select-chat', chatId);
    emit('update:open', false);
}

function handleCancel() {
    emit('update:open', false);
}

function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
        event.preventDefault();
        handleCancel();
    }
}

function handleBackdropClick(event: MouseEvent) {
    if (!dialogRef.value) return;

    if (event.target === dialogRef.value) {
        handleCancel();
    }
}

onMounted(() => {
    if (props.open && dialogRef.value) {
        dialogRef.value.showModal();
    }
});
</script>

<template>
    <Teleport to="body">
        <dialog
            v-show="open"
            ref="dialogRef"
            class="dialog-content w-full max-w-md rounded-xl border-0 bg-white p-0 shadow-2xl backdrop:bg-black backdrop:bg-opacity-50 backdrop:backdrop-blur-sm dark:bg-gray-800"
            aria-labelledby="forward-dialog-title"
            aria-describedby="forward-dialog-description"
            @keydown="handleKeyDown"
            @click="handleBackdropClick"
        >
            <div class="flex max-h-[80vh] flex-col p-6">
                <header class="mb-4">
                    <h2
                        id="forward-dialog-title"
                        class="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100"
                    >
                        Forward message
                    </h2>
                    <p
                        id="forward-dialog-description"
                        class="text-sm text-gray-600 dark:text-gray-400"
                    >
                        Select a chat to forward the message to
                    </p>
                </header>

                <div class="mb-4">
                    <input
                        v-model="searchQuery"
                        type="text"
                        placeholder="Search chat..."
                        class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500"
                        aria-label="Search chat"
                    />
                </div>

                <div class="mb-4 flex-1 overflow-y-auto">
                    <div v-if="filteredChats.length === 0" class="p-8 text-center">
                        <p class="text-sm text-gray-500 dark:text-gray-400">
                            {{ searchQuery ? 'No chats found' : 'No available chats' }}
                        </p>
                    </div>
                    <ul
                        v-else
                        class="divide-y divide-gray-100 dark:divide-gray-800"
                        role="listbox"
                        aria-label="Chat list"
                    >
                        <li
                            v-for="chat in filteredChats"
                            :key="chat.id"
                            role="option"
                            :aria-selected="false"
                        >
                            <button
                                type="button"
                                tabindex="0"
                                class="w-full text-left"
                                :aria-label="`Forward to: ${chat.name}`"
                                @click="handleSelectChat(chat.id)"
                                @keydown="(e) => e.key === 'Enter' && handleSelectChat(chat.id)"
                            >
                                <ChatItem
                                    :chat="chat"
                                    :is-selected="false"
                                    :typing-users="[]"
                                    @select="handleSelectChat"
                                />
                            </button>
                        </li>
                    </ul>
                </div>

                <footer class="flex justify-end gap-3">
                    <button
                        type="button"
                        tabindex="0"
                        class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors duration-150 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                        aria-label="Cancel"
                        @click="handleCancel"
                        @keydown="(e) => e.key === 'Enter' && handleCancel()"
                    >
                        Cancel
                    </button>
                </footer>
            </div>
        </dialog>
    </Teleport>
</template>

<style scoped>
.dialog-content {
    animation: dialog-enter 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes dialog-enter {
    from {
        opacity: 0;
        transform: scale(0.9) translateY(-10px);
    }
    to {
        opacity: 1;
        transform: scale(1) translateY(0);
    }
}
</style>
