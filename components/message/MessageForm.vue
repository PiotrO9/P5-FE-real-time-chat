<script setup lang="ts">
import type { Message } from '~/types/Chat'
import { nextTick } from 'vue'

interface Props {
	modelValue: string
	replyTo?: Message | null
}

interface Emits {
	(e: 'update:modelValue', value: string): void
	(e: 'submit' | 'typing'): void
	(e: 'cancel-reply'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const textareaRef = ref<HTMLTextAreaElement | null>(null)
const hasReplyTo = computed(() => !!props.replyTo)

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

function handleCancelReply() {
	emit('cancel-reply')
}

function focusTextarea() {
	nextTick(() => {
		if (textareaRef.value) {
			textareaRef.value.focus()
		}
	})
}

watch(
	() => props.replyTo,
	(newValue, oldValue) => {
		if (newValue && !oldValue) {
			focusTextarea()
		}
	}
)
</script>

<template>
	<div class="border-t border-gray-200 bg-white rounded-b-[1.125rem]">
		<div
			v-if="hasReplyTo && replyTo"
			class="px-3 pt-3 pb-2 flex items-start justify-between gap-2 bg-gray-50 border-b border-gray-200"
		>
			<div class="flex-1 min-w-0">
				<div class="flex items-center gap-2 mb-1">
					<span class="text-xs font-medium text-gray-700">Odpowiedź na:</span>
					<span class="text-xs font-semibold text-blue-600">
						{{ replyTo.senderUsername }}
					</span>
				</div>
				<p class="text-xs text-gray-600 truncate">
					{{ replyTo.content }}
				</p>
			</div>
			<button
				type="button"
				tabindex="0"
				aria-label="Anuluj odpowiedź"
				class="flex-shrink-0 h-6 w-6 rounded-full hover:bg-gray-200 flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
				@click="handleCancelReply"
				@keydown="(e) => (e.key === 'Enter' || e.key === ' ') && handleCancelReply()"
			>
				<Icon name="remove" class="h-4 w-4 text-gray-600" />
			</button>
		</div>
		<form
			class="px-3 md:px-3 py-3 flex items-end gap-2 md:gap-3"
			@submit.prevent="handleSubmit"
		>
			<label for="message" class="sr-only">Message</label>
			<textarea
				id="message"
				ref="textareaRef"
				:aria-label="'Message'"
				:tabindex="0"
				:rows="1"
				:placeholder="hasReplyTo ? 'Napisz odpowiedź...' : 'Type a message...'"
				:value="props.modelValue"
				class="flex-1 min-w-0 text-sm md:text-base resize-none border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
				@input="handleInput"
				@keydown="handleKeyDown"
			></textarea>
			<button
				type="submit"
				class="inline-flex items-center justify-center px-3 md:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm md:text-base font-medium rounded-lg transition-colors flex-shrink-0"
				aria-label="Send message"
			>
				<span class="hidden sm:inline">Send</span>
				<span class="sm:hidden">→</span>
			</button>
		</form>
	</div>
</template>
