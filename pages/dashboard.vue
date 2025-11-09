<script setup lang="ts">
import ChatList from '~/components/common/chat/ChatList.vue'
import ChatPanel from '~/components/common/chat/ChatPanel.vue'
import ChatActionsPanel from '~/components/common/chat/ChatActionsPanel.vue'
import MessageForm from '~/components/common/message/MessageForm.vue'
import FriendsList from '~/components/common/friends/FriendsList.vue'
import AddFriendsPanel from '~/components/common/friends/AddFriendsPanel.vue'
import InvitesPanel from '~/components/common/friends/InvitesPanel.vue'
import type { Chat, Message, Friend } from '~/types/Chat'
import {
	fetchChats as fetchChatsFromService,
	fetchMessages as fetchMessagesFromService,
	sendMessage as sendMessageToService,
	deleteMessage as deleteMessageFromService
} from '~/services/chatService'
import {
	fetchFriends as fetchFriendsFromService,
	sendFriendInvite,
	fetchInvites as fetchInvitesFromService,
	acceptInvite,
	rejectInvite,
	deleteFriend as deleteFriendFromService
} from '~/services/friendsService'
import type { ApiResponse } from '~/types/Api'
import type { ChatsResponse } from '~/types/ChatsApi'
import type { FriendResponse, Invite } from '~/types/FriendsApi'
import { useSocket } from '~/composables/useSocket'

const { error: toastError, success: toastSuccess } = useToast()
const { user } = useAuth()
const { connect, disconnect, on, off, emit } = useSocket()

const currentUserId = computed(() => (user.value as any)?.id ?? 0)

// Stan przechowujący kto aktualnie pisze (chatId -> Map<userId, username>)
const typingUsers = reactive<Record<string, Map<string | number, string>>>({})

type ViewMode = 'chats' | 'friends'
type SubView = 'list' | 'add' | 'invites'

const viewMode = ref<ViewMode>('chats')
const friendsSubView = ref<SubView>('list')
const searchQuery = ref('')
const selectedChatId = ref<number | null>(null)
const newMessageText = ref('')
const chatPanelRef = ref<any>(null)
const isActionsPanelOpen = ref(false)

const chats = ref<Chat[]>([])
const chatsLoading = ref(false)
const chatsError = ref<string | null>(null)

const messagesState = reactive<
	Record<
		number,
		{ limit: number; offset: number; loading: boolean; error: string | null; hasMore: boolean }
	>
>({})

const friends = ref<Friend[]>([])
const friendsLoading = ref(false)
const friendsError = ref<string | null>(null)

const invites = ref<{
	sentInvites: Invite[]
	receivedInvites: Invite[]
	totalSent: number
	totalReceived: number
	totalPending: number
}>({
	sentInvites: [],
	receivedInvites: [],
	totalSent: 0,
	totalReceived: 0,
	totalPending: 0
})
const invitesLoading = ref(false)
const invitesError = ref<string | null>(null)

function mapFriendResponse(friend: FriendResponse): Friend {
	return {
		id: friend.id,
		username: friend.username,
		email: friend.email,
		isOnline: friend.isOnline,
		lastSeen: friend.lastSeen,
		friendshipCreatedAt: friend.friendshipCreatedAt,
		createdAt: friend.createdAt
	}
}

async function fetchFriendsData() {
	try {
		friendsLoading.value = true
		friendsError.value = null

		const res = await fetchFriendsFromService()
		const raw = res?.data
		const friendsList: FriendResponse[] = Array.isArray(raw?.friends) ? raw.friends : []

		friends.value = friendsList.map(mapFriendResponse)
	} catch (err: any) {
		friendsError.value = err?.message || 'Nie udało się pobrać listy znajomych'
		if (friendsError.value) {
			toastError(friendsError.value)
		}
	} finally {
		friendsLoading.value = false
	}
}

