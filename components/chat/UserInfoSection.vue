<script setup lang="ts">
import type { User } from '~/types/Chat';

interface Props {
    user: User;
}

const props = defineProps<Props>();

const userData = computed(() => props.user);

function getInitials(username: string): string {
    return username
        .split(' ')
        .map((name) => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

const isOnline = computed(() => {
    if (userData.value.isOnline !== undefined) {
        return userData.value.isOnline;
    }

    if (!userData.value.lastSeen) return false;

    const lastSeenDate = new Date(userData.value.lastSeen);
    const now = new Date();
    const diffMs = now.getTime() - lastSeenDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    return diffMins < 5;
});
</script>

<template>
    <div class="flex flex-col">
        <div class="border-b border-gray-200 px-4 py-6 dark:border-gray-700">
            <div class="flex flex-col items-center gap-4">
                <div class="relative flex-shrink-0">
                    <div
                        class="flex size-20 items-center justify-center rounded-full bg-blue-100 text-2xl font-semibold text-blue-600"
                    >
                        {{ getInitials(userData.username) }}
                    </div>
                    <div
                        v-if="isOnline"
                        class="absolute bottom-0 right-0 size-4 rounded-full border-2 border-white bg-green-500"
                        aria-label="Online"
                    ></div>
                </div>

                <div class="flex w-full flex-col items-center gap-2">
                    <h3
                        class="text-lg font-semibold text-gray-900 dark:text-gray-100"
                    >
                        {{ userData.username }}
                    </h3>
                    <p
                        class="text-center text-sm text-gray-500 dark:text-gray-400"
                    >
                        Head Of Design at Logoipsum
                    </p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                        Bangladesh
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>
