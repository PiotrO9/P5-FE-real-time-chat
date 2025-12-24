<script setup lang="ts">
interface Props {
    senderName: string;
}

const props = defineProps<Props>();

const avatarInitial = computed(() => {
    const name = props.senderName || '?';
    return name.charAt(0).toUpperCase();
});
</script>

<template>
    <div
        class="flex size-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-200 font-semibold text-gray-600 dark:bg-gray-700 dark:text-gray-300"
        :aria-label="`Avatar ${senderName}`"
    >
        {{ avatarInitial }}
    </div>
</template>