async function fetchInvitesData() {
	try {
		invitesLoading.value = true
		invitesError.value = null

		const res = await fetchInvitesFromService()
		const raw = res?.data

		invites.value = {
			sentInvites: Array.isArray(raw?.sentInvites) ? raw.sentInvites : [],
			receivedInvites: Array.isArray(raw?.receivedInvites) ? raw.receivedInvites : [],
			totalSent: raw?.totalSent ?? 0,
			totalReceived: raw?.totalReceived ?? 0,
			totalPending: raw?.totalPending ?? 0
		}
	} catch (err: any) {
		invitesError.value = err?.message || 'Nie udało się pobrać zaproszeń'
		if (invitesError.value) {
			toastError(invitesError.value)
		}
	} finally {
		invitesLoading.value = false
	}
}

function handleViewModeChange(mode: ViewMode) {
	viewMode.value = mode
	if (mode === 'friends') {
		friendsSubView.value = 'list'
		fetchFriendsData()
		fetchInvitesData()
	}
}

function handleFriendsSubViewChange(subView: 'list' | 'add' | 'invites') {
	friendsSubView.value = subView
	if (subView === 'invites') {
		fetchInvitesData()
	}
}

async function handleAddFriend(username: string) {
	if (!username.trim()) {
		toastError('Podaj nazwę użytkownika')
		return
	}

	try {
		await sendFriendInvite(username.trim())
		toastSuccess(`Zaproszenie zostało wysłane do ${username}`)
		await fetchInvitesData()
	} catch (err: any) {
		const errorMessage =
			err?.response?._data?.message || err?.message || 'Nie udało się wysłać zaproszenia'
		toastError(errorMessage)
	}
}

async function handleRemoveFriend(friendId: string | number) {
	const friend = friends.value.find((f) => String(f.id) === String(friendId))
	if (!friend) return

	try {
		await deleteFriendFromService(String(friendId))
		toastSuccess(`${friend.username} został usunięty z znajomych`)
		await fetchFriendsData()
	} catch (err: any) {
		const errorMessage =
			err?.response?._data?.message || err?.message || 'Nie udało się usunąć znajomego'
		toastError(errorMessage)
	}
}

async function handleAcceptInvite(inviteId: string) {
	try {
		await acceptInvite(inviteId)
		toastSuccess('Zaproszenie zostało zaakceptowane')
		await fetchFriendsData()
		await fetchInvitesData()
	} catch (err: any) {
		const errorMessage =
			err?.response?._data?.message ||
			err?.message ||
			'Nie udało się zaakceptować zaproszenia'
		toastError(errorMessage)
	}
}

async function handleRejectInvite(inviteId: string) {
	try {
		await rejectInvite(inviteId)
		toastSuccess('Zaproszenie zostało odrzucone')
		await fetchInvitesData()
	} catch (err: any) {
		const errorMessage =
			err?.response?._data?.message || err?.message || 'Nie udało się odrzucić zaproszenia'
		toastError(errorMessage)
	}
}

function handleStartChat(friendId: string | number) {
	const friend = friends.value.find((f) => String(f.id) === String(friendId))
	if (!friend) return

	viewMode.value = 'chats'

	const existingChat = chats.value
		.filter((chat) => chat.isGroup == false)
		.find((c) => c.otherUser.id === friend.id)

	if (existingChat) {
		handleSelectChat(existingChat.id)
		return
	}

	toastError('Nie znaleziono czatu z tym znajomym')
}

// Funkcje do obsługi eventów WebSocket
function mapMessageFromBackend(messageData: any): Message {
	// Mapuj ID z string na number jeśli potrzeba
	const id =
		typeof messageData.id === 'string'
			? Number(messageData.id) || messageData.id
			: messageData.id
	const chatId =
		typeof messageData.chatId === 'string'
			? Number(messageData.chatId) || messageData.chatId
			: messageData.chatId
	const senderId =
		typeof messageData.senderId === 'string'
			? Number(messageData.senderId) || messageData.senderId
			: messageData.senderId

	return {
		id,
		chatId,
		senderId,
		senderUsername: messageData.senderUsername,
		content: messageData.content,
		createdAt:
			typeof messageData.createdAt === 'string'
				? messageData.createdAt
				: messageData.createdAt.toISOString(),
		reactions: messageData.reactions?.map((r: any) => ({
			emoji: r.emoji,
			userIds: r.userIds.map((uid: any) =>
				typeof uid === 'string' ? Number(uid) || uid : uid
			),
			username: r.username || ''
		}))
	}
}

