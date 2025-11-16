import type { Chat, Message } from '~/types/Chat'
import {
	fetchMessages as fetchMessagesFromService,
	sendMessage as sendMessageToService,
	deleteMessage as deleteMessageFromService
} from '~/services/chatService'
import { getErrorMessage } from '~/utils/errorHelpers'
import { useToast } from './useToast'

export function useMessages(chats: Ref<Chat[]>, _selectedChatId: Ref<string | null>) {
	const { error: toastError } = useToast()

	const messagesState = reactive<
		Record<
			string,
			{
				limit: number
				offset: number
				loading: boolean
				error: string | null
				hasMore: boolean
			}
		>
	>({})

	const newMessageText = ref('')

	function ensureChatState(chatId: string) {
		if (messagesState[chatId]) return

		messagesState[chatId] = {
			limit: 50,
			offset: 0,
			loading: false,
			error: null,
			hasMore: true
		}
	}

	function getChatState(chatId: string) {
		ensureChatState(chatId)

		return messagesState[chatId] as {
			limit: number
			offset: number
			loading: boolean
			error: string | null
			hasMore: boolean
		}
	}

	async function fetchMessages(chatId: string, append: boolean) {
		const state = getChatState(chatId)

		if (state.loading) return

		try {
			state.loading = true
			state.error = null

			if (!append) {
				state.offset = 0
			}

			const res = await fetchMessagesFromService(chatId, state.limit, state.offset)

			const raw = res?.data
			const items: any[] = Array.isArray(raw)
				? raw
				: Array.isArray(raw?.items)
					? raw.items
					: Array.isArray(raw?.messages)
						? raw.messages
						: []
			const chat = chats.value.find((c) => String(c.id) === String(chatId))
			if (!chat) return
			if (append) {
				chat.messages = [...chat.messages, ...items]
			} else {
				chat.messages = items
			}
			state.offset = chat.messages.length
			state.hasMore = items.length >= state.limit

			if (items.length > 0) {
				const lastMsg = items[items.length - 1]
				if (lastMsg) {
					chat.lastMessage = lastMsg
				}
			}
		} catch (err: any) {
			state.error = getErrorMessage(err, 'Failed to fetch messages')
			toastError(state.error || 'Error')
		} finally {
			state.loading = false
		}
	}

	async function sendMessage(chatId: string, content: string, replyToId?: string | number) {
		try {
			const res = await sendMessageToService(chatId, content, replyToId)
			const saved = res.data as unknown as Message

			const chat = chats.value.find((c) => c.id === chatId)
			if (!chat) return

			const exists = chat.messages.find((m) => String(m.id) === String(saved.id))
			if (!exists) {
				chat.messages.push(saved)
				chat.lastMessage = saved as Message
			}

			newMessageText.value = ''
		} catch (err: any) {
			toastError(getErrorMessage(err, 'Failed to send message'))
		}
	}

	async function deleteMessage(chatId: string, messageId: string | number) {
		const chat = chats.value.find((c) => String(c.id) === String(chatId))
		if (!chat) return

		try {
			await deleteMessageFromService(messageId)
			chat.messages = chat.messages.filter((m) => String(m.id) !== String(messageId))

			updateLastMessage(chat)
		} catch (err: any) {
			toastError(getErrorMessage(err, 'Failed to delete message'))
		}
	}

	function updateLastMessage(chat: Chat) {
		const lastMessage = chat.messages[chat.messages.length - 1]
		if (lastMessage) {
			chat.lastMessage = lastMessage
		} else {
			chat.lastMessage = null as any
		}
	}

	function addMessage(chatId: string, message: Message) {
		const chat = chats.value.find((c) => String(c.id) === String(chatId))
		if (!chat) return false

		const messageIndex = chat.messages.findIndex((m) => String(m.id) === String(message.id))

		if (messageIndex !== -1) {
			// Wiadomość już istnieje - aktualizuj ją z pełnymi danymi z WebSocket
			// Używamy Object.assign aby Vue wykryło zmiany w zagnieżdżonych obiektach
			const existingMessage = chat.messages[messageIndex]
			if (existingMessage) {
				Object.assign(existingMessage, {
					content: message.content,
					senderUsername: message.senderUsername,
					reactions: message.reactions,
					createdAt: message.createdAt,
					isPinned: message.isPinned ?? false,
					pinnedBy: message.pinnedBy,
					pinnedAt: message.pinnedAt,
					edited: message.edited ?? false,
					editedAt: message.editedAt,
					replyTo: message.replyTo
				})
			}

			// Aktualizuj lastMessage jeśli to jest ostatnia wiadomość
			if (chat.lastMessage && String(chat.lastMessage.id) === String(message.id)) {
				Object.assign(chat.lastMessage, {
					content: message.content,
					senderUsername: message.senderUsername,
					reactions: message.reactions,
					isPinned: message.isPinned ?? false,
					pinnedBy: message.pinnedBy,
					pinnedAt: message.pinnedAt,
					edited: message.edited ?? false,
					editedAt: message.editedAt,
					replyTo: message.replyTo
				})
			}

			return true
		}

		// Nowa wiadomość - dodaj ją
		// Używamy spread operatora aby zapewnić reaktywność Vue
		chat.messages = [...chat.messages, message]
		chat.lastMessage = message
		return true
	}

	function updateMessage(chatId: string, message: Message) {
		const chat = chats.value.find((c) => String(c.id) === String(chatId))
		if (!chat) return

		const messageIndex = chat.messages.findIndex((m) => String(m.id) === String(message.id))

		if (messageIndex !== -1) {
			const existingMessage = chat.messages[messageIndex]
			if (existingMessage) {
				existingMessage.isPinned = message.isPinned ?? false
				existingMessage.pinnedBy = message.pinnedBy
				existingMessage.pinnedAt = message.pinnedAt
				existingMessage.content = message.content
				existingMessage.senderUsername = message.senderUsername
				existingMessage.reactions = message.reactions
				existingMessage.createdAt = message.createdAt
				existingMessage.edited = message.edited ?? false
				existingMessage.editedAt = message.editedAt
				existingMessage.replyTo = message.replyTo
			}

			if (chat.lastMessage && String(chat.lastMessage.id) === String(message.id)) {
				chat.lastMessage.isPinned = message.isPinned ?? false
				chat.lastMessage.pinnedBy = message.pinnedBy
				chat.lastMessage.pinnedAt = message.pinnedAt
				chat.lastMessage.content = message.content
				chat.lastMessage.senderUsername = message.senderUsername
				chat.lastMessage.reactions = message.reactions
				chat.lastMessage.createdAt = message.createdAt
				chat.lastMessage.edited = message.edited ?? false
				chat.lastMessage.editedAt = message.editedAt
				chat.lastMessage.replyTo = message.replyTo
			}
		}
	}

	function removeMessage(chatId: string, messageId: string | number) {
		const chat = chats.value.find((c) => String(c.id) === String(chatId))
		if (!chat) return

		chat.messages = chat.messages.filter((m) => String(m.id) !== String(messageId))
		updateLastMessage(chat)
	}

	return {
		messagesState,
		newMessageText,
		fetchMessages,
		sendMessage,
		deleteMessage,
		updateLastMessage,
		addMessage,
		updateMessage,
		removeMessage,
		getChatState
	}
}
