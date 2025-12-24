<script setup lang="ts">
interface Emits {
    (e: 'add-friend', username: string): void;
}

const emit = defineEmits<Emits>();

const username = ref('');
const isSubmitting = ref(false);

function handleSubmit() {
    const trimmedUsername = username.value.trim();

    if (!trimmedUsername) {
        return;
    }

    isSubmitting.value = true;
    emit('add-friend', trimmedUsername);
    username.value = '';

    setTimeout(() => {
        isSubmitting.value = false;
    }, 500);
}

function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
        event.preventDefault();
        handleSubmit();
    }
}
</script>

<template>
    <div class="flex h-full flex-col rounded-b-[1.125rem] bg-white dark:bg-gray-900">
        <div class="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
            <label
                for="username-input"
                class="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100"
            >
                Add friend
            </label>
            <div class="flex gap-2">
                <input
                    id="username-input"
                    v-model="username"
                    type="text"
                    placeholder="Enter username..."
                    class="min-w-0 flex-1 rounded-full border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
                    :disabled="isSubmitting"
                    @keydown="handleKeyDown"
                />
                <button
                    type="button"
                    class="flex-shrink-0 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700 md:px-4"
                    tabindex="0"
                    aria-label="Send invitation"
                    :disabled="!username.trim() || isSubmitting"
                    @click="handleSubmit"
                >
                    <span class="hidden sm:inline">Send</span>
                    <span class="sm:hidden">+</span>
                </button>
            </div>
            <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Enter the username of the person you want to send a friend invitation to.
            </p>
        </div>

        <div class="flex-1 overflow-y-auto px-4 py-4">
            <div
                class="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20"
            >
                <h4 class="mb-2 text-sm font-semibold text-blue-900 dark:text-blue-300">
                    How it works?
                </h4>
                <ul
                    class="list-inside list-disc space-y-1 text-xs text-blue-800 dark:text-blue-300"
                >
                    <li>Enter the username of the person you want to add</li>
                    <li>A friend invitation will be sent</li>
                    <li>The person will receive the invitation and can accept or reject it</li>
                    <li>After acceptance, you'll find them in your friends list</li>
                </ul>
            </div>
        </div>
    </div>
</template>