function handleNewMessage(data: { chatId: string; message: any }) {
	const chatId =
		typeof data.chatId === 'string' ? Number(data.chatId) || data.chatId : data.chatId
	const chat = chats.value.find((c) => String(c.id) === String(chatId))

	if (!chat) {
		// Jeśli nie ma czatu, odśwież listę czatów
		fetchChats()
		return
	}

	const mappedMessage = mapMessageFromBackend(data.message)

	// Sprawdź czy wiadomość już nie istnieje (zapobieganie duplikatom)
	if (!chat.messages.find((m) => String(m.id) === String(mappedMessage.id))) {
		chat.messages.push(mappedMessage)
		chat.lastMessage = mappedMessage

		// Jeśli to nie jest aktualnie wybrany czat, zwiększ unreadCount
		if (selectedChatId.value !== chat.id) {
			chat.unreadCount++
		}

		// Jeśli to aktualnie wybrany czat, przewiń na dół
		if (selectedChatId.value === chat.id) {
			nextTick(() => handleScrollToBottom())
		}
	}
}

function handleMessageDeleted(data: { chatId: string; messageId: string }) {
	const chatId =
		typeof data.chatId === 'string' ? Number(data.chatId) || data.chatId : data.chatId
	const chat = chats.value.find((c) => String(c.id) === String(chatId))
	if (!chat) return

	chat.messages = chat.messages.filter((m) => String(m.id) !== String(data.messageId))

	// Zaktualizuj lastMessage
	const lastMessage = chat.messages[chat.messages.length - 1]
	if (lastMessage) {
		chat.lastMessage = lastMessage
	} else {
		chat.lastMessage = null as any
	}
}

function handleReactionAdded(data: {
	chatId: string
	messageId: string
	reaction: { emoji: string; userId: string; username: string }
}) {
	const chatId =
		typeof data.chatId === 'string' ? Number(data.chatId) || data.chatId : data.chatId
	const chat = chats.value.find((c) => String(c.id) === String(chatId))
	if (!chat) return

	const message = chat.messages.find((m) => String(m.id) === String(data.messageId))
	if (!message) return

	if (!message.reactions) {
		message.reactions = []
	}

	const userId =
		typeof data.reaction.userId === 'string'
			? Number(data.reaction.userId) || data.reaction.userId
			: data.reaction.userId
	const existingReaction = message.reactions.find((r) => r.emoji === data.reaction.emoji)

	if (existingReaction) {
		// Sprawdź czy użytkownik już nie dodał tej reakcji
		if (!existingReaction.userIds.some((id) => String(id) === String(userId))) {
			existingReaction.userIds.push(userId)
		}
	} else {
		message.reactions.push({
			emoji: data.reaction.emoji,
			userIds: [userId],
			username: data.reaction.username
		})
	}
}

function handleReactionRemoved(data: {
	chatId: string
	messageId: string
	reaction: { emoji: string; userId: string }
}) {
	const chatId =
		typeof data.chatId === 'string' ? Number(data.chatId) || data.chatId : data.chatId
	const chat = chats.value.find((c) => String(c.id) === String(chatId))
	if (!chat) return

	const message = chat.messages.find((m) => String(m.id) === String(data.messageId))
	if (!message || !message.reactions) return

	const userId =
		typeof data.reaction.userId === 'string'
			? Number(data.reaction.userId) || data.reaction.userId
			: data.reaction.userId
	const existingReaction = message.reactions.find((r) => r.emoji === data.reaction.emoji)

	if (existingReaction) {
		existingReaction.userIds = existingReaction.userIds.filter(
			(id) => String(id) !== String(userId)
		)

		// Jeśli nie ma już żadnych użytkowników z tą reakcją, usuń reakcję
		if (existingReaction.userIds.length === 0) {
			message.reactions = message.reactions.filter((r) => r.emoji !== data.reaction.emoji)
		}
	}
}

function handleTypingStart(data: { chatId: string; userId: string; username: string }) {
	const chatId = String(data.chatId)
	const userId =
		typeof data.userId === 'string' ? Number(data.userId) || data.userId : data.userId

	// Ignoruj własne eventy typing
	if (String(userId) === String(currentUserId.value)) return

	if (!typingUsers[chatId]) {
		typingUsers[chatId] = new Map()
	}
	typingUsers[chatId].set(userId, data.username)
}

