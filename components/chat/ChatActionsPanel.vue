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
import { getRoleLabel } from '~/utils/roleHelpers'
import { compareIds, findById } from '~/utils/idHelpers'
import ChatActionsHeader from './ChatActionsHeader.vue'
import PinnedMessagesList from './PinnedMessagesList.vue'
import AddUserSection from './AddUserSection.vue'
import ChatMembersList from './ChatMembersList.vue'
import UserInfoSection from './UserInfoSection.vue'

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
	const memberIds = members.value.map((member) => String(member.id))

	return friends.value.filter((friend) => !memberIds.includes(String(friend.id)))
})
const pinnedMessagesList = computed(() => {
	if (!chat.value) return []

	const messages = chatStore.getPinnedMessages(chat.value.id)

	return [...messages].sort((a, b) => {
		const dateA = a.pinnedAt ? new Date(a.pinnedAt).getTime() : new Date(a.createdAt).getTime()
		const dateB = b.pinnedAt ? new Date(b.pinnedAt).getTime() : new Date(b.createdAt).getTime()
		return dateB - dateA
	})
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

function handleAddUserFromSection(username: string) {
	if (!chat.value || !username.trim()) {
		toastError('Please provide a username')
		return
	}

	const friend = friends.value.find(
		(friend) => friend.username.toLowerCase() === username.toLowerCase()
	)

	if (!friend) {
		toastError('User not found in friends')
		return
	}

	const isAlreadyMember = members.value.some((member) => compareIds(member.id, friend.id))
	if (isAlreadyMember) {
		toastError('User is already in the chat')
		return
	}

	handleAddUser(friend)
}

function handleAddUserClick(friend: Friend) {
	handleAddUser(friend)
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

	const member = findById(members.value, memberId)
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

function handlePinnedMessageClick(messageId: string | number) {
	if (!chat.value) return

	const message = findById(chat.value.messages, messageId)

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

async function handleAddUser(friend: Friend) {
	if (!chat.value) return

	try {
		isAddingUser.value = true
		await addChatMembers(chat.value.id, [String(friend.id)])
		toastSuccess(`${friend.username} has been added to the chat`)
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

	const member = findById(members.value, userId)
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

async function fetchFriends() {
	if (!isOwner.value) return

	try {
		friendsLoading.value = true
		const res = await fetchFriendsFromService()
		const raw = res?.data
		const friendsList: FriendResponse[] = Array.isArray(raw?.friends) ? raw.friends : []
		friends.value = friendsList.map((friend) => ({
			id: friend.id,
			username: friend.username,
			email: friend.email,
			isOnline: friend.isOnline,
			lastSeen: friend.lastSeen
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
			<ChatActionsHeader
				:is-group-chat="isGroupChat"
				:is-owner="isOwner"
				@close="handleToggleState"
			/>

			<div class="flex-1 overflow-y-auto bg-white rounded-b-[1.125rem]">
				<template v-if="!isGroupChat && chat?.otherUser">
					<UserInfoSection :user="chat.otherUser" />
				</template>

				<PinnedMessagesList
					:pinned-messages="pinnedMessagesList"
					:is-loading="pinnedMessagesLoading"
					@message-click="handlePinnedMessageClick"
				/>

				<template v-if="isGroupChat && isOwner">
					<AddUserSection
						:available-friends="availableFriends"
						:is-adding-user="isAddingUser"
						@add-user="handleAddUserFromSection"
						@add-user-click="handleAddUserClick"
					/>

					<ChatMembersList
						:members="members"
						:current-user-id="currentUserId"
						:is-owner="isOwner"
						:is-loading="chatDetailsLoading"
						:open-role-menu-id="openRoleMenuId"
						:is-updating-role="isUpdatingRole"
						:is-removing-user="isRemovingUser"
						@toggle-role-menu="handleToggleRoleMenu"
						@change-role="handleChangeRole"
						@remove-user="handleRemoveUser"
					/>
				</template>

				<template v-else-if="isGroupChat">
					<ChatMembersList
						:members="members"
						:current-user-id="currentUserId"
						:is-owner="false"
						:is-loading="chatDetailsLoading"
						:open-role-menu-id="null"
						:is-updating-role="null"
						:is-removing-user="null"
					/>
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
