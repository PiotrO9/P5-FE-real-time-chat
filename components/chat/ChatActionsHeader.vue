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
	<div class="p-4 bg-white dark:bg-gray-800 backdrop-blur">
		<div class="flex items-center justify-between mb-2">
			<h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Chat actions</h2>
			<button
				type="button"
				tabindex="0"
				aria-label="Close actions panel"
				class="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
				@click="handleToggleState"
				@keydown="handleKeyDown"
			>
				<Icon name="remove" class="size-5 text-gray-600 dark:text-gray-400" />
			</button>
		</div>
		<p class="text-sm text-gray-600 dark:text-gray-400">
			{{ isGroupChat ? (isOwner ? 'Manage chat members' : 'Chat members') : 'Chat details' }}
		</p>
	</div>
</template>