function handleTypingStop(data: { chatId: string; userId: string }) {
	const chatId = String(data.chatId)
	const userId =
		typeof data.userId === 'string' ? Number(data.userId) || data.userId : data.userId

	// Ignoruj własne eventy typing
	if (String(userId) === String(currentUserId.value)) return

	if (typingUsers[chatId]) {
		typingUsers[chatId].delete(userId)
		// Nie usuwamy klucza - zostawiamy pusty Map, computed zwróci pustą tablicę
	}
}

// Funkcja pomocnicza do tworzenia systemowych wiadomości
function createSystemMessage(
	chatId: number | string,
	systemType: 'member:added' | 'member:removed' | 'chat:created' | 'chat:updated',
	systemData: {
		userId?: string | number
		username?: string
		chatId?: string | number
		updates?: any
	}
): Message {
	const timestamp = Date.now()
	const numericChatId = typeof chatId === 'string' ? Number(chatId) || 0 : chatId
	return {
		id: -timestamp, // Ujemne ID dla systemowych wiadomości
		chatId: numericChatId,
		senderId: 0,
		senderUsername: 'System',
		content: '',
		createdAt: new Date().toISOString(),
		isSystem: true,
		systemType,
		systemData
	}
}

function handleMessageUpdated(data: { chatId: string; message: any }) {
	const chatId =
		typeof data.chatId === 'string' ? Number(data.chatId) || data.chatId : data.chatId
	const chat = chats.value.find((c) => String(c.id) === String(chatId))
	if (!chat) return

	const mappedMessage = mapMessageFromBackend(data.message)
	const messageIndex = chat.messages.findIndex((m) => String(m.id) === String(mappedMessage.id))

	if (messageIndex !== -1) {
		chat.messages[messageIndex] = mappedMessage
		// Zaktualizuj lastMessage jeśli to była ostatnia wiadomość
		if (chat.lastMessage && String(chat.lastMessage.id) === String(mappedMessage.id)) {
			chat.lastMessage = mappedMessage
		}
	}
}

function handleMessageRead(data: {
	chatId: string
	messageId: string
	reader: { userId: string; username: string; readAt: Date }
}) {
	const chatId =
		typeof data.chatId === 'string' ? Number(data.chatId) || data.chatId : data.chatId
	const chat = chats.value.find((c) => String(c.id) === String(chatId))
	if (!chat) return

	// Można tutaj dodać logikę do śledzenia przeczytanych wiadomości
	// Na razie tylko logujemy
	console.log('Message read:', data)
}

function handleUserStatus(data: { userId: string; isOnline: boolean; lastSeen?: Date }) {
	const userId =
		typeof data.userId === 'string' ? Number(data.userId) || data.userId : data.userId

	// Aktualizuj status użytkownika w liście znajomych
	const friend = friends.value.find((f) => String(f.id) === String(userId))
	if (friend) {
		friend.isOnline = data.isOnline
		if (data.lastSeen) {
			friend.lastSeen = data.lastSeen.toISOString()
		}
	}

	// Aktualizuj status w czatach
	chats.value.forEach((chat) => {
		if (chat.otherUser && String(chat.otherUser.id) === String(userId)) {
			// Można dodać logikę aktualizacji statusu w czacie
		}
	})
}

function handleChatCreated(_data: { chat: any }) {
	// Odśwież listę czatów
	fetchChats()
}

function handleChatUpdatedFromSocket(data: { chatId: string; updates: any }) {
	const chatId =
		typeof data.chatId === 'string' ? Number(data.chatId) || data.chatId : data.chatId
	const chat = chats.value.find((c) => String(c.id) === String(chatId))
	if (!chat) return

	// Aktualizuj dane czatu
	if (data.updates.name) {
		chat.name = data.updates.name
	}

	// Dodaj systemową wiadomość o aktualizacji czatu
	const systemMessage = createSystemMessage(chatId, 'chat:updated', {
		chatId,
		updates: data.updates
	})
	chat.messages.push(systemMessage)

	if (selectedChatId.value === chat.id) {
		nextTick(() => handleScrollToBottom())
	}
}

