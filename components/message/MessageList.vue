<script setup lang="ts">
import type { Message } from '~/types/Chat'
import MessageItem from '~/components/message/MessageItem.vue'
import SystemMessage from '~/components/message/SystemMessage.vue'

interface Props {
	messages: Message[]
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
</script>

<template>
	<template v-for="message in messagesList" :key="message.id">
		<SystemMessage v-if="message.isSystem" :message="message" />
		<MessageItem
			v-else
			:message="message"
			@delete="handleDeleteMessage"
			@reaction-updated="handleReactionUpdated"
			@pin-updated="handlePinUpdated"
		/>
	</template>
</template>
