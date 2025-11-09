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
	typingUsers?: string[]
}

const props = defineProps<Props>()

const selectedChat = computed(() => props.selectedChat)
const canLoadMore = computed(() => props.canLoadMore ?? false)
const isLoadingMore = computed(() => props.isLoadingMore ?? false)

const hasMessages = computed(() => (selectedChat.value?.messages.length ?? 0) > 0)
const chatName = computed(() => selectedChat.value?.name ?? 'Czat')
const messages = computed(() => selectedChat.value?.messages ?? [])

const typingText = computed(() => {
	if (!props.typingUsers || props.typingUsers.length === 0) return null

	if (props.typingUsers.length === 1) {
		return `${props.typingUsers[0]} pisze...`
	}
	if (props.typingUsers.length === 2) {
		return `${props.typingUsers[0]} i ${props.typingUsers[1]} piszą...`
	}
	return `${props.typingUsers[0]} i ${props.typingUsers.length - 1} innych piszą...`
})

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

		<!-- Wskaźnik pisania - na dole, poza kontenerem scrollującym -->
		<div v-if="typingText" class="px-4 md:px-6 py-2 bg-gray-50 border-t border-gray-200">
			<div class="flex items-center gap-3">
				<!-- Bąbelek wiadomości z animacją -->
				<div
					class="inline-flex items-center gap-1.5 bg-white rounded-2xl rounded-tl-sm px-4 py-2.5 shadow-sm border border-gray-200"
				>
					<!-- Animowane kropki w stylu Messengera -->
					<div class="flex items-center gap-1 px-1">
						<span
							class="w-1.5 h-1.5 bg-gray-500 rounded-full typing-dot"
							style="animation-delay: 0ms"
						></span>
						<span
							class="w-1.5 h-1.5 bg-gray-500 rounded-full typing-dot"
							style="animation-delay: 150ms"
						></span>
						<span
							class="w-1.5 h-1.5 bg-gray-500 rounded-full typing-dot"
							style="animation-delay: 300ms"
						></span>
					</div>
					<span class="text-sm text-gray-600 font-medium">{{ typingText }}</span>
				</div>
			</div>
		</div>
	</section>

	<section v-else class="md:hidden flex-1 flex flex-col">
		<div class="flex-1 flex items-center justify-center text-gray-500">
			Wybierz czat z listy po lewej
		</div>
	</section>
</template>
