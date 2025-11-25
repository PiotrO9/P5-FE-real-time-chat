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
	<div class="p-4 bg-white backdrop-blur">
		<div class="flex items-center justify-between mb-2">
			<h2 class="text-lg font-semibold text-gray-900">Chat actions</h2>
			<button
				type="button"
				tabindex="0"
				aria-label="Close actions panel"
				class="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
				@click="handleToggleState"
				@keydown="handleKeyDown"
			>
				<Icon name="remove" class="size-5 text-gray-600" />
			</button>
		</div>
		<p class="text-sm text-gray-600">
			{{ isGroupChat ? (isOwner ? 'Manage chat members' : 'Chat members') : 'Chat details' }}
		</p>
	</div>
</template>
