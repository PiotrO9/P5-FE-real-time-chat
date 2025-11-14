import type { Chat, Message } from '~/types/Chat'
import { nextTick } from 'vue'
import { useSocket } from './useSocket'
import { useMessageHelpers } from './useMessageHelpers'
import { toNumber } from '~/utils/typeHelpers'
import { useChatStore } from '~/stores/chatStore'

export function useSocketHandlers(
	chats: Ref<Chat[]>,
	friends: Ref<any[]>,
	selectedChatId: Ref<string | null>,
	currentUserId: Ref<number>,
	typingUsers: ReturnType<typeof import('./useTypingUsers').useTypingUsers>,
	messages: ReturnType<typeof import('./useMessages').useMessages>,
	chatsComposable: ReturnType<typeof import('./useChats').useChats>,
	friendsComposable: ReturnType<typeof import('./useFriends').useFriends>,
	reactions: ReturnType<typeof import('./useReactions').useReactions>,
	onScrollToBottom: () => void
) {
	const { on, off } = useSocket()
	const { mapMessageFromBackend, createSystemMessage } = useMessageHelpers()

	function handleNewMessage(data: { chatId: string; message: any }) {
		const chatId = String(data.chatId)
		const chat = chatsComposable.findChatById(chatId)

		if (!chat) {
			chatsComposable.fetchChats()
			return
		}

		const mappedMessage = mapMessageFromBackend(data.message)

		if (messages.addMessage(chatId, mappedMessage)) {
			if (selectedChatId.value !== chat.id) {
				chatsComposable.incrementUnreadCount(chatId)
			}

			if (selectedChatId.value === chat.id) {
				nextTick(() => onScrollToBottom())
			}
		}
	}

	function handleMessageDeleted(data: { chatId: string; messageId: string }) {
		const chatId = String(data.chatId)
		messages.removeMessage(chatId, data.messageId)
	}

	function handleReactionAdded(data: {
		chatId: string
		messageId: string
		reaction: { emoji: string; userId: string; username: string }
	}) {
		const chatId = String(data.chatId)
		const userId = toNumber(data.reaction.userId)
		reactions.addReactionToMessage(
			chatId,
			data.messageId,
			data.reaction.emoji,
			userId,
			data.reaction.username
		)
	}

	function handleReactionRemoved(data: {
		chatId: string
		messageId: string
		reaction: { emoji: string; userId: string }
	}) {
		const chatId = String(data.chatId)
		const userId = toNumber(data.reaction.userId)
		reactions.removeReactionFromMessage(chatId, data.messageId, data.reaction.emoji, userId)
	}

	function handleMessageUpdated(data: { chatId: string; message: any }) {
		console.log('WebSocket: message:updated event received', data)
		const chatId = String(data.chatId)
		const chat = chatsComposable.findChatById(chatId)

		if (!chat) {
			console.warn('WebSocket: Chat not found for message:updated', chatId)
			return
		}

		const mappedMessage = mapMessageFromBackend(data.message)
		console.log('WebSocket: Mapped message', mappedMessage)
		messages.updateMessage(chatId, mappedMessage)
	}

	function handleUserStatus(data: { userId: string; isOnline: boolean; lastSeen?: Date }) {
		const userId = toNumber(data.userId)
		friendsComposable.updateFriendStatus(userId, data.isOnline, data.lastSeen)
	}

	function handleChatCreated(_data: { chat: any }) {
		chatsComposable.fetchChats()
	}

	function handleChatUpdatedFromSocket(data: { chatId: string; updates: any }) {
		const chatId = String(data.chatId)
		const chat = chatsComposable.findChatById(chatId)
		if (!chat) return

		if (data.updates.name) {
			chat.name = data.updates.name
		}

		const systemMessage = createSystemMessage(chatId, 'chat:updated', {
			chatId,
			updates: data.updates
		})
		chat.messages.push(systemMessage)

		if (selectedChatId.value === chat.id) {
			nextTick(() => onScrollToBottom())
		}
	}

	function handleMemberAdded(data: { chatId: string; member: any }) {
		const chatId = String(data.chatId)
		const chat = chatsComposable.findChatById(chatId)
		if (!chat) return

		const memberId = toNumber(data.member.userId || data.member.id)
		const username = data.member.username || data.member.user?.username || 'Unknown user'

		const systemMessage = createSystemMessage(chatId, 'member:added', {
			userId: memberId,
			username,
			chatId
		})
		chat.messages.push(systemMessage)

		if (selectedChatId.value === chat.id) {
			nextTick(() => onScrollToBottom())
		}
	}

	function handleMemberRemoved(data: { chatId: string; userId: string }) {
		const chatId = String(data.chatId)
		const chat = chatsComposable.findChatById(chatId)
		if (!chat) return

		const userId = toNumber(data.userId)

		let username = 'Unknown user'
		if (chat.otherUser && String(chat.otherUser.id) === String(userId)) {
			username = chat.otherUser.username
		} else {
			const friend = friendsComposable.findFriendById(userId)
			if (friend) {
				username = friend.username
			}
		}

		const systemMessage = createSystemMessage(chatId, 'member:removed', {
			userId,
			username,
			chatId
		})
		chat.messages.push(systemMessage)

		if (selectedChatId.value === chat.id) {
			nextTick(() => onScrollToBottom())
		}
	}

	function handleMessagePinned(data: {
		chatId: string
		message?: any
		pinnedMessage?: { message: any; pinnedBy?: any; pinnedAt?: string }
	}) {
		if (!data) return

		const chatId = String(data.chatId)
		const chat = chatsComposable.findChatById(chatId)
		if (!chat) return

		const pinnedMessageData = data.pinnedMessage
		const messageData = pinnedMessageData?.message || data.message || data

		if (!messageData || !messageData.id) {
			return
		}

		const messageId = String(messageData.id)
		const messageIndex = chat.messages.findIndex((m) => String(m.id) === messageId)

		if (messageIndex !== -1) {
			const message = chat.messages[messageIndex]

			let pinnedAtValue: string | undefined = undefined
			if (pinnedMessageData?.pinnedAt) {
				if (typeof pinnedMessageData.pinnedAt === 'string') {
					pinnedAtValue = pinnedMessageData.pinnedAt
				} else if (
					typeof pinnedMessageData.pinnedAt === 'object' &&
					pinnedMessageData.pinnedAt !== null &&
					'toISOString' in pinnedMessageData.pinnedAt
				) {
					pinnedAtValue = (pinnedMessageData.pinnedAt as Date).toISOString()
				} else {
					pinnedAtValue = String(pinnedMessageData.pinnedAt)
				}
			}

			const updatedMessage = {
				...message,
				isPinned: true,
				pinnedBy: pinnedMessageData?.pinnedBy
					? {
							id: pinnedMessageData.pinnedBy.id,
							username: pinnedMessageData.pinnedBy.username
						}
					: undefined,
				pinnedAt: pinnedAtValue
			} as Message

			messages.updateMessage(chatId, updatedMessage)

			const chatStore = useChatStore()
			chatStore.addPinnedMessage(chatId, updatedMessage)
		}
	}

	function handleMessageUnpinned(data: { chatId: string; messageId: string }) {
		const chatId = String(data.chatId)
		const chat = chatsComposable.findChatById(chatId)
		if (!chat) return

		const messageIndex = chat.messages.findIndex((m) => String(m.id) === String(data.messageId))

		if (messageIndex !== -1) {
			const message = chat.messages[messageIndex]
			const updatedMessage = {
				...message,
				isPinned: false,
				pinnedBy: undefined,
				pinnedAt: undefined
			} as Message
			messages.updateMessage(chatId, updatedMessage)
		}

		const chatStore = useChatStore()
		chatStore.removePinnedMessage(chatId, data.messageId)
	}

	function setupListeners() {
		on('message:new', handleNewMessage)
		on('message:updated', handleMessageUpdated)
		on('message:deleted', handleMessageDeleted)
		on('reaction:added', handleReactionAdded)
		on('reaction:removed', handleReactionRemoved)
		on('typing:start', typingUsers.handleTypingStart)
		on('typing:stop', typingUsers.handleTypingStop)
		on('user:status', handleUserStatus)
		on('chat:created', handleChatCreated)
		on('chat:updated', handleChatUpdatedFromSocket)
		on('member:added', handleMemberAdded)
		on('member:removed', handleMemberRemoved)
		on('message:pinned', handleMessagePinned)
		on('message:unpinned', handleMessageUnpinned)
	}

	function cleanupListeners() {
		off('message:new', handleNewMessage)
		off('message:updated', handleMessageUpdated)
		off('message:deleted', handleMessageDeleted)
		off('reaction:added', handleReactionAdded)
		off('reaction:removed', handleReactionRemoved)
		off('typing:start', typingUsers.handleTypingStart)
		off('typing:stop', typingUsers.handleTypingStop)
		off('user:status', handleUserStatus)
		off('chat:created', handleChatCreated)
		off('chat:updated', handleChatUpdatedFromSocket)
		off('member:added', handleMemberAdded)
		off('member:removed', handleMemberRemoved)
		off('message:pinned', handleMessagePinned)
		off('message:unpinned', handleMessageUnpinned)
	}

	return {
		setupListeners,
		cleanupListeners
	}
}
