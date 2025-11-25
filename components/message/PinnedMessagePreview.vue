<script setup lang="ts">
import type { Message } from '~/types/Chat'

interface Props {
	message: Message | null
}

interface Emits {
	(e: 'click'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const message = computed(() => props.message)
const hasMessage = computed(() => message.value !== null)
const { formatMessageTime, truncateMessage } = useMessageHelpers()

function handleClick() {
	if (!hasMessage.value) return
	emit('click')
}

function handleKeyDown(event: KeyboardEvent) {
	if (event.key === 'Enter' || event.key === ' ') {
		event.preventDefault()
		handleClick()
	}
}
</script>

<template>
	<button
		v-if="hasMessage"
		type="button"
		tabindex="0"
		aria-label="Open pinned messages"
		class="w-full px-4 py-3 bg-yellow-50 dark:bg-yellow-900/40 border-l-4 border-yellow-400 dark:border-yellow-500 hover:bg-yellow-100 dark:hover:bg-yellow-900/60 transition-colors text-left"
		@click="handleClick"
		@keydown="handleKeyDown"
	>
		<div class="flex items-center gap-3">
			<Icon name="pin" class="size-5 flex-shrink-0" />
			<div class="flex-1 min-w-0">
				<div class="flex items-center gap-2 mb-1">
					<p class="text-xs font-semibold text-yellow-900 dark:text-yellow-200">
						{{ message?.senderUsername }}
					</p>
					<span class="text-xs text-yellow-700 dark:text-yellow-300">•</span>
					<p class="text-xs text-yellow-700 dark:text-yellow-300">
						{{ formatMessageTime(message?.createdAt || '') }}
					</p>
				</div>
				<p class="text-sm text-yellow-900 dark:text-yellow-100 line-clamp-2">
					{{ truncateMessage(message?.content || '') }}
				</p>
			</div>
		</div>
	</button>
</template>
