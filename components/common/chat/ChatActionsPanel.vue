<script setup lang="ts">
import type { Chat, Friend } from '~/types/Chat'
import type { ChatMember, Role } from '~/types/ChatsApi'
import type { FriendResponse } from '~/types/FriendsApi'
import {
	addChatMembers,
	removeChatMembers,
	fetchChatDetails as fetchChatDetailsFromService,
	updateChatMemberRole,
	fetchPinnedMessages
} from '~/services/chatService'
import { fetchFriends as fetchFriendsFromService } from '~/services/friendsService'
import { useToast } from '~/composables/useToast'
import Icon from '../Icon.vue'
import Dialog from '../Dialog.vue'
import ChatMemberItem from './ChatMemberItem.vue'

interface Props {
	chat: Chat | null
	currentUserId: number | string
}

interface Emits {
	(e: 'chat-updated', data: { members: ChatMember[]; currentUserRole?: Role }): void
}

const chatStore = useChatStore()

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { success: toastSuccess, error: toastError } = useToast()

const isOpen = defineModel<boolean>({ default: false })

const friends = ref<Friend[]>([])
const friendsLoading = ref(false)
const addUserUsername = ref('')
const isAddingUser = ref(false)
const isRemovingUser = ref<string | null>(null)
const chatDetailsLoading = ref(false)
const openRoleMenuId = ref<string | null>(null)
const isUpdatingRole = ref<string | null>(null)
const isOpeningMenu = ref(false)
const showConfirmDialog = ref(false)
const selectedMemberId = ref<string | null>(null)
const selectedNewRole = ref<Role | null>(null)
const selectedMemberName = ref<string>('')
const pinnedMessagesLoading = ref(false)

const chat = computed(() => props.chat)
const currentUserId = computed(() => props.currentUserId)
const isGroupChat = computed(() => chat.value?.isGroup ?? false)
const currentUserRole = computed(
	() => chat.value?.members?.find((user) => user.id == currentUserId.value)?.role ?? null
)
const isOwner = computed(() => {
	const role = currentUserRole.value
	const result = role === 'OWNER'

	return result
})
const members = computed(() => {
	const membersList = chat.value?.members ?? []
	return [...membersList].sort((a, b) => {
		const roleOrder: Record<Role, number> = {
			OWNER: 0,
			MODERATOR: 1,
			MEMBER: 2
		}
		return roleOrder[a.role] - roleOrder[b.role]
	})
})
const availableFriends = computed(() => {
	const memberIds = members.value.map((m) => String(m.id))
	return friends.value.filter((f) => !memberIds.includes(String(f.id)))
})

watch(isOpen, (newValue) => {
	if (newValue && isOwner.value) {
		fetchFriends()
	}
	if (newValue) {
		fetchChatDetails()
		fetchPinnedMessagesList()
	}
})

watch(
	() => chatStore.pinnedMessages,
	() => {
		if (isOpen.value && chat.value) {
			fetchPinnedMessagesList()
		}
	},
	{ deep: true }
)

const pinnedMessagesList = computed(() => {
	if (!chat.value) return []
	const messages = chatStore.getPinnedMessages(chat.value.id)
	return [...messages].sort((a, b) => {
		const dateA = a.pinnedAt ? new Date(a.pinnedAt).getTime() : new Date(a.createdAt).getTime()
		const dateB = b.pinnedAt ? new Date(b.pinnedAt).getTime() : new Date(b.createdAt).getTime()
		return dateB - dateA
	})
})

function handleAddUserClick(friend: Friend) {
	addUserUsername.value = friend.username

	handleAddUser()
}

function handleToggleRoleMenu(memberId: string, event?: Event) {
	if (event) {
		event.stopPropagation()
		event.preventDefault()
	}

	isOpeningMenu.value = true
	openRoleMenuId.value = memberId

	nextTick(() => {
		setTimeout(() => {
			isOpeningMenu.value = false
		}, 200)
	})
}

function handleCloseRoleMenu() {
	openRoleMenuId.value = null
}

function handleChangeRole(memberId: string, newRole: Role) {
	if (!chat.value) return

	const member = members.value.find((m) => String(m.id) === String(memberId))
	if (!member) return

	if (member.role === newRole) {
		handleCloseRoleMenu()
		return
	}

	if (member.role === 'OWNER') {
		toastError('You cannot change the owner role')
		handleCloseRoleMenu()
		return
	}

	selectedMemberId.value = memberId
	selectedNewRole.value = newRole
	selectedMemberName.value = member.username
	showConfirmDialog.value = true
	handleCloseRoleMenu()
}