function handleMemberAdded(data: { chatId: string; member: any }) {
	const chatId =
		typeof data.chatId === 'string' ? Number(data.chatId) || data.chatId : data.chatId
	const chat = chats.value.find((c) => String(c.id) === String(chatId))
	if (!chat) return

	const memberId =
		typeof data.member.userId === 'string'
			? Number(data.member.userId) || data.member.userId
			: data.member.userId
	const username = data.member.username || data.member.user?.username || 'Nieznany użytkownik'

	// Dodaj systemową wiadomość o dołączeniu członka
	const systemMessage = createSystemMessage(chatId, 'member:added', {
		userId: memberId,
		username,
		chatId
	})
	chat.messages.push(systemMessage)

	if (selectedChatId.value === chat.id) {
		nextTick(() => handleScrollToBottom())
	}
}

function handleMemberRemoved(data: { chatId: string; userId: string }) {
	const chatId =
		typeof data.chatId === 'string' ? Number(data.chatId) || data.chatId : data.chatId
	const chat = chats.value.find((c) => String(c.id) === String(chatId))
	if (!chat) return

	const userId =
		typeof data.userId === 'string' ? Number(data.userId) || data.userId : data.userId

	// Pobierz username z czatu lub znajomych
	let username = 'Nieznany użytkownik'
	if (chat.otherUser && String(chat.otherUser.id) === String(userId)) {
		username = chat.otherUser.username
	} else {
		const friend = friends.value.find((f) => String(f.id) === String(userId))
		if (friend) {
			username = friend.username
		}
	}

	// Dodaj systemową wiadomość o opuszczeniu członka
	const systemMessage = createSystemMessage(chatId, 'member:removed', {
		userId,
		username,
		chatId
	})
	chat.messages.push(systemMessage)

	if (selectedChatId.value === chat.id) {
		nextTick(() => handleScrollToBottom())
	}
}

// Funkcje do wysyłania eventów typing
let typingTimeout: NodeJS.Timeout | null = null
let isTyping = false

function handleTypingInput() {
	if (!selectedChatId.value) return

	const chatId = String(selectedChatId.value)

	// Wyślij typing:start jeśli jeszcze nie wysłaliśmy
	if (!isTyping) {
		emit('typing:start', { chatId })
		isTyping = true
	}

	// Reset timeout
	if (typingTimeout) {
		clearTimeout(typingTimeout)
	}

	// Wyślij typing:stop po 3 sekundach bez pisania
	typingTimeout = setTimeout(() => {
		if (isTyping) {
			emit('typing:stop', { chatId })
			isTyping = false
		}
		typingTimeout = null
	}, 3000)
}

function handleMessageSent() {
	if (!selectedChatId.value) return

	const chatId = String(selectedChatId.value)

	// Wyślij typing:stop gdy wysyłamy wiadomość
	if (isTyping) {
		emit('typing:stop', { chatId })
		isTyping = false
	}

	if (typingTimeout) {
		clearTimeout(typingTimeout)
		typingTimeout = null
	}
}

function setupWebSocketListeners() {
	on('message:new', handleNewMessage)
	on('message:updated', handleMessageUpdated)
	on('message:deleted', handleMessageDeleted)
	on('message:read', handleMessageRead)
	on('reaction:added', handleReactionAdded)
	on('reaction:removed', handleReactionRemoved)
	on('typing:start', handleTypingStart)
	on('typing:stop', handleTypingStop)
	on('user:status', handleUserStatus)
	on('chat:created', handleChatCreated)
	on('chat:updated', handleChatUpdatedFromSocket)
	on('member:added', handleMemberAdded)
	on('member:removed', handleMemberRemoved)
}

function cleanupWebSocketListeners() {
	off('message:new', handleNewMessage)
	off('message:updated', handleMessageUpdated)
	off('message:deleted', handleMessageDeleted)
	off('message:read', handleMessageRead)
	off('reaction:added', handleReactionAdded)
	off('reaction:removed', handleReactionRemoved)
	off('typing:start', handleTypingStart)
	off('typing:stop', handleTypingStop)
	off('user:status', handleUserStatus)
	off('chat:created', handleChatCreated)
	off('chat:updated', handleChatUpdatedFromSocket)
	off('member:added', handleMemberAdded)
	off('member:removed', handleMemberRemoved)
}

