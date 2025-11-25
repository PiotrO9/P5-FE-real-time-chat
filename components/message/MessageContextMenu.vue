<script setup lang="ts">
interface Props {
	isOwnMessage: boolean
	isPinned: boolean
	isDeleted?: boolean
	position: 'left' | 'right'
}

interface Emits {
	(e: 'delete'): void
	(e: 'pin'): void
	(e: 'forward'): void
	(e: 'mouseenter'): void
	(e: 'mouseleave'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

function handleKeyDown(event: KeyboardEvent, action: 'delete' | 'pin' | 'forward') {
	if (event.key === 'Enter' || event.key === ' ') {
		event.preventDefault()
		if (action === 'delete') {
			emit('delete')
		} else if (action === 'pin') {
			emit('pin')
		} else if (action === 'forward') {
			emit('forward')
		}
	}
}
</script>

<template>
	<div
		class="absolute bottom-full mb-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50 min-w-40 overflow-hidden"
		:class="position === 'left' ? 'left-0' : 'right-0'"
		@mouseenter="emit('mouseenter')"
		@mouseleave="emit('mouseleave')"
	>
		<button
			v-if="isOwnMessage"
			type="button"
			tabindex="0"
			aria-label="Usuń wiadomość"
			:disabled="isDeleted"
			class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
			@mousedown.stop.prevent
			@click.stop.prevent="!isDeleted && emit('delete')"
			@keydown="(e) => !isDeleted && handleKeyDown(e, 'delete')"
		>
			Usuń
		</button>
		<button
			type="button"
			tabindex="0"
			:aria-label="isPinned ? 'Odepnij wiadomość' : 'Przypnij wiadomość'"
			:disabled="isDeleted"
			class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
			@mousedown.stop.prevent
			@click.stop.prevent="!isDeleted && emit('pin')"
			@keydown="(e) => !isDeleted && handleKeyDown(e, 'pin')"
		>
			{{ isPinned ? 'Odepnij' : 'Przypnij' }}
		</button>
		<button
			type="button"
			tabindex="0"
			aria-label="Przekaż wiadomość"
			:disabled="isDeleted"
			class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
			@mousedown.stop.prevent
			@click.stop.prevent="!isDeleted && emit('forward')"
			@keydown="(e) => !isDeleted && handleKeyDown(e, 'forward')"
		>
			Przekaż
		</button>
	</div>
</template>
