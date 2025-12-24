<script setup lang="ts">
interface Props {
    classes?: string;
}

const { classes = '' } = defineProps<Props>();

const isOpen = ref(false);

function handleToggleState() {
    isOpen.value = !isOpen.value;
}
</script>

<template>
    <div
        :class="[
            classes,
            'flex size-8 cursor-pointer items-center justify-center rounded-full border-2 border-solid border-gray-400 bg-white hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700',
        ]"
        @click="handleToggleState"
    >
        <div class="flex items-center gap-1">
            <Icon name="context-menu-dots" class="text-gray-600 dark:text-gray-300" />
        </div>
    </div>
</template>
