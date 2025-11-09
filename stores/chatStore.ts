import type { Chat } from '~/types/Chat'

export const useChatStore = defineStore('chat', () => {
	const currentChatDetails = ref<Chat | null>(null)

	function openChatDetails(chat: Chat) {
		currentChatDetails.value = chat
	}

	function closeChatDetails() {
		currentChatDetails.value = null
	}

	return {
		currentChatDetails,
		openChatDetails,
		closeChatDetails
	}
})
