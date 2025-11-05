<script setup lang="ts">
import ChatList from '~/components/common/chat/ChatList.vue'
import ChatPanel from '~/components/common/chat/ChatPanel.vue'
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

const { error: toastError, success: toastSuccess } = useToast()
const { user } = useAuth()

const currentUserId = computed(() => (user.value as any)?.id ?? 0)

type ViewMode = 'chats' | 'friends'

const viewMode = ref<ViewMode>('chats')
const friendsSubView = ref<'list' | 'add' | 'invites'>('list')
const searchQuery = ref('')
const selectedChatId = ref<number | null>(null)
const newMessageText = ref('')
const chatPanelRef = ref<any>(null)

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

onMounted(async () => {
	await fetchChats()

	if (selectedChatId.value !== null) return

	const firstChat = chats.value.at(0)

	if (!firstChat) return

	selectedChatId.value = firstChat.id

	await fetchMessages(firstChat.id, false)
	nextTick(() => handleScrollToBottom())
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
			messages: Array.isArray(chat?.messages) ? chat.messages : []
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
}

async function handleSendMessage() {
	const chat = selectedChat.value

	if (!chat) return

	const text = newMessageText.value.trim()

	if (text.length === 0) return

	try {
		const res = await sendMessageToService(chat.id, text)
		const saved = res.data as unknown as Message

		chat.messages.push(saved)
		chat.lastMessage = saved as Message
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
				<aside class="w-full md:w-96 border-r border-gray-200 flex flex-col">
					<div
						class="p-4 border-b border-gray-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60"
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
									@keydown.space.prevent="handleFriendsSubViewChange('invites')"
								>
									Zaproszenia
									<span
										v-if="invites.totalPending > 0"
										class="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
									>
										{{ invites.totalPending > 9 ? '9+' : invites.totalPending }}
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
							@select-chat="handleSelectChat"
						/>
					</template>

					<template v-else-if="viewMode === 'friends'">
						<div v-if="friendsSubView === 'list'">
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
				</aside>

				<div class="flex-1 flex flex-col min-h-0 w-full">
					<ChatPanel
						ref="chatPanelRef"
						:selected-chat="selectedChat"
						:current-user-id="currentUserId"
						:can-load-more="
							selectedChat ? messagesState[selectedChat.id]?.hasMore : false
						"
						:is-loading-more="
							selectedChat ? messagesState[selectedChat.id]?.loading : false
						"
						@load-more="handleLoadMore"
						@delete-message="handleDeleteMessage"
						@reaction-updated="handleReactionUpdated"
					/>
					<template v-if="selectedChat">
						<MessageForm v-model="newMessageText" @submit="handleSendMessage" />
					</template>
				</div>

				<section v-if="!selectedChat" class="md:hidden flex-1 flex flex-col">
					<div class="flex-1 flex items-center justify-center text-gray-500">
						Wybierz czat z listy po lewej
					</div>
				</section>
			</div>
		</div>
	</div>
</template>
