<script setup lang="ts">
import type { Chat } from '~/types/Chat'
import ChatInitial from './ChatInitial.vue'

interface Props {
	selectedChat: Chat | null
}

interface Emits {
	(e: 'toggle-actions' | 'back'): void
}

const chatStore = useChatStore()

const { selectedChat } = defineProps<Props>()
const emit = defineEmits<Emits>()

const isGroup = computed(() => selectedChat?.isGroup)
const chatInitial = computed(() => {
	return isGroup.value
		? (selectedChat?.name[0]?.toUpperCase() ?? '?')
		: (selectedChat?.otherUser.username[0]?.toUpperCase() ?? '?')
})
const displayName = computed(() => selectedChat?.name ?? 'Czat')

function handleToggleActions() {
	if (!selectedChat) return

	const isCurrentlyOpen = chatStore.currentChatDetails?.id === selectedChat.id
	if (isCurrentlyOpen) {
		chatStore.closeChatDetails()
	} else {
		chatStore.openChatDetails(selectedChat)
	}
	emit('toggle-actions')
}

function handleBack() {
	emit('back')
}

function handleBackKeyDown(event: KeyboardEvent) {
	if (event.key === 'Enter' || event.key === ' ') {
		event.preventDefault()
		handleBack()
	}
}
</script>

<template>
	<div
		class="border-b rounded-t-[1.125rem] border-gray-200 px-3 md:px-6 py-4 flex items-center justify-between bg-white backdrop-blur supports-[backdrop-filter]:bg-white"
	>
		<div class="flex items-center gap-3 min-w-0 flex-1">
			<button
				type="button"
				tabindex="0"
				aria-label="Wróć do listy chatów"
				class="md:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
				@click="handleBack"
				@keydown="handleBackKeyDown"
			>
				<Icon name="arrow-left" class="h-5 w-5 text-gray-600" />
			</button>
			<ChatInitial :chat-initial />
			<h2 class="text-base md:text-lg font-semibold text-gray-900 truncate min-w-0">
				{{ displayName }}
			</h2>
		</div>
		<ActionsMenu
			v-if="selectedChat"
			class="flex-shrink-0"
			@click="handleToggleActions"
			@keydown.enter="handleToggleActions"
			@keydown.space.prevent="handleToggleActions"
		/>
	</div>
</template>
