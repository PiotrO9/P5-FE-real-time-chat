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
            'flex size-8 cursor-pointer items-center justify-center rounded-full border-gray-400 bg-gray-100 transition-colors hover:bg-gray-100 focus-visible:outline-primary dark:bg-gray-700 dark:hover:bg-gray-700',
        ]"
        tabindex="0"
        @click="handleToggleState"
    >
        <div class="flex items-center gap-1">
            <Icon
                name="context-menu-dots"
                class="text-gray-600 dark:text-gray-300"
            />
        </div>
    </div>
</template>
