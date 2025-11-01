<script setup lang="ts">
import type { Message } from '~/types/Chat'
import MessageItem from '../../common/message/MessageItem.vue'

interface Props {
	messages: Message[]
}

interface Emits {
	(e: 'delete-message', messageId: string | number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const messagesList = computed(() => props.messages)

function handleDeleteMessage(messageId: string | number) {
	emit('delete-message', messageId)
}
</script>

<template>
	<MessageItem
		v-for="message in messagesList"
		:key="message.id"
		:message="message"
		@delete="handleDeleteMessage"
	/>
</template>
