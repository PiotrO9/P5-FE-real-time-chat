<script setup lang="ts">
import type { Chat } from '~/types/Chat'
import ChatHeader from '../../common/chat/ChatHeader.vue'
import MessageList from '../../common/message/MessageList.vue'
import LoadMoreButton from '../../common/LoadMoreButton.vue'
import EmptyState from '../../common/EmptyState.vue'
import Typing from '../Typing.vue'

interface Props {
	selectedChat: Chat | null
	canLoadMore?: boolean
	isLoadingMore?: boolean
	typingUsers?: string[]
}

interface Emits {
	(e: 'load-more' | 'toggle-actions'): void
	(e: 'delete-message', messageId: string | number): void
	(
		e: 'reaction-updated',
		messageId: string | number,
		emoji: string,
		action: 'add' | 'remove'
	): void
}

const chatStore = useChatStore()

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const messagesContainerRef = ref<HTMLDivElement | null>(null)

const selectedChat = computed(() => props.selectedChat)
const canLoadMore = computed(() => props.canLoadMore ?? false)
const isLoadingMore = computed(() => props.isLoadingMore ?? false)
const hasMessages = computed(() => (selectedChat.value?.messages.length ?? 0) > 0)
const messages = computed(() => selectedChat.value?.messages ?? [])
const typingText = computed(() => {
	if (!props.typingUsers || props.typingUsers.length === 0) return null

	if (props.typingUsers.length === 1) {
		return `${props.typingUsers[0]} is typing...`
	}
	if (props.typingUsers.length === 2) {
		return `${props.typingUsers[0]} and ${props.typingUsers[1]} are typing...`
	}
	return `${props.typingUsers[0]} and ${props.typingUsers.length - 1} others are typing...`
})

watch(
	() => selectedChat,
	() => {
		chatStore.closeChatDetails()
	},
	{ deep: true }
)

function scrollToBottom() {
	const el = messagesContainerRef.value
	if (!el) return
	el.scrollTop = el.scrollHeight
}

function handleToggleActions() {
	emit('toggle-actions')
}

function handleLoadMore() {
	emit('load-more')
}

function handleDeleteMessage(messageId: string | number) {
	emit('delete-message', messageId)
}

function handleReactionUpdated(
	messageId: string | number,
	emoji: string,
	action: 'add' | 'remove'
) {
	emit('reaction-updated', messageId, emoji, action)
}

defineExpose({ scrollToBottom })
</script>

<template>
	<section v-if="selectedChat" class="hidden md:flex flex-1 flex-col min-h-0 h-full">
		<ChatHeader :selected-chat />

		<div
			ref="messagesContainerRef"
			class="flex-1 overflow-y-auto overflow-x-hidden px-4 md:px-6 py-4 space-y-4 bg-white min-h-0"
		>
			<LoadMoreButton
				v-if="canLoadMore"
				:is-loading="isLoadingMore"
				@load-more="handleLoadMore"
			/>

			<EmptyState v-if="!hasMessages" />

			<MessageList
				v-else
				:messages="messages"
				@delete-message="handleDeleteMessage"
				@reaction-updated="handleReactionUpdated"
			/>
		</div>

		<Typing v-if="typingText" :typing-text />
	</section>

	<section v-else class="md:hidden flex-1 flex flex-col">
		<div class="flex-1 flex items-center justify-center text-gray-500">
			Select a chat from the list on the left
		</div>
	</section>
</template>
