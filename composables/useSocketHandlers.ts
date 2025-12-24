import type { Chat, Message } from '~/types/Chat'
import type {
	FriendInviteReceivedEvent,
	FriendInviteAcceptedEvent,
	FriendInviteRejectedEvent,
	FriendRemovedEvent
} from '~/types/socket'
import { nextTick } from 'vue'
import { useSocket } from './useSocket'
import { useMessageHelpers } from './useMessageHelpers'
import { useToast } from './useToast'
import { toNumber } from '~/utils/typeHelpers'
import { compareIds, findIndexById } from '~/utils/idHelpers'

export function useSocketHandlers(
	chats: Ref<Chat[]>,
	friends: Ref<any[]>,
	selectedChatId: Ref<string | null>,
	currentUserId: Ref<number | string>,
	typingUsers: ReturnType<typeof import('./useTypingUsers').useTypingUsers>,
	messages: ReturnType<typeof import('./useMessages').useMessages>,
	chatsComposable: ReturnType<typeof import('./useChats').useChats>,
	friendsComposable: ReturnType<typeof import('./useFriends').useFriends>,
	invitesComposable: ReturnType<typeof import('./useInvites').useInvites>,
	reactions: ReturnType<typeof import('./useReactions').useReactions>,
	messageReads: ReturnType<typeof import('./useMessageReads').useMessageReads>,
	onScrollToBottom: () => void
) {
	const { on, off } = useSocket()
	const { mapMessageFromBackend, createSystemMessage } = useMessageHelpers()
	const { success: toastSuccess } = useToast()

	function handleNewMessage(data: { chatId: string; message: any }) {
		const chatId = String(data.chatId)
		const chat = chatsComposable.findChatById(chatId)

		if (!chat) {
			chatsComposable.fetchChats()
			return
		}

		const mappedMessage = mapMessageFromBackend(data.message)

		if (compareIds(mappedMessage.senderId, currentUserId.value)) {
			return
		}

		const wasAdded = messages.addMessage(chatId, mappedMessage)

		if (wasAdded) {
			if (selectedChatId.value && !compareIds(selectedChatId.value, chat.id)) {
				chatsComposable.incrementUnreadCount(chatId)
			}

			if (selectedChatId.value && compareIds(selectedChatId.value, chat.id)) {
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
		const chatId = String(data.chatId)
		const chat = chatsComposable.findChatById(chatId)

		if (!chat) {
			console.warn('WebSocket: Chat not found for message:updated', chatId)
			return
		}

		const mappedMessage = mapMessageFromBackend(data.message)
		messages.updateMessage(chatId, mappedMessage)
	}

	function handleUserStatus(data: { userId: string; isOnline: boolean; lastSeen?: Date }) {
		const userId = toNumber(data.userId)
		friendsComposable.updateFriendStatus(userId, data.isOnline, data.lastSeen)

		chats.value.forEach((chat) => {
			if (!chat.isGroup && chat.otherUser && compareIds(chat.otherUser.id, userId)) {
				chat.otherUser.isOnline = data.isOnline
				if (data.lastSeen) {
					chat.otherUser.lastSeen =
						data.lastSeen instanceof Date
							? data.lastSeen.toISOString()
							: String(data.lastSeen)
				}
				chat.hasOnlineMembers = data.isOnline
			}

			if (chat.isGroup && chat.members) {
				const member = chat.members.find((m) => compareIds(m.id, userId))
				if (member) {
					member.isOnline = data.isOnline
					if (data.lastSeen) {
						member.lastSeen =
							data.lastSeen instanceof Date
								? data.lastSeen.toISOString()
								: String(data.lastSeen)
					}
					chat.hasOnlineMembers = chat.members.some((m) => m.isOnline === true)
				}
			}
		})
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

		if (selectedChatId.value && compareIds(selectedChatId.value, chat.id)) {
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

		if (selectedChatId.value && compareIds(selectedChatId.value, chat.id)) {
			nextTick(() => onScrollToBottom())
		}
	}

	function handleMemberRemoved(data: { chatId: string; userId: string }) {
		const chatId = String(data.chatId)
		const chat = chatsComposable.findChatById(chatId)
		if (!chat) return

		const userId = toNumber(data.userId)

		let username = 'Unknown user'
		if (chat.otherUser && compareIds(chat.otherUser.id, userId)) {
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

		if (selectedChatId.value && compareIds(selectedChatId.value, chat.id)) {
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
		const messageIndex = findIndexById(chat.messages, messageId)

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

		const messageIndex = findIndexById(chat.messages, data.messageId)

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

	function handleMessageRead(data: {
		chatId: string
		messageId: string
		reader: { userId: string; username: string; readAt: string }
	}) {
		const chatId = String(data.chatId)
		const readerUserId =
			typeof data.reader.userId === 'string' && isNaN(Number(data.reader.userId))
				? data.reader.userId
				: toNumber(data.reader.userId)

		messageReads.addReadToMessage(chatId, data.messageId, {
			userId: readerUserId,
			username: data.reader.username,
			readAt: data.reader.readAt
		})

		const chat = chatsComposable.findChatById(chatId)
		if (!chat) return

		const currentMessageIndex = findIndexById(chat.messages, data.messageId)
		if (currentMessageIndex === -1) return

		for (let i = 0; i < currentMessageIndex; i++) {
			const message = chat.messages[i]
			if (message && message.reads) {
				messageReads.removeReadFromMessage(chatId, message.id, readerUserId)
			}
		}
	}

	function handleFriendInviteReceived(data: FriendInviteReceivedEvent) {
		invitesComposable.addReceivedInvite(data.invite)
		const senderName = data.invite.sender.username
		toastSuccess(`You received an invitation from ${senderName}`)
	}

	function handleFriendInviteAccepted(data: FriendInviteAcceptedEvent) {
		friendsComposable.addFriendFromEvent(data.friendship, currentUserId.value)
		invitesComposable.removeInvitesByUserIds(
			data.friendship.requester.id,
			data.friendship.addressee.id
		)

		const friendName = compareIds(data.friendship.requester.id, currentUserId.value)
			? data.friendship.addressee.username
			: data.friendship.requester.username
		toastSuccess(`${friendName} accepted the invitation`)
	}

	function handleFriendInviteRejected(data: FriendInviteRejectedEvent) {
		invitesComposable.updateInviteStatus(data.invite)
		const receiverName = data.invite.receiver.username
		toastSuccess(`${receiverName} rejected the invitation`)
	}

	function handleFriendRemoved(data: FriendRemovedEvent) {
		friendsComposable.removeFriendFromList(data.friendId)
		const friendName = data.friend.username
		toastSuccess(`${friendName} has been removed from friends list`)
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
		on('message:read', handleMessageRead)
		on('friend:invite:received', handleFriendInviteReceived)
		on('friend:invite:accepted', handleFriendInviteAccepted)
		on('friend:invite:rejected', handleFriendInviteRejected)
		on('friend:removed', handleFriendRemoved)
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
		off('message:read', handleMessageRead)
		off('friend:invite:received', handleFriendInviteReceived)
		off('friend:invite:accepted', handleFriendInviteAccepted)
		off('friend:invite:rejected', handleFriendInviteRejected)
		off('friend:removed', handleFriendRemoved)
	}

	return {
		setupListeners,
		cleanupListeners
	}
}
