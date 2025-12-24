<script setup lang="ts">
interface Props {
    typingText: string;
}

const { typingText } = defineProps<Props>();
</script>

<template>
    <div class="border-t border-gray-200 bg-gray-50 px-4 py-2 md:px-6">
        <div class="flex items-center gap-3">
            <div
                class="inline-flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-gray-200 bg-white px-4 py-2.5 shadow-sm"
            >
                <div class="flex items-center gap-1 px-1">
                    <span
                        class="typing-dot h-1.5 w-1.5 rounded-full bg-gray-500"
                        style="animation-delay: 0ms"
                    ></span>
                    <span
                        class="typing-dot h-1.5 w-1.5 rounded-full bg-gray-500"
                        style="animation-delay: 150ms"
                    ></span>
                    <span
                        class="typing-dot h-1.5 w-1.5 rounded-full bg-gray-500"
                        style="animation-delay: 300ms"
                    ></span>
                </div>
                <span class="text-sm font-medium text-gray-600">{{
                    typingText
                }}</span>
            </div>
        </div>
    </div>
</template>
