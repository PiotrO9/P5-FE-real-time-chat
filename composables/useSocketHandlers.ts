import type { Chat } from '~/types/Chat'
import { useSocket } from './useSocket'
import { useMessageHelpers } from './useMessageHelpers'
import { toNumber } from '~/utils/typeHelpers'

export function useSocketHandlers(
	chats: Ref<Chat[]>,
	friends: Ref<any[]>,
	selectedChatId: Ref<number | null>,
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
		const chatId = toNumber(data.chatId)
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
		const chatId = toNumber(data.chatId)
		messages.removeMessage(chatId, data.messageId)
	}

	function handleReactionAdded(data: {
		chatId: string
		messageId: string
		reaction: { emoji: string; userId: string; username: string }
	}) {
		const chatId = toNumber(data.chatId)
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
		const chatId = toNumber(data.chatId)
		const userId = toNumber(data.reaction.userId)
		reactions.removeReactionFromMessage(chatId, data.messageId, data.reaction.emoji, userId)
	}

	function handleMessageUpdated(data: { chatId: string; message: any }) {
		const chatId = toNumber(data.chatId)
		const mappedMessage = mapMessageFromBackend(data.message)
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
		const chatId = toNumber(data.chatId)
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
		const chatId = toNumber(data.chatId)
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
		const chatId = toNumber(data.chatId)
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
	}

	return {
		setupListeners,
		cleanupListeners
	}
}