function handleCancelRoleChange() {
	showConfirmDialog.value = false
	selectedMemberId.value = null
	selectedNewRole.value = null
	selectedMemberName.value = ''
}

function getRoleLabel(role: Role): string {
	switch (role) {
		case 'OWNER':
			return 'Owner'
		case 'MODERATOR':
			return 'Moderator'
		case 'MEMBER':
			return 'Member'
		default:
			return 'Member'
	}
}

function handleToggleState() {
	chatStore.closeChatDetails()
	isOpen.value = false
}

function handleClickOutside(event: MouseEvent) {
	if (isOpeningMenu.value) {
		return
	}
	const target = event.target as HTMLElement
	const roleMenuContainer = target.closest('.role-menu-container')
	if (!roleMenuContainer) {
		handleCloseRoleMenu()
	}
}

async function fetchFriends() {
	if (!isOwner.value) return

	try {
		friendsLoading.value = true
		const res = await fetchFriendsFromService()
		const raw = res?.data
		const friendsList: FriendResponse[] = Array.isArray(raw?.friends) ? raw.friends : []
		friends.value = friendsList.map((f) => ({
			id: f.id,
			username: f.username,
			email: f.email,
			isOnline: f.isOnline,
			lastSeen: f.lastSeen
		}))
	} catch (err: any) {
		console.error('Error fetching friends:', err)
	} finally {
		friendsLoading.value = false
	}
}

async function fetchChatDetails() {
	if (!chat.value) return

	try {
		chatDetailsLoading.value = true
		const res = await fetchChatDetailsFromService(chat.value.id)
		const data = res?.data

		if (data) {
			const updatedRole = data.currentUserRole || data.memberRole
			emit('chat-updated', {
				members: data.members || [],
				currentUserRole: updatedRole
			})
			if (chat.value) {
				chat.value.members = data.members || []
				chat.value.currentUserRole = updatedRole
			}
		}
	} catch (err: any) {
		console.error('Error fetching chat details:', err)
	} finally {
		chatDetailsLoading.value = false
	}
}

async function fetchPinnedMessagesList() {
	if (!chat.value) return

	try {
		pinnedMessagesLoading.value = true
		const { mapMessageFromBackend } = useMessageHelpers()
		const res = await fetchPinnedMessages(chat.value.id)
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
		chatStore.setPinnedMessages(chat.value.id, mappedMessages)
	} catch (err: any) {
		console.error('Error fetching pinned messages:', err)
	} finally {
		pinnedMessagesLoading.value = false
	}
}

function handlePinnedMessageClick(messageId: string | number) {
	if (!chat.value) return
	const message = chat.value.messages.find((m) => String(m.id) === String(messageId))
	if (message) {
		const messageElement = document.querySelector(`[data-message-id="${messageId}"]`)
		if (messageElement) {
			messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
			messageElement.classList.add('highlight-message')
			setTimeout(() => {
				messageElement.classList.remove('highlight-message')
			}, 2000)
		}
	}
}

function formatMessageTime(createdAt: string): string {
	return new Date(createdAt).toLocaleTimeString([], {
		hour: '2-digit',
		minute: '2-digit'
	})
}

function truncateMessage(content: string, maxLength: number = 50): string {
	if (content.length <= maxLength) return content
	return content.substring(0, maxLength) + '...'
}

async function handleAddUser() {
	if (!chat.value || !addUserUsername.value.trim()) {
		toastError('Please provide a username')
		return
	}

	const friend = friends.value.find(
		(f) => f.username.toLowerCase() === addUserUsername.value.trim().toLowerCase()
	)

	if (!friend) {
		toastError('User not found in friends')
		return
	}

	const isAlreadyMember = members.value.some((m) => String(m.id) === String(friend.id))
	if (isAlreadyMember) {
		toastError('User is already in the chat')
		return
	}

	try {
		isAddingUser.value = true
		await addChatMembers(chat.value.id, [String(friend.id)])
		toastSuccess(`${friend.username} has been added to the chat`)
		addUserUsername.value = ''
		await fetchChatDetails()
	} catch (err: any) {
		const errorMessage = err?.response?._data?.message || err?.message || 'Failed to add user'
		toastError(errorMessage)
	} finally {
		isAddingUser.value = false
	}
}

