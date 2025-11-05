<script setup lang="ts">
import type { Chat } from '~/types/Chat'
import ChatHeader from '../../common/chat/ChatHeader.vue'
import MessageList from '../../common/message/MessageList.vue'
import LoadMoreButton from '../../common/LoadMoreButton.vue'
import EmptyState from '../../common/EmptyState.vue'

interface Props {
	selectedChat: Chat | null
	canLoadMore?: boolean
	isLoadingMore?: boolean
}

const props = defineProps<Props>()

const selectedChat = computed(() => props.selectedChat)
const canLoadMore = computed(() => props.canLoadMore ?? false)
const isLoadingMore = computed(() => props.isLoadingMore ?? false)

const hasMessages = computed(() => (selectedChat.value?.messages.length ?? 0) > 0)
const chatName = computed(() => selectedChat.value?.name ?? 'Czat')
const messages = computed(() => selectedChat.value?.messages ?? [])

const messagesContainerRef = ref<HTMLDivElement | null>(null)

function scrollToBottom() {
	const el = messagesContainerRef.value
	if (!el) return
	el.scrollTop = el.scrollHeight
}

interface Emits {
	(e: 'load-more'): void
	(e: 'delete-message', messageId: string | number): void
	(
		e: 'reaction-updated',
		messageId: string | number,
		emoji: string,
		action: 'add' | 'remove'
	): void
}

const emit = defineEmits<Emits>()

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
	<section v-if="selectedChat" class="hidden md:flex flex-1 flex-col min-h-0">
		<ChatHeader :chat-name="chatName" />

		<div
			ref="messagesContainerRef"
			class="flex-1 overflow-y-auto overflow-x-hidden px-4 md:px-6 py-4 space-y-4 bg-gray-50 min-h-0"
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
	</section>

	<section v-else class="md:hidden flex-1 flex flex-col">
		<div class="flex-1 flex items-center justify-center text-gray-500">
			Wybierz czat z listy po lewej
		</div>
	</section>
</template>
