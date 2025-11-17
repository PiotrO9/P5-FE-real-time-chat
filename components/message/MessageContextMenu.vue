<script setup lang="ts">
interface Props {
	isOwnMessage: boolean
	isPinned: boolean
	position: 'left' | 'right'
}

interface Emits {
	(e: 'delete'): void
	(e: 'pin'): void
	(e: 'mouseenter'): void
	(e: 'mouseleave'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

function handleKeyDown(event: KeyboardEvent, action: 'delete' | 'pin') {
	if (event.key === 'Enter' || event.key === ' ') {
		event.preventDefault()
		if (action === 'delete') {
			emit('delete')
		} else if (action === 'pin') {
			emit('pin')
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
			class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset"
			@click.stop="emit('delete')"
			@keydown="(e) => handleKeyDown(e, 'delete')"
		>
			Usuń
		</button>
		<button
			type="button"
			tabindex="0"
			:aria-label="isPinned ? 'Odepnij wiadomość' : 'Przypnij wiadomość'"
			class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset"
			@click.stop="emit('pin')"
			@keydown="(e) => handleKeyDown(e, 'pin')"
		>
			{{ isPinned ? 'Odepnij' : 'Przypnij' }}
		</button>
	</div>
</template>