onMounted(async () => {
	// Połącz z WebSocket
	connect()
	setupWebSocketListeners()

	await fetchChats()

	if (selectedChatId.value !== null) return

	const firstChat = chats.value.at(0)

	if (!firstChat) return

	selectedChatId.value = firstChat.id

	await fetchMessages(firstChat.id, false)
	nextTick(() => handleScrollToBottom())
})

// Computed dla aktualnego czatu - lista użytkowników piszących
const currentTypingUsers = computed(() => {
	if (!selectedChatId.value) return []
	const chatId = String(selectedChatId.value)
	const users = typingUsers[chatId]
	return users ? Array.from(users.values()) : []
})

// Computed dla wszystkich czatów - mapa chatId -> lista użytkowników piszących
const typingUsersByChat = computed(() => {
	const result: Record<number, string[]> = {}
	chats.value.forEach((chat) => {
		const chatId = String(chat.id)
		const users = typingUsers[chatId]
		if (users && users.size > 0) {
			result[chat.id] = Array.from(users.values())
		}
	})
	return result
})

onUnmounted(() => {
	if (typingTimeout) {
		clearTimeout(typingTimeout)
	}
	cleanupWebSocketListeners()
	disconnect()
})

const filteredChats = computed(() => {
	const query = searchQuery.value.trim().toLowerCase()

	if (query.length === 0) return chats.value

	return chats.value.filter((c) => c.name.toLowerCase().includes(query))
})

const selectedChat = computed<Chat | null>(() => {
	if (selectedChatId.value === null) return null

	return chats.value.find((c) => c.id === selectedChatId.value) ?? null
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
			name: String(chat?.name ?? chat?.title ?? 'Czat'),
			lastMessage: chat?.lastMessage,
			unreadCount: Number.isFinite(chat?.unreadCount) ? Number(chat.unreadCount) : 0,
			messages: Array.isArray(chat?.messages) ? chat.messages : [],
			members: Array.isArray(chat?.members) ? chat.members : undefined,
			currentUserRole: chat?.currentUserRole || chat?.memberRole || undefined
		}))
	} catch (err: any) {
		chatsError.value = err?.message || 'Nie udało się pobrać listy czatów'

		toastError(chatsError.value || 'Błąd')
	} finally {
		chatsLoading.value = false
	}
}

function ensureChatState(chatId: number) {
	if (messagesState[chatId]) return

	messagesState[chatId] = { limit: 50, offset: 0, loading: false, error: null, hasMore: true }
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
		state.error = err?.message || 'Nie udało się pobrać wiadomości'
		toastError(state.error || 'Błąd')
	} finally {
		state.loading = false
	}
}

function handleSelectChat(chatId: number) {
	if (selectedChatId.value === chatId) return
	selectedChatId.value = chatId
	const chat = chats.value.find((c) => c.id === chatId)
	if (chat) chat.unreadCount = 0
	fetchMessages(chatId, false)
	nextTick(() => handleScrollToBottom())
	// Zamknij panel akcji przy zmianie czatu
	isActionsPanelOpen.value = false
}

function handleChatUpdated(data: { members: any[]; currentUserRole?: any }) {
	const chat = selectedChat.value
	if (!chat) return

	// Zaktualizuj członków i rolę użytkownika
	chat.members = data.members
	if (data.currentUserRole) {
		chat.currentUserRole = data.currentUserRole
	}
}

async function handleSendMessage() {
	const chat = selectedChat.value

	if (!chat) return

	const text = newMessageText.value.trim()

	if (text.length === 0) return

	handleMessageSent() // Wyślij typing:stop

	try {
		const res = await sendMessageToService(chat.id, text)
		const saved = res.data as unknown as Message

		// Sprawdź czy wiadomość już nie została dodana przez WebSocket
		const exists = chat.messages.find((m) => String(m.id) === String(saved.id))
		if (!exists) {
			chat.messages.push(saved)
			chat.lastMessage = saved as Message
		}

		newMessageText.value = ''
		nextTick(() => handleScrollToBottom())
	} catch (err: any) {
		toastError(err?.message || 'Nie udało się wysłać wiadomości')
	}
}

function handleLoadMore() {
	const chatId = selectedChatId.value
	if (chatId === null) return
	const state = getChatState(chatId)
	if (!state.hasMore) return
	fetchMessages(chatId, true)
}

