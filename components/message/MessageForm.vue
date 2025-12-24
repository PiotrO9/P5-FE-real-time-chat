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
	<div class="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
		<div
			v-if="hasReplyTo && replyTo"
			class="px-3 pt-3 pb-2 flex items-start justify-between gap-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700"
		>
			<div class="flex-1 min-w-0">
				<div class="flex items-center gap-2 mb-1">
					<span class="text-xs font-medium text-gray-700 dark:text-gray-300"
						>Reply to:</span
					>
					<span class="text-xs font-semibold text-blue-600 dark:text-blue-400">
						{{ replyTo.senderUsername }}
					</span>
				</div>
				<p class="text-xs text-gray-600 dark:text-gray-400 truncate">
					{{ replyTo.content }}
				</p>
			</div>
			<button
				type="button"
				tabindex="0"
				aria-label="Cancel reply"
				class="flex-shrink-0 size-6 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
				@click="handleCancelReply"
				@keydown="(e) => (e.key === 'Enter' || e.key === ' ') && handleCancelReply()"
			>
				<Icon name="remove" class="size-4 text-gray-600 dark:text-gray-400" />
			</button>
		</div>
		<form class="p-4 flex items-end gap-2" @submit.prevent="handleSubmit">
			<label for="message" class="sr-only">Message</label>
			<textarea
				id="message"
				ref="textareaRef"
				:aria-label="'Message'"
				:tabindex="0"
				:rows="1"
				:placeholder="hasReplyTo ? 'Write a reply...' : 'Type your message...'"
				:value="props.modelValue"
				class="flex-1 min-w-0 text-sm resize-none border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
				@input="handleInput"
				@keydown="handleKeyDown"
			></textarea>
			<button
				type="submit"
				class="flex-shrink-0 size-10 rounded-lg flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-1"
				aria-label="Send message"
			>
				<svg class="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
					/>
				</svg>
			</button>
		</form>
	</div>
</template>
