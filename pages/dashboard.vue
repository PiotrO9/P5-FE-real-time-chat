<script setup lang="ts">
import type { Message } from '~/types/Chat'
import ChatList from '~/components/chat/ChatList.vue'
import ChatPanel from '~/components/chat/ChatPanel.vue'
import ChatActionsPanel from '~/components/chat/ChatActionsPanel.vue'
import MessageForm from '~/components/message/MessageForm.vue'
import FriendsList from '~/components/friends/FriendsList.vue'
import AddFriendsPanel from '~/components/friends/AddFriendsPanel.vue'
import InvitesPanel from '~/components/friends/InvitesPanel.vue'
import { toNumber } from '~/utils/typeHelpers'
import { compareIds, findById } from '~/utils/idHelpers'
import { fetchPinnedMessages } from '~/services/chatService'

const { user } = useAuth()
const chatStore = useChatStore()
const { connect, disconnect, emit } = useSocket()
const { error: toastError } = useToast()

// Obsługuj zarówno UUID (string) jak i liczby
const currentUserId = computed(() => {
	const userId = user.value?.id
	if (!userId) return 0
	// Jeśli to UUID (string, który nie jest liczbą), zwróć jako string
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
const typingUsersComposable = useTypingUsers(currentUserId)
const reactionsComposable = useReactions(
	chatsComposable.chats,
	chatsComposable.selectedChatId,
	currentUserId,
	user
)

const chatPanelRef = ref<any>(null)
const isActionsPanelOpen = ref(false)
const replyToMessage = ref<Message | null>(null)

const searchQuery = computed({
	get: () => chatsComposable.searchQuery.value,
	set: (value: string) => {
		chatsComposable.searchQuery.value = value
	}
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
	reactionsComposable,
	handleScrollToBottom
)

function handleViewModeChange(mode: 'chats' | 'friends') {
	viewModeComposable.setViewMode(mode)
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
	await fetchPinnedMessagesForChat(chatId)
	nextTick(() => handleScrollToBottom())
	isActionsPanelOpen.value = false
}

async function fetchPinnedMessagesForChat(chatId: string) {
	try {
		const { mapMessageFromBackend } = useMessageHelpers()
		const res = await fetchPinnedMessages(chatId)
		const raw = res?.data
		const pinnedItems: any[] = Array.isArray(raw?.pinnedMessages) ? raw.pinnedMessages : []

		const mappedMessages = pinnedItems.map((pinnedItem) => {
			const message = mapMessageFromBackend(pinnedItem.message)
			return {
				...message,
				isPinned: true,
				pinnedBy: pinnedItem.pinnedBy
					? {
							id: pinnedItem.pinnedBy.id,
							username: pinnedItem.pinnedBy.username
						}
					: undefined,
				pinnedAt: pinnedItem.pinnedAt
					? typeof pinnedItem.pinnedAt === 'string'
						? pinnedItem.pinnedAt
						: pinnedItem.pinnedAt.toISOString()
					: undefined
			}
		})
		chatStore.setPinnedMessages(chatId, mappedMessages)
	} catch (err: any) {
		console.error('Error fetching pinned messages:', err)
	}
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

function handleScrollToMessage(_messageId: string | number) {
	// Event jest obsługiwany w ChatPanel
}

function handlePinUpdated(messageId: string | number, isPinned: boolean) {
	const chat = chatsComposable.selectedChat.value
	if (!chat) return

	const message = findById(chat.messages, messageId)
	if (message) {
		message.isPinned = isPinned
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

onMounted(async () => {
	connect()
	socketHandlers.setupListeners()

	await chatsComposable.fetchChats()

	if (chatsComposable.selectedChatId.value !== null) return

	const firstChat = chatsComposable.chats.value[0]

	if (!firstChat) return

	chatsComposable.selectChat(firstChat.id)

	await messagesComposable.fetchMessages(firstChat.id, false)
	await fetchPinnedMessagesForChat(firstChat.id)
	nextTick(() => handleScrollToBottom())
})

onUnmounted(() => {
	typingUsersComposable.cleanup()
	socketHandlers.cleanupListeners()
	disconnect()
})
</script>

<template>
	<div class="h-screen w-screen bg-slate-50">
		<div class="h-full w-full">
			<div class="h-full flex bg-white">
				<aside class="w-full md:max-w-96 h-dvh border-gray-200 flex flex-col p-4 bg-gray">
					<div class="flex flex-col rounded-lg bg-white h-full">
						<div
							class="p-4 border-b border-gray-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 rounded-t-[1.125rem]"
						>
							<div class="flex items-center justify-between mb-3">
								<h1 class="text-xl font-semibold text-slate-900">
									{{
										viewModeComposable.viewMode.value === 'chats'
											? 'Messages'
											: 'Friends'
									}}
								</h1>
								<div class="flex gap-1">
									<button
										type="button"
										:class="[
											'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
											viewModeComposable.viewMode.value === 'chats'
												? 'bg-blue-500 text-white'
												: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
										]"
										tabindex="0"
										aria-label="Chats view"
										@click="handleViewModeChange('chats')"
										@keydown.enter="handleViewModeChange('chats')"
										@keydown.space.prevent="handleViewModeChange('chats')"
									>
										Chats
									</button>
									<button
										type="button"
										:class="[
											'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
											viewModeComposable.viewMode.value === 'friends'
												? 'bg-blue-500 text-white'
												: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
										]"
										tabindex="0"
										aria-label="Friends view"
										@click="handleViewModeChange('friends')"
										@keydown.enter="handleViewModeChange('friends')"
										@keydown.space.prevent="handleViewModeChange('friends')"
									>
										Friends
									</button>
								</div>
							</div>

							<template v-if="viewModeComposable.viewMode.value === 'friends'">
								<div class="flex gap-2 mb-3">
									<button
										type="button"
										:class="[
											'flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
											viewModeComposable.friendsSubView.value === 'list'
												? 'bg-blue-500 text-white'
												: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
										]"
										tabindex="0"
										aria-label="Friends list"
										@click="handleFriendsSubViewChange('list')"
										@keydown.enter="handleFriendsSubViewChange('list')"
										@keydown.space.prevent="handleFriendsSubViewChange('list')"
									>
										Friends
									</button>
									<button
										type="button"
										:class="[
											'flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors relative',
											viewModeComposable.friendsSubView.value === 'invites'
												? 'bg-blue-500 text-white'
												: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
										]"
										tabindex="0"
										aria-label="Invitations"
										@click="handleFriendsSubViewChange('invites')"
										@keydown.enter="handleFriendsSubViewChange('invites')"
										@keydown.space.prevent="
											handleFriendsSubViewChange('invites')
										"
									>
										Invitations
										<span
											v-if="invitesComposable.invites.value.totalPending > 0"
											class="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
										>
											{{
												invitesComposable.invites.value.totalPending > 9
													? '9+'
													: invitesComposable.invites.value.totalPending
											}}
										</span>
									</button>
									<button
										type="button"
										:class="[
											'flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
											viewModeComposable.friendsSubView.value === 'add'
												? 'bg-blue-500 text-white'
												: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
										]"
										tabindex="0"
										aria-label="Add friends"
										@click="handleFriendsSubViewChange('add')"
										@keydown.enter="handleFriendsSubViewChange('add')"
										@keydown.space.prevent="handleFriendsSubViewChange('add')"
									>
										Add
									</button>
								</div>
							</template>

							<template v-if="viewModeComposable.viewMode.value === 'chats'">
								<label for="chat-search" class="sr-only">Search chat</label>
								<input
									id="chat-search"
									v-model="searchQuery"
									type="text"
									placeholder="Search..."
									class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								/>
							</template>
						</div>

						<template v-if="viewModeComposable.viewMode.value === 'chats'">
							<div
								v-if="chatsComposable.chatsLoading.value"
								class="p-4 text-sm text-slate-600"
							>
								Loading chats...
							</div>
							<div
								v-else-if="chatsComposable.chatsError.value"
								class="p-4 text-sm text-red-600"
							>
								{{ chatsComposable.chatsError.value }}
							</div>
							<ChatList
								v-else
								:chats="chatsComposable.filteredChats.value"
								:selected-chat-id="
									chatsComposable.selectedChatId.value?.toString() ?? null
								"
								:typing-users-by-chat="typingUsersByChat"
								@select-chat="handleSelectChat"
							/>
						</template>

						<template v-else-if="viewModeComposable.viewMode.value === 'friends'">
							<div
								v-if="viewModeComposable.friendsSubView.value === 'list'"
								class="h-full"
							>
								<div
									v-if="friendsComposable.friendsLoading.value"
									class="p-4 text-sm text-slate-600"
								>
									Loading friends...
								</div>
								<div
									v-else-if="friendsComposable.friendsError.value"
									class="p-4 text-sm text-red-600"
								>
									{{ friendsComposable.friendsError.value }}
								</div>
								<FriendsList
									v-else
									:friends="friendsComposable.friends.value"
									@remove-friend="handleRemoveFriend"
									@start-chat="handleStartChat"
								/>
							</div>
							<div v-else-if="viewModeComposable.friendsSubView.value === 'invites'">
								<div
									v-if="invitesComposable.invitesLoading.value"
									class="p-4 text-sm text-slate-600"
								>
									Loading invitations...
								</div>
								<div
									v-else-if="invitesComposable.invitesError.value"
									class="p-4 text-sm text-red-600"
								>
									{{ invitesComposable.invitesError.value }}
								</div>
								<InvitesPanel
									v-else
									:sent-invites="invitesComposable.invites.value.sentInvites"
									:received-invites="
										invitesComposable.invites.value.receivedInvites
									"
									@accept-invite="handleAcceptInvite"
									@reject-invite="handleRejectInvite"
								/>
							</div>
							<AddFriendsPanel v-else @add-friend="handleAddFriend" />
						</template>
					</div>
				</aside>

				<div :class="['w-full py-4 bg-gray']">
					<div class="flex-1 flex flex-col min-h-0 w-full h-full">
						<ChatPanel
							ref="chatPanelRef"
							:selected-chat="chatsComposable.selectedChat.value"
							:current-user-id="currentUserId"
							:typing-users="currentTypingUsers"
							:can-load-more="
								chatsComposable.selectedChat.value
									? messagesComposable.messagesState[
											chatsComposable.selectedChat.value.id
										]?.hasMore
									: false
							"
							:is-loading-more="
								chatsComposable.selectedChat.value
									? messagesComposable.messagesState[
											chatsComposable.selectedChat.value.id
										]?.loading
									: false
							"
							@load-more="handleLoadMore"
							@delete-message="handleDeleteMessage"
							@reaction-updated="handleReactionUpdated"
							@pin-updated="handlePinUpdated"
							@reply="handleReply"
							@scroll-to-message="handleScrollToMessage"
							@open-pinned-messages="handleOpenPinnedMessages"
							@toggle-actions="isActionsPanelOpen = !isActionsPanelOpen"
						/>
						<template v-if="chatsComposable.selectedChat.value">
							<MessageForm
								:model-value="messagesComposable.newMessageText.value"
								:reply-to="replyToMessage"
								@update:model-value="
									(val: string) => (messagesComposable.newMessageText.value = val)
								"
								@submit="handleSendMessage"
								@typing="handleTypingInput"
								@cancel-reply="handleCancelReply"
							/>
						</template>
					</div>

					<section
						v-if="!chatsComposable.selectedChat.value"
						class="md:hidden flex-1 flex flex-col"
					>
						<div class="flex-1 flex items-center justify-center text-gray-500">
							Select a chat from the list on the left
						</div>
					</section>
				</div>

				<ChatActionsPanel
					v-if="currentChat"
					v-model="isActionsPanelOpen"
					:chat="currentChat"
					:current-user-id="currentUserId"
					@chat-updated="handleChatUpdated"
				/>
			</div>
		</div>
	</div>
</template>