function handleScrollToBottom() {
	chatPanelRef.value?.scrollToBottom?.()
}

async function handleDeleteMessage(messageId: string | number) {
	const chat = selectedChat.value
	if (!chat) return

	try {
		await deleteMessageFromService(messageId)
		chat.messages = chat.messages.filter((m) => String(m.id) !== String(messageId))

		const lastMessage = chat.messages[chat.messages.length - 1]
		if (lastMessage) {
			chat.lastMessage = lastMessage
		} else {
			chat.lastMessage = null as any
		}
	} catch (err: any) {
		toastError(err?.message || 'Nie udało się usunąć wiadomości')
	}
}

function handleReactionUpdated(
	messageId: string | number,
	emoji: string,
	action: 'add' | 'remove'
) {
	const chat = selectedChat.value
	if (!chat) return

	const message = chat.messages.find((m) => String(m.id) === String(messageId))
	if (!message) return

	if (!message.reactions) {
		message.reactions = []
	}

	if (action === 'add') {
		const existingReaction = message.reactions.find((r) => r.emoji === emoji)

		if (existingReaction) {
			if (!existingReaction.userIds.includes(currentUserId.value)) {
				existingReaction.userIds.push(currentUserId.value)
			}
		} else {
			message.reactions.push({
				emoji,
				userIds: [currentUserId.value],
				username: user.value?.username || ''
			})
		}
	} else {
		const existingReaction = message.reactions.find((r) => r.emoji === emoji)

		if (existingReaction) {
			existingReaction.userIds = existingReaction.userIds.filter(
				(id) => String(id) !== String(currentUserId.value)
			)

			if (existingReaction.userIds.length === 0) {
				message.reactions = message.reactions.filter((r) => r.emoji !== emoji)
			}
		}
	}
}
</script>

