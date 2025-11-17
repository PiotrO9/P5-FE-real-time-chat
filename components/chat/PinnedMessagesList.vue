<script setup lang="ts">
import type { Message } from '~/types/Chat'

interface Props {
	pinnedMessages: Message[]
	isLoading: boolean
}

interface Emits {
	(e: 'message-click', messageId: string | number): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

function handlePinnedMessageClick(messageId: string | number) {
	emit('message-click', messageId)
}

function formatMessageTime(createdAt: string): string {
	return new Date(createdAt).toLocaleTimeString([], {
		hour: '2-digit',
		minute: '2-digit'
	})
}

function truncateMessage(content: string, maxLength: number = 50): string {
	if (content.length <= maxLength) return content

	return content.substring(0, maxLength) + '...'
}
</script>

<template>
	<div class="p-4 border-b border-gray-200">
		<h3 class="text-sm font-semibold text-gray-900 mb-3">
			Pinned messages ({{ pinnedMessages.length }})
		</h3>
		<div v-if="isLoading" class="text-sm text-gray-600">Loading...</div>
		<div v-else-if="pinnedMessages.length === 0" class="text-sm text-gray-500">
			No pinned messages
		</div>
		<div v-else class="space-y-2 max-h-96 overflow-y-auto">
			<button
				v-for="pinnedMessage in pinnedMessages"
				:key="pinnedMessage.id"
				type="button"
				tabindex="0"
				:aria-label="`Go to message from ${pinnedMessage.senderUsername}`"
				class="w-full text-left px-3 py-2.5 text-xs rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
				@click="handlePinnedMessageClick(pinnedMessage.id)"
				@keydown.enter="handlePinnedMessageClick(pinnedMessage.id)"
			>
				<div class="flex items-start justify-between gap-2">
					<div class="flex-1 min-w-0">
						<div class="flex items-center gap-2 mb-1">
							<p class="font-medium text-gray-900">
								{{ pinnedMessage.senderUsername }}
							</p>
							<span v-if="pinnedMessage.pinnedBy" class="text-gray-400 text-[10px]">
								pinned by {{ pinnedMessage.pinnedBy.username }}
							</span>
						</div>
						<p class="text-gray-600 line-clamp-2 mb-1">
							{{ truncateMessage(pinnedMessage.content) }}
						</p>
						<div class="flex items-center gap-2 text-gray-400">
							<p class="text-[10px]">
								{{ formatMessageTime(pinnedMessage.createdAt) }}
							</p>
							<span v-if="pinnedMessage.pinnedAt" class="text-[10px]">
								• pinned
								{{ formatMessageTime(pinnedMessage.pinnedAt) }}
							</span>
						</div>
					</div>
					<span class="text-xs flex-shrink-0">📌</span>
				</div>
			</button>
		</div>
	</div>
</template>
