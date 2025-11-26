<script setup lang="ts">
import type { Message } from '~/types/Chat'
import { formatDate } from '~/utils/dateHelpers'

interface Props {
	messages: Message[]
	isLoading: boolean
	hasMore: boolean
	total: number
	query?: string
}

interface Emits {
	(e: 'message-click', messageId: string | number): void
	(e: 'load-more'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

function handleMessageClick(messageId: string | number) {
	emit('message-click', messageId)
}

function handleKeyDown(event: KeyboardEvent, messageId: string | number) {
	if (event.key === 'Enter' || event.key === ' ') {
		event.preventDefault()
		handleMessageClick(messageId)
	}
}

function handleLoadMore() {
	emit('load-more')
}

function handleLoadMoreKeyDown(event: KeyboardEvent) {
	if (event.key === 'Enter' || event.key === ' ') {
		event.preventDefault()
		handleLoadMore()
	}
}

function highlightText(text: string, query: string): string {
	if (!query.trim()) return text
	const regex = new RegExp(`(${query})`, 'gi')
	return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-600/50">$1</mark>')
}
</script>

<template>
	<div class="flex flex-col">
		<div v-if="isLoading" class="p-4 text-sm text-gray-600 dark:text-gray-400 text-center">
			Searching...
		</div>
		<div
			v-else-if="messages.length === 0"
			class="p-4 text-sm text-gray-500 dark:text-gray-400 text-center"
		>
			No results
		</div>
		<div v-else class="flex flex-col">
			<div
				class="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700"
			>
				Found {{ total }} {{ total === 1 ? 'message' : 'messages' }}
			</div>
			<div class="max-h-96 overflow-y-auto">
				<ul
					class="divide-y divide-gray-100 dark:divide-gray-800"
					role="listbox"
					aria-label="Search results"
				>
					<li
						v-for="message in messages"
						:key="message.id"
						class="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
						tabindex="0"
						role="option"
						:aria-label="`Message from ${message.senderUsername}`"
						@click="handleMessageClick(message.id)"
						@keydown="handleKeyDown($event, message.id)"
					>
						<div class="flex flex-col gap-1">
							<div class="flex items-center justify-between">
								<span class="text-xs font-medium text-gray-700 dark:text-gray-300">
									{{ message.senderUsername }}
								</span>
								<span class="text-xs text-gray-500 dark:text-gray-400">
									{{ formatDate(message.createdAt) }}
								</span>
							</div>
							<p
								class="text-sm text-gray-900 dark:text-gray-100 line-clamp-2"
								v-html="highlightText(message.content, props.query || '')"
							></p>
						</div>
					</li>
				</ul>
			</div>
			<button
				v-if="hasMore"
				type="button"
				class="px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-t border-gray-200 dark:border-gray-700"
				tabindex="0"
				aria-label="Load more results"
				@click="handleLoadMore"
				@keydown="handleLoadMoreKeyDown"
			>
				Load more
			</button>
		</div>
	</div>
</template>
