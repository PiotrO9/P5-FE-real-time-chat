<script setup lang="ts">
import type { Friend } from '~/types/Chat';

interface Props {
    availableFriends: Friend[];
    isAddingUser: boolean;
}

interface Emits {
    (e: 'add-user', username: string): void;
    (e: 'add-user-click', friend: Friend): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const addUserUsername = ref('');

function handleAddUser() {
    if (!addUserUsername.value.trim()) return;

    emit('add-user', addUserUsername.value.trim());
    addUserUsername.value = '';
}

function handleAddUserClick(friend: Friend) {
    addUserUsername.value = friend.username;
    handleAddUser();
}

function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
        handleAddUser();
    }
}
</script>

<template>
    <div
        class="border-b border-t border-gray-200 p-4 dark:border-gray-700 dark:bg-gray-900"
    >
        <h3 class="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
            Add user
        </h3>
        <div class="space-y-2">
            <label for="add-user-input" class="sr-only">Username</label>
            <input
                id="add-user-input"
                v-model="addUserUsername"
                type="text"
                placeholder="Enter username"
                class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
                @keydown="handleKeyDown"
            />
            <button
                type="button"
                tabindex="0"
                aria-label="Add user"
                :disabled="props.isAddingUser || !addUserUsername.trim()"
                class="w-full rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700"
                @click="handleAddUser"
                @keydown.enter="handleAddUser"
            >
                {{ props.isAddingUser ? 'Adding...' : 'Add' }}
            </button>
        </div>

        <div v-if="props.availableFriends.length > 0" class="mt-4">
            <p class="mb-2 text-xs text-gray-600 dark:text-gray-400">
                Available friends:
            </p>
            <div class="max-h-32 space-y-1 overflow-y-auto">
                <button
                    v-for="friend in props.availableFriends"
                    :key="friend.id"
                    type="button"
                    tabindex="0"
                    :aria-label="`Add ${friend.username} to chat`"
                    class="flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-xs transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                    @click="handleAddUserClick(friend)"
                    @keydown.enter="handleAddUserClick(friend)"
                >
                    <span class="font-medium text-gray-900 dark:text-gray-100">
                        {{ friend.username }}
                    </span>
                    <span
                        v-if="friend.isOnline"
                        class="size-2 rounded-full bg-green-500"
                        aria-label="Online"
                    ></span>
                </button>
            </div>
        </div>
    </div>
</template>
