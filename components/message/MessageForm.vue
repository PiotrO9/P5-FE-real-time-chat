<script setup lang="ts">
interface Props {
	modelValue: string
}

interface Emits {
	(e: 'update:modelValue', value: string): void
	(e: 'submit' | 'typing'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

function handleInput(event: Event) {
	const target = event.target as HTMLTextAreaElement | null
	if (!target) return
	emit('update:modelValue', target.value)
	emit('typing')
}

function handleKeyDown(event: KeyboardEvent) {
	if (event.key !== 'Enter') return

	const isShift = event.shiftKey

	if (isShift) return

	event.preventDefault()
	handleSubmit()
}

function handleSubmit() {
	emit('submit')
}
</script>

<template>
	<form
		class="border-t border-gray-200 md:px-3 py-3 flex items-end gap-3 bg-white rounded-b-[1.125rem]"
		@submit.prevent="handleSubmit"
	>
		<label for="message" class="sr-only">Message</label>
		<textarea
			id="message"
			:aria-label="'Message'"
			:tabindex="0"
			:rows="1"
			:placeholder="'Type a message...'"
			:value="props.modelValue"
			@input="handleInput"
			@keydown="handleKeyDown"
		></textarea>
		<button
			type="submit"
			class="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
			aria-label="Send message"
		>
			Send
		</button>
	</form>
</template>
