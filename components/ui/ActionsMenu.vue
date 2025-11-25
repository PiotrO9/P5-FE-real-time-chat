<script setup lang="ts">
interface Props {
	classes?: string
}

const { classes = '' } = defineProps<Props>()

const isOpen = ref(false)

function handleToggleState() {
	isOpen.value = !isOpen.value
}
</script>

<template>
	<div
		:class="[
			classes,
			'flex rounded-full size-8 border-gray-400 dark:border-gray-600 border-solid border-2 items-center justify-center bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer'
		]"
		@click="handleToggleState"
	>
		<div class="flex items-center gap-1">
			<Icon name="context-menu-dots" class="text-gray-600 dark:text-gray-300" />
		</div>
	</div>
</template>
