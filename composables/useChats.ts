import type { Chat } from '~/types/Chat'
import type { ChatsResponse } from '~/types/ChatsApi'
import type { ApiResponse } from '~/types/Api'
import { fetchChats as fetchChatsFromService } from '~/services/chatService'
import { getErrorMessage } from '~/utils/errorHelpers'
import { useToast } from './useToast'

export function useChats() {
	const { error: toastError } = useToast()

	const chats = ref<Chat[]>([])
	const chatsLoading = ref(false)
	const chatsError = ref<string | null>(null)
	const selectedChatId = ref<number | null>(null)
	const searchQuery = ref('')

	const selectedChat = computed<Chat | null>(() => {
		if (selectedChatId.value === null) return null

		return chats.value.find((c) => c.id === selectedChatId.value) ?? null
	})

	const filteredChats = computed(() => {
		const query = searchQuery.value.trim().toLowerCase()

		if (query.length === 0) return chats.value

		return chats.value.filter((c) => c.name.toLowerCase().includes(query))
	})

	async function fetchChats() {
		try {
			chatsLoading.value = true
			chatsError.value = null

			const res = (await fetchChatsFromService()) as ApiResponse<ChatsResponse>
			const raw = res?.data
			const list: any[] = Array.isArray(raw?.chats) ? raw.chats : []

			chats.value = list.map((chat) => ({
				...chat,
				name: String(chat?.name ?? chat?.title ?? 'Chat'),
				lastMessage: chat?.lastMessage,
				unreadCount: Number.isFinite(chat?.unreadCount) ? Number(chat.unreadCount) : 0,
				messages: Array.isArray(chat?.messages) ? chat.messages : [],
				members: Array.isArray(chat?.members) ? chat.members : undefined,
				currentUserRole: chat?.currentUserRole || chat?.memberRole || undefined
			}))
		} catch (err: any) {
			chatsError.value = getErrorMessage(err, 'Failed to fetch chats list')

			toastError(chatsError.value || 'Error')
		} finally {
			chatsLoading.value = false
		}
	}

	function selectChat(chatId: number) {
		if (selectedChatId.value === chatId) return
		selectedChatId.value = chatId
		const chat = chats.value.find((c) => c.id === chatId)
		if (chat) chat.unreadCount = 0
	}

	function findChatById(chatId: number | string): Chat | undefined {
		return chats.value.find((c) => String(c.id) === String(chatId))
	}

	function updateChat(chatId: number | string, updates: Partial<Chat>) {
		const chat = findChatById(chatId)
		if (chat) {
			Object.assign(chat, updates)
		}
	}

	function incrementUnreadCount(chatId: number | string) {
		const chat = findChatById(chatId)
		if (chat && selectedChatId.value !== chat.id) {
			chat.unreadCount++
		}
	}

	return {
		chats,
		chatsLoading,
		chatsError,
		selectedChatId,
		selectedChat,
		searchQuery,
		filteredChats,
		fetchChats,
		selectChat,
		findChatById,
		updateChat,
		incrementUnreadCount
	}
}
