<script setup lang="ts">
import type { Chat } from '~/types/Chat'
import UnreadMessages from './UnreadMessages.vue'
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

const { user } = useAuth()

const chatData = computed(() => props.chat)
const selected = computed(() => props.isSelected)
const chatInitial = computed(() => (chatData.value.name ?? '').charAt(0) || '?')
const chatName = computed(() =>
	chatData.value.isGroup ? chatData.value.name : chatData.value.otherUser.username
)
const lastMessage = computed(() => chatData.value.lastMessage)
const lastMessageContent = computed(() => lastMessage.value?.content || '')
const unreadCount = computed(() => Number(chatData.value.unreadCount))
const typingUsers = computed(() => props.typingUsers ?? [])
const { typingText, hasTypingUsers } = useTypingText(typingUsers)
const senderName = computed(() => {
	if (!lastMessage.value) return null

	const currentUserId = user.value?.id ?? 0
	const isOwnMessage = String(lastMessage.value?.senderId) === String(currentUserId)
	return isOwnMessage ? 'You' : lastMessage.value?.senderUsername || 'Unknown'
})
const displayMessage = computed(() => {
	if (hasTypingUsers.value && typingText.value) {
		return typingText.value
	}

	if (!lastMessageContent.value) {
		return 'No messages'
	}

	return lastMessageContent.value
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
		'flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-gray-800 focus-visible:bg-slate-50 dark:focus-visible:bg-gray-800 outline-none transition-colors'
	return selected.value ? `${base} bg-green-50 dark:bg-green-900/20` : base
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
			<ChatInitial :chat-initial="chatInitial" :is-online="isOnline" />
			<div class="min-w-0 flex-1 flex flex-col">
				<div class="flex items-center justify-between gap-2 min-w-0">
					<p
						class="font-medium text-sm md:text-base text-slate-900 dark:text-gray-100 truncate min-w-0"
					>
						{{ chatName }}
					</p>
				</div>
				<div
					v-if="hasTypingUsers"
					:class="[
						'text-sm truncate min-w-0 flex items-center gap-1.5 text-blue-600 italic'
					]"
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
				<p
					v-else
					:class="[
						'text-xs md:text-sm truncate min-w-0 text-slate-600 dark:text-gray-400'
					]"
				>
					<span v-if="senderName" class="font-semibold">{{ senderName }}</span
					><span v-if="senderName">: </span>{{ displayMessage }}
				</p>
			</div>
			<UnreadMessages :unread-count :has-unread variant="simple" />
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
