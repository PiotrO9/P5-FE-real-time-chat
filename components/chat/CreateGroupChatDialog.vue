<script setup lang="ts">
import type { Friend } from '~/types/Chat';
import ChatInitial from './ChatInitial.vue';
import { compareIds } from '~/utils/idHelpers';

interface Props {
    open: boolean;
    friends: Friend[];
    isCreating?: boolean;
}

interface Emits {
    (e: 'update:open', value: boolean): void;
    (e: 'create', data: { name: string; participantIds: string[] }): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const groupName = ref('');
const selectedFriends = ref<string[]>([]);
const searchQuery = ref('');
const dialogRef = ref<HTMLDialogElement | null>(null);
const nameInputRef = ref<HTMLInputElement | null>(null);

const filteredFriends = computed(() => {
    if (!props.friends || props.friends.length === 0) {
        return [];
    }

    const query = searchQuery.value.trim().toLowerCase();

    if (query.length === 0) {
        return props.friends;
    }

    return props.friends.filter((friend) =>
        friend.username.toLowerCase().includes(query),
    );
});

const canCreate = computed(() => {
    return (
        groupName.value.trim().length >= 1 &&
        groupName.value.trim().length <= 100 &&
        selectedFriends.value.length >= 2
    );
});

const selectedCount = computed(() => selectedFriends.value.length);

watch(
    () => props.open,
    (newValue) => {
        if (!dialogRef.value) return;

        if (newValue) {
            nextTick(() => {
                if (dialogRef.value) {
                    dialogRef.value.showModal();
                    groupName.value = '';
                    selectedFriends.value = [];
                    searchQuery.value = '';

                    if (nameInputRef.value) {
                        nameInputRef.value.focus();
                    }
                }
            });
        } else {
            dialogRef.value.close();
        }
    },
    { immediate: true },
);

function handleToggleFriend(friendId: string | number) {
    const id = String(friendId);
    const index = selectedFriends.value.findIndex((id) => compareIds(id, friendId));

    if (index >= 0) {
        selectedFriends.value.splice(index, 1);
    } else {
        selectedFriends.value.push(id);
    }
}

function handleCreate() {
    if (!canCreate.value) return;

    emit('create', {
        name: groupName.value.trim(),
        participantIds: selectedFriends.value,
    });
}

function handleCancel() {
    emit('update:open', false);
}

function getInitials(username: string): string {
    return username
        .split(' ')
        .map((name) => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

function getFocusableElements(): HTMLElement[] {
    if (!dialogRef.value) return [];

    const selector =
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const elements = Array.from(
        dialogRef.value.querySelectorAll<HTMLElement>(selector),
    );

    return elements.filter(
        (el) => !el.hasAttribute('disabled') && !el.hasAttribute('aria-hidden'),
    );
}

function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
        event.preventDefault();
        handleCancel();

        return;
    }

    if (event.key === 'Tab' && dialogRef.value) {
        const focusableElements = getFocusableElements();

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (!firstElement || !lastElement) return;

        if (event.shiftKey) {
            if (document.activeElement === firstElement) {
                event.preventDefault();
                lastElement.focus();
            }
        } else {
            if (document.activeElement === lastElement) {
                event.preventDefault();
                firstElement.focus();
            }
        }
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
            aria-labelledby="create-group-dialog-title"
            aria-describedby="create-group-dialog-description"
            @keydown="handleKeyDown"
            @click="handleBackdropClick"
        >
            <div class="flex max-h-[80vh] flex-col p-6">
                <header class="mb-4">
                    <h2
                        id="create-group-dialog-title"
                        class="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100"
                    >
                        Create group
                    </h2>
                    <p
                        id="create-group-dialog-description"
                        class="text-sm text-gray-600 dark:text-gray-400"
                    >
                        Select friends to create a new group
                    </p>
                </header>

                <div class="mb-4">
                    <label
                        for="group-name-input"
                        class="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100"
                    >
                        Group name
                    </label>
                    <input
                        id="group-name-input"
                        ref="nameInputRef"
                        v-model="groupName"
                        type="text"
                        placeholder="Enter group name"
                        maxlength="100"
                        class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500"
                        aria-label="Group name"
                        tabindex="0"
                    />
                    <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {{ groupName.length }}/100 characters
                    </p>
                </div>

                <div class="mb-4">
                    <label
                        for="friends-search-input"
                        class="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100"
                    >
                        Select friends
                    </label>
                    <input
                        id="friends-search-input"
                        v-model="searchQuery"
                        type="text"
                        placeholder="Search friends..."
                        class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500"
                        aria-label="Search friends"
                        tabindex="0"
                    />
                </div>

                <div class="mb-4 flex-1 overflow-y-auto">
                    <div
                        v-if="filteredFriends.length === 0"
                        class="p-8 text-center"
                    >
                        <p class="text-sm text-gray-500 dark:text-gray-400">
                            {{
                                searchQuery
                                    ? 'No friends found'
                                    : 'No available friends'
                            }}
                        </p>
                    </div>
                    <ul
                        v-else
                        class="divide-y divide-gray-100 dark:divide-gray-800"
                        role="listbox"
                        aria-label="Friends list"
                    >
                        <li
                            v-for="friend in filteredFriends"
                            :key="friend.id"
                            role="option"
                            :aria-selected="selectedFriends.some((id) =>
                                compareIds(id, friend.id),
                            )"
                        >
                            <button
                                type="button"
                                tabindex="0"
                                :class="[
                                    'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
                                    selectedFriends.some((id) =>
                                        compareIds(id, friend.id),
                                    )
                                        ? 'bg-primary-50 dark:bg-primary-900/20'
                                        : 'hover:bg-gray-50 dark:hover:bg-gray-800',
                                ]"
                                :aria-label="`${
                                    selectedFriends.some((id) =>
                                        compareIds(id, friend.id),
                                    )
                                        ? 'Deselect'
                                        : 'Select'
                                } ${friend.username}`"
                                @click="handleToggleFriend(friend.id)"
                                @keydown="
                                    (e) =>
                                        (e.key === 'Enter' || e.key === ' ') &&
                                        handleToggleFriend(friend.id)
                                "
                            >
                                <div class="relative flex-shrink-0">
                                    <ChatInitial
                                        :chat-initial="getInitials(friend.username)"
                                        :is-online="friend.isOnline"
                                    />
                                </div>
                                <div class="min-w-0 flex-1">
                                    <p
                                        class="truncate text-sm font-medium text-gray-900 dark:text-gray-100"
                                    >
                                        {{ friend.username }}
                                    </p>
                                </div>
                                <div
                                    :class="[
                                        'flex size-5 shrink-0 items-center justify-center rounded border-2 transition-colors',
                                        selectedFriends.some((id) =>
                                            compareIds(id, friend.id),
                                        )
                                            ? 'border-primary-500 bg-primary-500'
                                            : 'border-gray-300 dark:border-gray-600',
                                    ]"
                                >
                                    <svg
                                        v-if="
                                            selectedFriends.some((id) =>
                                                compareIds(id, friend.id),
                                            )
                                        "
                                        class="size-3 text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="3"
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                </div>
                            </button>
                        </li>
                    </ul>
                </div>

                <div
                    v-if="selectedCount > 0"
                    class="mb-4 rounded-lg bg-primary-50 p-3 dark:bg-primary-900/20"
                >
                    <p class="text-sm text-gray-900 dark:text-gray-100">
                        <span class="font-medium">{{ selectedCount }}</span>
                        {{ selectedCount === 1 ? 'friend selected' : 'friends selected' }}
                    </p>
                </div>

                <footer class="flex justify-end gap-3">
                    <button
                        type="button"
                        tabindex="0"
                        class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors duration-150 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                        aria-label="Cancel"
                        :disabled="isCreating"
                        @click="handleCancel"
                        @keydown="(e) => e.key === 'Enter' && handleCancel()"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        tabindex="0"
                        class="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-primary-600 dark:hover:bg-primary-700"
                        aria-label="Create group"
                        :disabled="!canCreate || isCreating"
                        @click="handleCreate"
                        @keydown="(e) => e.key === 'Enter' && canCreate && handleCreate()"
                    >
                        {{ isCreating ? 'Creating...' : 'Create group' }}
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

