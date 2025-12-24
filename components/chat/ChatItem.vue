<script setup lang="ts">
import type { Chat } from '~/types/Chat'
import { formatShortTimestamp } from '~/utils/dateHelpers'
import ChatInitial from './ChatInitial.vue'

interface Props {
	chat: Chat
	isSelected: boolean
	typingUsers?: string[]
}

interface Emits {
	(e: 'select', chatId: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const chatData = computed(() => props.chat)
const selected = computed(() => props.isSelected)
const chatInitial = computed(() => (chatData.value.name ?? '').charAt(0) || '?')
const chatName = computed(() =>
	chatData.value.isGroup ? chatData.value.name : chatData.value.otherUser.username
)
const lastMessage = computed(() => chatData.value.lastMessage)
const lastMessageContent = computed(() => lastMessage.value?.content || '')
const typingUsers = computed(() => props.typingUsers ?? [])
const { typingText, hasTypingUsers } = useTypingText(typingUsers)
const displayMessage = computed(() => {
	if (hasTypingUsers.value && typingText.value) {
		return typingText.value
	}

	if (!lastMessageContent.value) {
		return 'No messages'
	}

	return lastMessageContent.value
})

const lastMessageTimestamp = computed(() => {
	if (!lastMessage.value?.createdAt) return ''
	return formatShortTimestamp(lastMessage.value.createdAt)
})
const hasUnread = computed(() => Number(chatData.value.unreadCount) > 0)
const isOnline = computed(() => {
	if (chatData.value.isGroup) {
		return chatData.value.hasOnlineMembers ?? false
	}
	return chatData.value.hasOnlineMembers ?? chatData.value.otherUser?.isOnline ?? false
})
const itemClasses = computed(() => {
	const base =
		'flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 focus-visible:bg-gray-100 dark:focus-visible:bg-gray-800 outline-none transition-colors cursor-pointer'
	return selected.value ? `${base} bg-gray-100 dark:bg-gray-800` : base
})
const ariaLabel = computed(() => `Open chat: ${chatName.value}`)

function handleClick() {
	emit('select', chatData.value.id)
}

function handleKeyDown(event: KeyboardEvent) {
	if (event.key !== 'Enter' && event.key !== ' ') return
	event.preventDefault()
	emit('select', chatData.value.id)
}
</script>

<template>
	<li class="cursor-pointer select-none border-none">
		<div
			tabindex="0"
			role="option"
			:aria-selected="selected"
			:aria-label="ariaLabel"
			:class="itemClasses"
			@click="handleClick"
			@keydown="handleKeyDown"
		>
			<ChatInitial :chat-initial="chatInitial" :is-online="isOnline" :chat-id="chatData.id" />
			<div class="min-w-0 flex-1 flex flex-col gap-1">
				<div class="flex items-center justify-between gap-2 min-w-0">
					<p
						class="font-medium text-sm text-gray-900 dark:text-gray-100 truncate min-w-0"
					>
						{{ chatName }}
					</p>
					<div class="flex items-center gap-2 flex-shrink-0">
						<p
							v-if="lastMessageTimestamp"
							class="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap"
						>
							{{ lastMessageTimestamp }}
						</p>
						<div
							v-if="hasUnread"
							class="size-2 bg-blue-500 rounded-full flex-shrink-0"
							aria-label="Unread messages"
						></div>
					</div>
				</div>
				<div
					v-if="hasTypingUsers"
					class="text-sm truncate min-w-0 flex items-center gap-1.5 text-blue-600 italic"
				>
					<div class="flex items-center gap-0.5 flex-shrink-0">
						<span
							class="w-1.5 h-1.5 bg-blue-600 rounded-full typing-dot"
							style="animation-delay: 0ms"
						></span>
						<span
							class="w-1.5 h-1.5 bg-blue-600 rounded-full typing-dot"
							style="animation-delay: 150ms"
						></span>
						<span
							class="w-1.5 h-1.5 bg-blue-600 rounded-full typing-dot"
							style="animation-delay: 300ms"
						></span>
					</div>
					<span class="truncate">{{ typingText }}</span>
				</div>
				<p v-else class="text-sm truncate min-w-0 text-gray-600 dark:text-gray-400">
					{{ displayMessage }}
				</p>
			</div>
		</div>
	</li>
</template>

<style scoped>
li {
	&:deep(.chat-item-action-menu) {
		display: none;
	}

	&:hover {
		&:deep(.chat-item-action-menu) {
			display: flex;
		}
	}
}
</style>
