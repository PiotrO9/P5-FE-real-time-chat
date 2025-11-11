<script setup lang="ts">
import type { Chat } from '~/types/Chat'
import UnreadMessages from './UnreadMessages.vue'
import ChatInitial from './ChatInitial.vue'
import ActionsMenu from '../ActionsMenu.vue'

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
const lastMessage = computed(() => chatData.value.lastMessage?.content || '')
const unreadCount = computed(() => Number(chatData.value.unreadCount))
const typingUsers = computed(() => props.typingUsers ?? [])
const hasTypingUsers = computed(() => typingUsers.value.length > 0)
const typingText = computed(() => {
	if (!hasTypingUsers.value) return null

	if (typingUsers.value.length === 1) {
		return `${typingUsers.value[0]} is typing...`
	}
	if (typingUsers.value.length === 2) {
		return `${typingUsers.value[0]} and ${typingUsers.value[1]} are typing...`
	}
	return `${typingUsers.value[0]} and ${typingUsers.value.length - 1} others are typing...`
})
const displayMessage = computed(() => {
	if (hasTypingUsers.value && typingText.value) {
		return typingText.value
	}
	return lastMessage.value || 'No messages'
})
const hasUnread = computed(() => Number(chatData.value.unreadCount) > 0)
const itemClasses = computed(() => {
	const base =
		'flex items-center gap-3 px-4 py-3 hover:bg-slate-50 focus-visible:bg-slate-50 outline-none rounded-[0.625rem]'
	return selected.value ? `${base} bg-blue-50` : base
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
			<ChatInitial :chat-initial />
			<div class="min-w-0 flex-1 flex flex-col">
				<div class="flex items-center justify-between gap-2 min-w-0">
					<p class="font-medium text-slate-900 truncate min-w-0">
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
				<p v-else :class="['text-sm truncate min-w-0 text-slate-600']">
					{{ displayMessage }}
				</p>
			</div>
			<ActionsMenu classes="chat-item-action-menu" />
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
