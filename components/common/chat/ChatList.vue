<script setup lang="ts">
import type { Chat } from '~/types/Chat'
import ChatItem from '../../common/chat/ChatItem.vue'

interface Props {
	chats: Chat[]
	selectedChatId: string | null
	typingUsersByChat?: Record<string, string[]>
}

interface Emits {
	(e: 'select-chat', chatId: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const chatsList = computed(() => props.chats ?? [])
const selectedId = computed(() => props.selectedChatId ?? '')
const typingUsers = computed(() => props.typingUsersByChat ?? {})

function handleSelectChat(chatId: string) {
	emit('select-chat', chatId)
}

function isChatSelected(chatId: string) {
	return selectedId.value === String(chatId)
}

function getTypingUsers(chatId: string): string[] {
	return typingUsers.value[chatId] ?? []
}
</script>

<template>
	<div class="flex-1 overflow-y-auto bg-white rounded-b-[1.125rem] max-h-[calc(100vh-150px)]">
		<div v-if="chatsList.length === 0">
			<div class="p-8 text-center">
				<p class="text-gray-500 text-sm">You don't have any chats yet</p>
			</div>
		</div>
		<ul v-else class="divide-y divide-gray-100 p-2" role="listbox" aria-label="Chat list">
			<ChatItem
				v-for="chat in chatsList"
				:key="chat.id"
				:chat="chat"
				:is-selected="isChatSelected(chat.id)"
				:typing-users="getTypingUsers(chat.id)"
				@select="handleSelectChat"
			/>
		</ul>
	</div>
</template>
