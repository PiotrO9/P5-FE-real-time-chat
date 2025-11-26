<script setup lang="ts">
interface Props {
	isGroupChat: boolean
	isOwner: boolean
}

interface Emits {
	(e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

function handleToggleState() {
	emit('close')
}

function handleKeyDown(event: KeyboardEvent) {
	if (event.key === 'Enter' || event.key === ' ') {
		event.preventDefault()
		handleToggleState()
	}
}
</script>

<template>
	<div class="p-4 bg-white dark:bg-gray-900 backdrop-blur border-b dark:border-gray-700">
		<div class="flex items-center justify-between">
			<h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Chat actions</h2>
			<button
				type="button"
				tabindex="0"
				aria-label="Close actions panel"
				class="p-2 size-8 rounded-full bg-gray-100 dark:bg-gray-700 transition-colors flex items-center justify-center"
				@click="handleToggleState"
				@keydown="handleKeyDown"
			>
				<Icon name="remove" class="size-4 text-gray-600 dark:text-gray-300" />
			</button>
		</div>
	</div>
</template>
