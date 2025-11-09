<script setup lang="ts">
interface Props {
	modelValue: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
	(e: 'update:modelValue', value: string): void
	(e: 'submit'): void
	(e: 'typing'): void
}>()

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
		class="border-t border-gray-200 md:px-3 py-3 flex items-end gap-3 bg-white"
		@submit.prevent="handleSubmit"
	>
		<label for="message" class="sr-only">Wiadomość</label>
		<textarea
			id="message"
			:aria-label="'Wiadomość'"
			:tabindex="0"
			:rows="1"
			:placeholder="'Napisz wiadomość...'"
			class="flex-1 resize-none px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
			:value="props.modelValue"
			@input="handleInput"
			@keydown="handleKeyDown"
		></textarea>
		<button
			type="submit"
			class="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
			aria-label="Wyślij wiadomość"
		>
			Wyślij
		</button>
	</form>
</template>
