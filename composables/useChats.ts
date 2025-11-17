import type { Chat } from '~/types/Chat'
import type { ChatsResponse } from '~/types/ChatsApi'
import { fetchChats as fetchChatsFromService } from '~/services/chatService'
import { getErrorMessage } from '~/utils/errorHelpers'
import { findById, compareIds } from '~/utils/idHelpers'
import { useToast } from './useToast'

export function useChats() {
	const { error: toastError } = useToast()

	const chats = ref<Chat[]>([])
	const chatsLoading = ref(false)
	const chatsError = ref<string | null>(null)
	const selectedChatId = ref<string | null>(null)
	const searchQuery = ref('')

	const selectedChat = computed<Chat | null>(() => {
		if (selectedChatId.value === null) return null

		return findById(chats.value, selectedChatId.value) ?? null
	})

	const filteredChats = computed(() => {
		const query = searchQuery.value.trim().toLowerCase()

		if (query.length === 0) return chats.value

		return chats.value.filter((chat) => chat.name.toLowerCase().includes(query))
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

	function selectChat(chatId: string) {
		if (selectedChatId.value === chatId) return
		selectedChatId.value = chatId
		const chat = findById(chats.value, chatId)
		if (chat) chat.unreadCount = 0
	}

	function findChatById(chatId: string): Chat | undefined {
		return findById(chats.value, chatId)
	}

	function updateChat(chatId: string, updates: Partial<Chat>) {
		const chat = findChatById(chatId)
		if (chat) {
			Object.assign(chat, updates)
		}
	}

	function incrementUnreadCount(chatId: string) {
		const chat = findChatById(chatId)
		if (chat && !compareIds(selectedChatId.value, chat.id)) {
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
