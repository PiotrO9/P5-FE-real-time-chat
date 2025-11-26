import type { Message } from '~/types/Chat'
import { toNumber } from '~/utils/typeHelpers'
import { compareIds, findById } from '~/utils/idHelpers'
import { pinnedMessagesService } from '~/services/pinnedMessagesService'
import { markMessageAsRead } from '~/services/chatService'

export function useDashboard() {
	const { user } = useAuth()
	const chatStore = useChatStore()
	const { connect, disconnect, emit } = useSocket()
	const { error: toastError } = useToast()

	const currentUserId = computed(() => {
		const userId = user.value?.id
		if (!userId) return 0
		if (typeof userId === 'string' && isNaN(Number(userId))) {
			return userId
		}
		return toNumber(userId)
	})

	const currentChat = computed(() => chatStore.currentChatDetails)

	const viewModeComposable = useViewMode()
	const chatsComposable = useChats()
	const messagesComposable = useMessages(chatsComposable.chats, chatsComposable.selectedChatId)
	const friendsComposable = useFriends()
	const invitesComposable = useInvites()
	const typingUsersComposable = useTypingUsers(ref(toNumber(currentUserId.value)) as Ref<number>)
	const reactionsComposable = useReactions(
		chatsComposable.chats,
		chatsComposable.selectedChatId,
		ref(toNumber(currentUserId.value)) as Ref<number>,
		user
	)
	const messageReadsComposable = useMessageReads(chatsComposable.chats)

	const chatPanelRef = ref<any>(null)
	const isActionsPanelOpen = ref(false)
	const replyToMessage = ref<Message | null>(null)

	const searchQuery = computed({
		get: () => chatsComposable.searchQuery.value,
		set: (value: string) => {
			chatsComposable.searchQuery.value = value
		}
	})

	const currentTypingUsers = computed(() => {
		if (!chatsComposable.selectedChatId.value) return []
		return typingUsersComposable.getTypingUsers(chatsComposable.selectedChatId.value)
	})

	const typingUsersByChat = computed(() => {
		return typingUsersComposable.updateTypingUsersByChat(chatsComposable.chats.value)
	})

	const pendingInvitesTotal = computed(() => {
		const total = invitesComposable.invites.value.totalPending
		if (!total) {
			return 0
		}
		return total
	})

	watch(currentChat, (newChat) => {
		if (!newChat) {
			isActionsPanelOpen.value = false
			replyToMessage.value = null
		}
	})

	watch(chatsComposable.selectedChatId, () => {
		replyToMessage.value = null
	})

	watch(
		() => [viewModeComposable.viewMode.value, viewModeComposable.friendsSubView.value],
		([viewMode, friendsSubView]) => {
			if (viewMode === 'friends') {
				friendsComposable.fetchFriends()
				invitesComposable.fetchInvites()
			}
		},
		{ immediate: false }
	)

	useDynamicTitle({
		selectedChat: chatsComposable.selectedChat,
		viewMode: viewModeComposable.viewMode,
		friendsSubView: viewModeComposable.friendsSubView,
		invitesTotal: pendingInvitesTotal
	})

	const socketHandlers = useSocketHandlers(
		chatsComposable.chats,
		friendsComposable.friends,
		chatsComposable.selectedChatId,
		currentUserId,
		typingUsersComposable,
		messagesComposable,
		chatsComposable,
		friendsComposable,
		invitesComposable,
		reactionsComposable,
		messageReadsComposable,
		handleScrollToBottom
	)

	function handleViewModeChange(mode: 'chats' | 'friends', subView?: 'list' | 'add' | 'invites') {
		viewModeComposable.setViewMode(mode, subView)
		if (mode === 'friends') {
			friendsComposable.fetchFriends()
			invitesComposable.fetchInvites()
		}
	}

	function handleFriendsSubViewChange(subView: 'list' | 'add' | 'invites') {
		viewModeComposable.setFriendsSubView(subView)

		if (subView === 'invites') {
			invitesComposable.fetchInvites()
		}
	}

	function handleStartChat(friendId: string | number) {
		const friend = friendsComposable.findFriendById(friendId)
		if (!friend) return

		viewModeComposable.setViewMode('chats')

		const existingChat = chatsComposable.chats.value
			.filter((chat) => chat.isGroup == false)
			.find((c) => c.otherUser && compareIds(c.otherUser.id, friend.id))

		if (existingChat) {
			handleSelectChat(existingChat.id)
			return
		}

		toastError('Chat not found with this friend')
	}

	async function handleSelectChat(chatId: string) {
		if (chatsComposable.selectedChatId.value === chatId) return
		chatsComposable.selectChat(chatId)
		messagesComposable.fetchMessages(chatId, false)
		await pinnedMessagesService.fetchPinnedMessagesForChat(chatId)
		nextTick(() => {
			handleScrollToBottom()
			// Mark latest message as read after loading chat
			setTimeout(() => {
				handleMarkLatestMessageAsRead()
			}, 500)
		})
		isActionsPanelOpen.value = false
	}

	function handleChatUpdated(data: { members: any[]; currentUserRole?: any }) {
		const chat = chatsComposable.selectedChat.value
		if (!chat) return

		chat.members = data.members
		if (data.currentUserRole) {
			chat.currentUserRole = data.currentUserRole
		}

		const storeChat = chatStore.currentChatDetails
		if (storeChat && compareIds(storeChat.id, chat.id)) {
			storeChat.members = data.members
			if (data.currentUserRole) {
				storeChat.currentUserRole = data.currentUserRole
			}
		}
	}

	function handleLoadMore() {
		const chatId = chatsComposable.selectedChatId.value
		if (chatId === null) return
		const state = messagesComposable.getChatState(chatId)
		if (!state.hasMore) return
		messagesComposable.fetchMessages(chatId, true)
	}

	function handleScrollToBottom() {
		chatPanelRef.value?.scrollToBottom?.()
		// Mark latest message as read after scrolling to bottom
		nextTick(() => {
			handleMarkLatestMessageAsRead()
		})
	}

	async function handleAddFriend(username: string) {
		await friendsComposable.addFriend(username)
		await invitesComposable.fetchInvites()
	}

	async function handleRemoveFriend(friendId: string | number) {
		await friendsComposable.removeFriend(friendId)
	}

	async function handleAcceptInvite(inviteId: string) {
		await invitesComposable.acceptInvite(inviteId)
		await friendsComposable.fetchFriends()
		await invitesComposable.fetchInvites()
	}

	async function handleRejectInvite(inviteId: string) {
		await invitesComposable.rejectInvite(inviteId)
		await invitesComposable.fetchInvites()
	}

	async function handleSendMessage() {
		const chat = chatsComposable.selectedChat.value

		if (!chat) return

		const text = messagesComposable.newMessageText.value.trim()

		if (text.length === 0) return

		typingUsersComposable.handleMessageSent(chat.id, emit)

		const replyToId = replyToMessage.value?.id
		await messagesComposable.sendMessage(chat.id, text, replyToId)
		replyToMessage.value = null
		nextTick(() => handleScrollToBottom())
	}

	async function handleMarkLatestMessageAsRead() {
		const chat = chatsComposable.selectedChat.value
		if (!chat || !chat.messages || chat.messages.length === 0) return

		// Find latest message that is not system and not own
		const nonSystemMessages = chat.messages.filter(
			(msg) => !msg.isSystem && !compareIds(msg.senderId, currentUserId.value)
		)

		if (nonSystemMessages.length === 0) return

		const latestMessage = nonSystemMessages[nonSystemMessages.length - 1]
		if (!latestMessage) return

		// Check if already read
		const hasRead = messageReadsComposable.hasUserReadMessage(
			latestMessage,
			currentUserId.value
		)

		if (hasRead) return

		try {
			await markMessageAsRead(latestMessage.id)
		} catch (error) {
			// Silently ignore errors - we don't want to disturb the user
			console.warn('Failed to mark message as read:', error)
		}
	}

	async function handleDeleteMessage(messageId: string | number) {
		const chat = chatsComposable.selectedChat.value
		if (!chat) return

		await messagesComposable.deleteMessage(chat.id, messageId)
	}

	function handleReactionUpdated(
		messageId: string | number,
		emoji: string,
		action: 'add' | 'remove'
	) {
		reactionsComposable.handleReactionUpdated(messageId, emoji, action)
	}

	function handleReply(message: Message) {
		replyToMessage.value = message
	}

	function handleCancelReply() {
		replyToMessage.value = null
	}

	function handleScrollToMessage(messageId: string | number) {
		// Event jest obsługiwany w ChatPanel
		nextTick(() => {
			const chatPanel = chatPanelRef.value
			if (chatPanel && chatPanel.handleScrollToMessage) {
				chatPanel.handleScrollToMessage(messageId)
			}
		})
	}

	function handlePinUpdated(messageId: string | number, isPinned: boolean) {
		const chat = chatsComposable.selectedChat.value
		if (!chat) return

		const message = findById(chat.messages, messageId)
		if (message) {
			message.isPinned = isPinned
		}
	}

	async function handleForwardMessage(targetChatId: string, messageId: string | number) {
		try {
			await messagesComposable.forwardMessage(targetChatId, messageId)
			nextTick(() => handleScrollToBottom())
		} catch (error) {
			// Błąd jest już obsłużony w forwardMessage
		}
	}

	function handleOpenPinnedMessages() {
		const chat = chatsComposable.selectedChat.value
		if (!chat) return
		chatStore.openChatDetails(chat)
		isActionsPanelOpen.value = true
	}

	function handleTypingInput() {
		const chatId = chatsComposable.selectedChatId.value
		if (!chatId) return
		typingUsersComposable.handleTypingInput(chatId, emit)
	}

	function handleBackToChats() {
		chatsComposable.selectedChatId.value = null
		isActionsPanelOpen.value = false
		replyToMessage.value = null
	}

	function handleMessageSearchScroll(messageId: string | number) {
		handleScrollToMessage(messageId)
	}

	async function initialize() {
		connect()
		socketHandlers.setupListeners()

		// Listen for custom scroll-to-message events from ChatActionsPanel
		window.addEventListener('scroll-to-message', ((event: CustomEvent) => {
			handleMessageSearchScroll(event.detail.messageId)
		}) as EventListener)

		await chatsComposable.fetchChats()

		if (chatsComposable.selectedChatId.value !== null) return

		const firstChat = chatsComposable.chats.value[0]

		if (!firstChat) return

		chatsComposable.selectChat(firstChat.id)

		await messagesComposable.fetchMessages(firstChat.id, false)
		await pinnedMessagesService.fetchPinnedMessagesForChat(firstChat.id)
		nextTick(() => handleScrollToBottom())
	}

	function cleanup() {
		window.removeEventListener('scroll-to-message', ((event: CustomEvent) => {
			handleMessageSearchScroll(event.detail.messageId)
		}) as EventListener)
		typingUsersComposable.cleanup()
		socketHandlers.cleanupListeners()
		disconnect()
	}

	return {
		// Computed
		currentUserId,
		currentChat,
		searchQuery,
		currentTypingUsers,
		typingUsersByChat,
		pendingInvitesTotal,

		// Composables
		viewModeComposable,
		chatsComposable,
		messagesComposable,
		friendsComposable,
		invitesComposable,
		typingUsersComposable,
		reactionsComposable,
		messageReadsComposable,

		// Refs
		chatPanelRef,
		isActionsPanelOpen,
		replyToMessage,

		// Handlers
		handleViewModeChange,
		handleFriendsSubViewChange,
		handleStartChat,
		handleSelectChat,
		handleChatUpdated,
		handleLoadMore,
		handleScrollToBottom,
		handleAddFriend,
		handleRemoveFriend,
		handleAcceptInvite,
		handleRejectInvite,
		handleSendMessage,
		handleDeleteMessage,
		handleReactionUpdated,
		handleReply,
		handleCancelReply,
		handleScrollToMessage,
		handlePinUpdated,
		handleOpenPinnedMessages,
		handleTypingInput,
		handleMarkLatestMessageAsRead,
		handleForwardMessage,
		handleBackToChats,

		// Lifecycle
		initialize,
		cleanup
	}
}