async function handleRemoveUser(userId: string) {
	if (!chat.value) return

	const member = members.value.find((m) => String(m.id) === String(userId))
	if (!member) return

	if (String(userId) === String(currentUserId.value)) {
		toastError('You cannot remove yourself from the chat')
		return
	}

	try {
		isRemovingUser.value = userId
		await removeChatMembers(chat.value.id, [userId])
		toastSuccess(`${member.username} has been removed from the chat`)
		await fetchChatDetails()
	} catch (err: any) {
		const errorMessage =
			err?.response?._data?.message || err?.message || 'Failed to remove user'
		toastError(errorMessage)
	} finally {
		isRemovingUser.value = null
	}
}

async function handleConfirmRoleChange() {
	if (!chat.value || !selectedMemberId.value || !selectedNewRole.value) return

	const memberId = selectedMemberId.value
	const newRole = selectedNewRole.value
	const memberName = selectedMemberName.value

	try {
		isUpdatingRole.value = memberId
		const apiRole: 'USER' | 'MODERATOR' | 'OWNER' =
			newRole === 'MEMBER' ? 'USER' : (newRole as 'MODERATOR' | 'OWNER')
		await updateChatMemberRole(chat.value.id, String(memberId), apiRole)
		toastSuccess(`User ${memberName} role has been changed to ${getRoleLabel(newRole)}`)
		await fetchChatDetails()
	} catch (err: any) {
		const errorMessage =
			err?.response?._data?.message || err?.message || 'Failed to change user role'
		toastError(errorMessage)
	} finally {
		isUpdatingRole.value = null
		showConfirmDialog.value = false
		selectedMemberId.value = null
		selectedNewRole.value = null
		selectedMemberName.value = ''
	}
}

onMounted(() => {
	nextTick(() => {
		document.addEventListener('click', handleClickOutside)
	})
})

