import type { Chat, Message } from '~/types/Chat'
import {
	fetchMessages as fetchMessagesFromService,
	sendMessage as sendMessageToService,
	deleteMessage as deleteMessageFromService,
	forwardMessage as forwardMessageFromService
} from '~/services/chatService'
import { getErrorMessage } from '~/utils/errorHelpers'
import { compareIds, findById, findIndexById } from '~/utils/idHelpers'
import { useToast } from './useToast'
import { useMessageHelpers } from './useMessageHelpers'

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
			const chat = findById(chats.value, chatId)
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

			const chat = findById(chats.value, chatId)
			if (!chat) return

			const exists = findById(chat.messages, saved.id)
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
		const chat = findById(chats.value, chatId)
		if (!chat) return

		try {
			const res = await deleteMessageFromService(messageId)
			const { mapMessageFromBackend } = useMessageHelpers()

			if (res?.data) {
				const deletedMessage = mapMessageFromBackend(res.data)

				const messageIndex = findIndexById(chat.messages, messageId)
				if (messageIndex !== -1) {
					const existingMessage = chat.messages[messageIndex]
					if (existingMessage) {
						updateMessageFields(existingMessage, deletedMessage)
						syncLastMessage(chat, deletedMessage)
					}
				}
			}
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

	function updateMessageFields(existingMessage: Message, updatedMessage: Message): void {
		Object.assign(existingMessage, {
			content: updatedMessage.content,
			senderUsername: updatedMessage.senderUsername,
			reactions: updatedMessage.reactions,
			createdAt: updatedMessage.createdAt,
			isPinned: updatedMessage.isPinned ?? false,
			pinnedBy: updatedMessage.pinnedBy,
			pinnedAt: updatedMessage.pinnedAt,
			edited: updatedMessage.edited ?? false,
			editedAt: updatedMessage.editedAt,
			replyTo: updatedMessage.replyTo,
			forwardedFrom: updatedMessage.forwardedFrom,
			isDeleted: updatedMessage.isDeleted ?? false
		})
	}

	function syncLastMessage(chat: Chat, message: Message): void {
		if (chat.lastMessage && compareIds(chat.lastMessage.id, message.id)) {
			updateMessageFields(chat.lastMessage, message)
		}
	}

	function addMessage(chatId: string, message: Message) {
		const chat = findById(chats.value, chatId)
		if (!chat) return false

		const messageIndex = findIndexById(chat.messages, message.id)

		if (messageIndex !== -1) {
			const existingMessage = chat.messages[messageIndex]
			if (existingMessage) {
				updateMessageFields(existingMessage, message)
			}

			syncLastMessage(chat, message)

			return true
		}

		chat.messages = [...chat.messages, message]
		chat.lastMessage = message
		return true
	}

	function updateMessage(chatId: string, message: Message) {
		const chat = findById(chats.value, chatId)
		if (!chat) return

		const messageIndex = findIndexById(chat.messages, message.id)

		if (messageIndex !== -1) {
			const existingMessage = chat.messages[messageIndex]
			if (existingMessage) {
				updateMessageFields(existingMessage, message)
			}

			syncLastMessage(chat, message)
		}
	}

	function removeMessage(chatId: string, messageId: string | number) {
		const chat = findById(chats.value, chatId)
		if (!chat) return

		chat.messages = chat.messages.filter((m) => !compareIds(m.id, messageId))
		updateLastMessage(chat)
	}

	async function forwardMessage(targetChatId: string, messageId: string | number) {
		try {
			const res = await forwardMessageFromService(targetChatId, messageId)
			const forwardedMessage = res.data as unknown as Message

			const chat = findById(chats.value, targetChatId)
			if (!chat) return

			const exists = findById(chat.messages, forwardedMessage.id)
			if (!exists) {
				chat.messages.push(forwardedMessage)
				chat.lastMessage = forwardedMessage as Message
			}

			return forwardedMessage
		} catch (err: any) {
			toastError(getErrorMessage(err, 'Failed to forward message'))
			throw err
		}
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
		forwardMessage,
		getChatState
	}
}
