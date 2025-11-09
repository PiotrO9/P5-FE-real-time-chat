import type { Chat, Message } from '~/types/Chat'
import {
	fetchMessages as fetchMessagesFromService,
	sendMessage as sendMessageToService,
	deleteMessage as deleteMessageFromService
} from '~/services/chatService'
import { getErrorMessage } from '~/utils/errorHelpers'
import { useToast } from './useToast'

export function useMessages(chats: Ref<Chat[]>, selectedChatId: Ref<number | null>) {
	const { error: toastError } = useToast()

	const messagesState = reactive<
		Record<
			number,
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

	function ensureChatState(chatId: number) {
		if (messagesState[chatId]) return

		messagesState[chatId] = {
			limit: 50,
			offset: 0,
			loading: false,
			error: null,
			hasMore: true
		}
	}

	function getChatState(chatId: number) {
		ensureChatState(chatId)

		return messagesState[chatId] as {
			limit: number
			offset: number
			loading: boolean
			error: string | null
			hasMore: boolean
		}
	}

	async function fetchMessages(chatId: number, append: boolean) {
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
			const chat = chats.value.find((c) => c.id === chatId)
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

	async function sendMessage(chatId: number, content: string) {
		try {
			const res = await sendMessageToService(chatId, content)
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

	async function deleteMessage(chatId: number, messageId: string | number) {
		const chat = chats.value.find((c) => c.id === chatId)
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

	function addMessage(chatId: number, message: Message) {
		const chat = chats.value.find((c) => c.id === chatId)
		if (!chat) return false

		const exists = chat.messages.find((m) => String(m.id) === String(message.id))
		if (!exists) {
			chat.messages.push(message)
			chat.lastMessage = message
			return true
		}
		return false
	}

	function updateMessage(chatId: number, message: Message) {
		const chat = chats.value.find((c) => c.id === chatId)
		if (!chat) return

		const messageIndex = chat.messages.findIndex((m) => String(m.id) === String(message.id))

		if (messageIndex !== -1) {
			chat.messages[messageIndex] = message

			if (chat.lastMessage && String(chat.lastMessage.id) === String(message.id)) {
				chat.lastMessage = message
			}
		}
	}

	function removeMessage(chatId: number, messageId: string | number) {
		const chat = chats.value.find((c) => c.id === chatId)
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
