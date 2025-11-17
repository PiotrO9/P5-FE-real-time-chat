<script setup lang="ts">
import type { Message } from '~/types/Chat'
import { compareIds } from '~/utils/idHelpers'
import MessageItem from '~/components/message/MessageItem.vue'
import SystemMessage from '~/components/message/SystemMessage.vue'

interface Props {
	messages: Message[]
	highlightedMessageId?: string | number | null
}

interface Emits {
	(e: 'delete-message', messageId: string | number): void
	(
		e: 'reaction-updated',
		messageId: string | number,
		emoji: string,
		action: 'add' | 'remove'
	): void
	(e: 'pin-updated', messageId: string | number, isPinned: boolean): void
	(e: 'reply', message: Message): void
	(e: 'scroll-to-message', messageId: string | number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const messagesList = computed(() => props.messages)

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

function handlePinUpdated(messageId: string | number, isPinned: boolean) {
	emit('pin-updated', messageId, isPinned)
}

function handleReply(message: Message) {
	emit('reply', message)
}

function handleScrollToMessage(messageId: string | number) {
	emit('scroll-to-message', messageId)
}
</script>

<template>
	<template v-for="message in messagesList" :key="message.id">
		<SystemMessage v-if="message.isSystem" :message="message" />
		<MessageItem
			v-else
			:message="message"
			:messages="messagesList"
			:highlighted="
				props.highlightedMessageId !== null &&
				compareIds(message.id, props.highlightedMessageId)
			"
			@delete="handleDeleteMessage"
			@reaction-updated="handleReactionUpdated"
			@pin-updated="handlePinUpdated"
			@reply="handleReply"
			@scroll-to-message="handleScrollToMessage"
		/>
	</template>
</template>
