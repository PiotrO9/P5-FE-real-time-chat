<script setup lang="ts">
import type { Chat } from '~/types/Chat'
import ChatItem from '../../common/chat/ChatItem.vue'

interface Props {
	chats: Chat[]
	selectedChatId: string | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
	(e: 'select-chat', chatId: number): void
}>()

const chatsList = computed(() => props.chats ?? [])
const selectedId = computed(() => props.selectedChatId ?? '')

function handleSelectChat(chatId: number) {
	emit('select-chat', chatId)
}

function isChatSelected(chatId: number) {
	return selectedId.value === chatId.toString()
}
</script>

<template>
	<div class="flex-1 overflow-y-auto bg-white">
		<ul class="divide-y divide-gray-100" role="listbox" aria-label="Lista czatów">
			<ChatItem
				v-for="chat in chatsList"
				:key="chat.id"
				:chat="chat"
				:is-selected="isChatSelected(chat.id)"
				@select="handleSelectChat"
			/>
		</ul>
	</div>
</template>