<template>
	<div class="h-screen w-screen bg-slate-50">
		<div class="h-full w-full">
			<div class="h-full flex bg-white">
				<aside class="w-full md:w-96 h-dvh border-gray-200 flex flex-col p-4 bg-gray">
					<div class="flex flex-col rounded-lg bg-white h-full">
						<div
							class="p-4 border-b border-gray-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 rounded-t-[1.125rem]"
						>
							<div class="flex items-center justify-between mb-3">
								<h1 class="text-xl font-semibold text-slate-900">
									{{ viewMode === 'chats' ? 'Wiadomości' : 'Znajomi' }}
								</h1>
								<div class="flex gap-1">
									<button
										type="button"
										:class="[
											'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
											viewMode === 'chats'
												? 'bg-blue-500 text-white'
												: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
										]"
										tabindex="0"
										aria-label="Widok czatów"
										@click="handleViewModeChange('chats')"
										@keydown.enter="handleViewModeChange('chats')"
										@keydown.space.prevent="handleViewModeChange('chats')"
									>
										Czaty
									</button>
									<button
										type="button"
										:class="[
											'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
											viewMode === 'friends'
												? 'bg-blue-500 text-white'
												: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
										]"
										tabindex="0"
										aria-label="Widok znajomych"
										@click="handleViewModeChange('friends')"
										@keydown.enter="handleViewModeChange('friends')"
										@keydown.space.prevent="handleViewModeChange('friends')"
									>
										Znajomi
									</button>
								</div>
							</div>

							<template v-if="viewMode === 'friends'">
								<div class="flex gap-2 mb-3">
									<button
										type="button"
										:class="[
											'flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
											friendsSubView === 'list'
												? 'bg-blue-500 text-white'
												: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
										]"
										tabindex="0"
										aria-label="Lista znajomych"
										@click="handleFriendsSubViewChange('list')"
										@keydown.enter="handleFriendsSubViewChange('list')"
										@keydown.space.prevent="handleFriendsSubViewChange('list')"
									>
										Znajomi
									</button>
									<button
										type="button"
										:class="[
											'flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors relative',
											friendsSubView === 'invites'
												? 'bg-blue-500 text-white'
												: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
										]"
										tabindex="0"
										aria-label="Zaproszenia"
										@click="handleFriendsSubViewChange('invites')"
										@keydown.enter="handleFriendsSubViewChange('invites')"
										@keydown.space.prevent="
											handleFriendsSubViewChange('invites')
										"
									>
										Zaproszenia
										<span
											v-if="invites.totalPending > 0"
											class="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
										>
											{{
												invites.totalPending > 9
													? '9+'
													: invites.totalPending
											}}
										</span>
									</button>
									<button
										type="button"
										:class="[
											'flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
											friendsSubView === 'add'
												? 'bg-blue-500 text-white'
												: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
										]"
										tabindex="0"
										aria-label="Dodaj znajomych"
										@click="handleFriendsSubViewChange('add')"
										@keydown.enter="handleFriendsSubViewChange('add')"
										@keydown.space.prevent="handleFriendsSubViewChange('add')"
									>
										Dodaj
									</button>
								</div>
							</template>

							<template v-if="viewMode === 'chats'">
								<label for="chat-search" class="sr-only">Szukaj czatu</label>
								<input
									id="chat-search"
									v-model="searchQuery"
									type="text"
									placeholder="Szukaj..."
									class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								/>
							</template>
						</div>

						<template v-if="viewMode === 'chats'">
							<div v-if="chatsLoading" class="p-4 text-sm text-slate-600">
								Ładowanie czatów...
							</div>
							<div v-else-if="chatsError" class="p-4 text-sm text-red-600">
								{{ chatsError }}
							</div>
							<ChatList
								v-else
								:chats="filteredChats"
								:selected-chat-id="selectedChatId?.toString() ?? null"
								:typing-users-by-chat="typingUsersByChat"
								@select-chat="handleSelectChat"
							/>
						</template>

						<template v-else-if="viewMode === 'friends'">
							<div v-if="friendsSubView === 'list'" class="h-full">
								<div v-if="friendsLoading" class="p-4 text-sm text-slate-600">
									Ładowanie znajomych...
								</div>
								<div v-else-if="friendsError" class="p-4 text-sm text-red-600">
									{{ friendsError }}
								</div>
								<FriendsList
									v-else
									:friends="friends"
									@remove-friend="handleRemoveFriend"
									@start-chat="handleStartChat"
								/>
							</div>
							<div v-else-if="friendsSubView === 'invites'">
								<div v-if="invitesLoading" class="p-4 text-sm text-slate-600">
									Ładowanie zaproszeń...
								</div>
								<div v-else-if="invitesError" class="p-4 text-sm text-red-600">
									{{ invitesError }}
								</div>
								<InvitesPanel
									v-else
									:sent-invites="invites.sentInvites"
									:received-invites="invites.receivedInvites"
									@accept-invite="handleAcceptInvite"
									@reject-invite="handleRejectInvite"
								/>
							</div>
							<AddFriendsPanel v-else @add-friend="handleAddFriend" />
						</template>
					</div>
				</aside>

				<div class="p-4 pl-0 w-full bg-gray">
					<div class="flex-1 flex flex-col min-h-0 w-full h-full">
						<ChatPanel
							ref="chatPanelRef"
							:selected-chat="selectedChat"
							:current-user-id="currentUserId"
							:typing-users="currentTypingUsers"
							:can-load-more="
								selectedChat ? messagesState[selectedChat.id]?.hasMore : false
							"
							:is-loading-more="
								selectedChat ? messagesState[selectedChat.id]?.loading : false
							"
							@load-more="handleLoadMore"
							@delete-message="handleDeleteMessage"
							@reaction-updated="handleReactionUpdated"
							@toggle-actions="isActionsPanelOpen = !isActionsPanelOpen"
						/>
						<template v-if="selectedChat">
							<MessageForm
								v-model="newMessageText"
								@submit="handleSendMessage"
								@typing="handleTypingInput"
							/>
						</template>
					</div>

					<ChatActionsPanel
						v-model="isActionsPanelOpen"
						:chat="selectedChat"
						:current-user-id="currentUserId"
						@chat-updated="handleChatUpdated"
					/>

					<section v-if="!selectedChat" class="md:hidden flex-1 flex flex-col">
						<div class="flex-1 flex items-center justify-center text-gray-500">
							Wybierz czat z listy po lewej
						</div>
					</section>
				</div>
			</div>
		</div>
	</div>
</template>