onUnmounted(() => {
	document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
	<aside v-if="chat && isOpen" class="md:min-w-96 bg-white flex flex-col">
		<div class="flex flex-col p-4 bg-gray flex-1">
			<div class="p-4 border-b border-gray-200 bg-white backdrop-blur rounded-t-[1.125rem]">
				<div class="flex items-center justify-between mb-2">
					<h2 class="text-lg font-semibold text-gray-900">Chat actions</h2>
					<button
						type="button"
						tabindex="0"
						aria-label="Close actions panel"
						class="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
						@click="handleToggleState"
						@keydown.enter="handleToggleState"
						@keydown.space.prevent="handleToggleState"
					>
						<Icon name="remove" class="size-5 text-gray-600" />
					</button>
				</div>
				<p class="text-sm text-gray-600">
					{{
						isGroupChat
							? isOwner
								? 'Manage chat members'
								: 'Chat members'
							: 'Chat details'
					}}
				</p>
			</div>

			<div class="flex-1 overflow-y-auto bg-white rounded-b-[1.125rem]">
				<div class="p-4 border-b border-gray-200">
					<h3 class="text-sm font-semibold text-gray-900 mb-3">
						Pinned messages ({{ pinnedMessagesList.length }})
					</h3>
					<div v-if="pinnedMessagesLoading" class="text-sm text-gray-600">
						Loading...
					</div>
					<div v-else-if="pinnedMessagesList.length === 0" class="text-sm text-gray-500">
						No pinned messages
					</div>
					<div v-else class="space-y-2 max-h-96 overflow-y-auto">
						<button
							v-for="pinnedMessage in pinnedMessagesList"
							:key="pinnedMessage.id"
							type="button"
							tabindex="0"
							:aria-label="`Go to message from ${pinnedMessage.senderUsername}`"
							class="w-full text-left px-3 py-2.5 text-xs rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
							@click="handlePinnedMessageClick(pinnedMessage.id)"
							@keydown.enter="handlePinnedMessageClick(pinnedMessage.id)"
						>
							<div class="flex items-start justify-between gap-2">
								<div class="flex-1 min-w-0">
									<div class="flex items-center gap-2 mb-1">
										<p class="font-medium text-gray-900">
											{{ pinnedMessage.senderUsername }}
										</p>
										<span
											v-if="pinnedMessage.pinnedBy"
											class="text-gray-400 text-[10px]"
										>
											pinned by {{ pinnedMessage.pinnedBy.username }}
										</span>
									</div>
									<p class="text-gray-600 line-clamp-2 mb-1">
										{{ truncateMessage(pinnedMessage.content) }}
									</p>
									<div class="flex items-center gap-2 text-gray-400">
										<p class="text-[10px]">
											{{ formatMessageTime(pinnedMessage.createdAt) }}
										</p>
										<span v-if="pinnedMessage.pinnedAt" class="text-[10px]">
											• pinned
											{{ formatMessageTime(pinnedMessage.pinnedAt) }}
										</span>
									</div>
								</div>
								<span class="text-xs flex-shrink-0">📌</span>
							</div>
						</button>
					</div>
				</div>

				<template v-if="isGroupChat && isOwner">
					<div class="p-4 border-b border-gray-200">
						<h3 class="text-sm font-semibold text-gray-900 mb-3">Add user</h3>
						<div class="space-y-2">
							<label for="add-user-input" class="sr-only">Username</label>
							<input
								id="add-user-input"
								v-model="addUserUsername"
								type="text"
								placeholder="Enter username"
								@keydown.enter="handleAddUser"
							/>
							<button
								type="button"
								tabindex="0"
								aria-label="Add user"
								:disabled="isAddingUser || !addUserUsername.trim()"
								class="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
								@click="handleAddUser"
								@keydown.enter="handleAddUser"
							>
								{{ isAddingUser ? 'Adding...' : 'Add' }}
							</button>
						</div>

						<div v-if="availableFriends.length > 0" class="mt-4">
							<p class="text-xs text-gray-600 mb-2">Available friends:</p>
							<div class="space-y-1 max-h-32 overflow-y-auto">
								<button
									v-for="friend in availableFriends"
									:key="friend.id"
									type="button"
									tabindex="0"
									:aria-label="`Add ${friend.username} to chat`"
									class="w-full text-left px-2 py-1.5 text-xs rounded hover:bg-gray-100 transition-colors flex items-center justify-between"
									@click="handleAddUserClick(friend)"
									@keydown.enter="handleAddUserClick(friend)"
								>
									<span class="font-medium">{{ friend.username }}</span>
									<span
										v-if="friend.isOnline"
										class="h-2 w-2 rounded-full bg-green-500"
										aria-label="Online"
									></span>
								</button>
							</div>
						</div>
					</div>

					<div class="p-4">
						<h3 class="text-sm font-semibold text-gray-900 mb-3">
							Members ({{ members.length }})
						</h3>
						<div v-if="chatDetailsLoading" class="text-sm text-gray-600">
							Loading...
						</div>
						<div v-else class="space-y-2">
							<ChatMemberItem
								v-for="member in members"
								:key="member.id"
								:member="member"
								:current-user-id="currentUserId"
								:is-owner="isOwner"
								:open-role-menu-id="openRoleMenuId"
								:is-updating-role="isUpdatingRole"
								:is-removing-user="isRemovingUser"
								@toggle-role-menu="handleToggleRoleMenu"
								@change-role="handleChangeRole"
								@remove-user="handleRemoveUser"
							/>
						</div>
					</div>
				</template>

				<template v-else-if="isGroupChat">
					<div class="p-4">
						<h3 class="text-sm font-semibold text-gray-900 mb-3">
							Members ({{ members.length }})
						</h3>
						<div v-if="chatDetailsLoading" class="text-sm text-gray-600">
							Loading...
						</div>
						<div v-else class="space-y-2">
							<ChatMemberItem
								v-for="member in members"
								:key="member.id"
								:member="member"
								:current-user-id="currentUserId"
								:is-owner="false"
							/>
						</div>
					</div>
				</template>
			</div>
		</div>
	</aside>

	<Dialog
		:open="showConfirmDialog"
		:title="`Change user role`"
		:message="
			selectedMemberName && selectedNewRole
				? `Are you sure you want to change user ${selectedMemberName}'s role to ${getRoleLabel(selectedNewRole)}?`
				: ''
		"
		confirm-text="Confirm"
		cancel-text="Cancel"
		@update:open="showConfirmDialog = $event"
		@confirm="handleConfirmRoleChange"
		@cancel="handleCancelRoleChange"
	/>
</template>
