<script setup lang="ts">
import type { Chat } from '~/types/Chat'
import ActionsMenu from '../ActionsMenu.vue'
import ChatInitial from './ChatInitial.vue'

interface Props {
	selectedChat: Chat | null
}

const chatStore = useChatStore()

const { selectedChat } = defineProps<Props>()

const isGroup = computed(() => selectedChat?.isGroup)
const chatInitial = computed(() => {
	return isGroup.value
		? (selectedChat?.name[0]?.toUpperCase() ?? '?')
		: (selectedChat?.otherUser.username[0]?.toUpperCase() ?? '?')
})
const displayName = computed(() => selectedChat?.name ?? 'Czat')

function handleToggleActions() {
	if (!selectedChat) return

	chatStore.openChatDetails(selectedChat)
}
</script>

<template>
	<div
		class="border-b rounded-t-[1.125rem] border-gray-200 px-6 py-4 flex items-center justify-between bg-white backdrop-blur supports-[backdrop-filter]:bg-white"
	>
		<div class="flex items-center gap-3">
			<ChatInitial :chat-initial />
			<h2 class="text-lg font-semibold text-gray-900">
				{{ displayName }}
			</h2>
		</div>
		<ActionsMenu
			v-if="isGroup"
			@click="handleToggleActions"
			@keydown.enter="handleToggleActions"
			@keydown.space.prevent="handleToggleActions"
		/>
	</div>
</template>
