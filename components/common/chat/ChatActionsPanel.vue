<script setup lang="ts">
import type { Chat, Friend } from '~/types/Chat'
import type { ChatMember, Role } from '~/types/ChatsApi'
import type { FriendResponse } from '~/types/FriendsApi'
import {
	addChatMembers,
	removeChatMembers,
	fetchChatDetails as fetchChatDetailsFromService,
	updateChatMemberRole
} from '~/services/chatService'
import { fetchFriends as fetchFriendsFromService } from '~/services/friendsService'
import { useToast } from '~/composables/useToast'
import Icon from '../Icon.vue'
import Dialog from '../Dialog.vue'

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
const members = computed(() => chat.value?.members ?? [])
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
	}
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

function getAvailableRoles(currentRole: Role): Role[] {
	if (currentRole === 'OWNER') {
		return []
	}

	return ['MEMBER', 'MODERATOR']
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

function getRoleColor(role: Role): string {
	switch (role) {
		case 'OWNER':
			return 'bg-purple-100 text-purple-700 border-purple-300'
		case 'MODERATOR':
			return 'bg-blue-100 text-blue-700 border-blue-300'
		case 'MEMBER':
			return 'bg-gray-100 text-gray-700 border-gray-300'
		default:
			return 'bg-gray-100 text-gray-700 border-gray-300'
	}
}

function handleToggleState() {
	chatStore.closeChatDetails()
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
		const apiRole = newRole === 'MEMBER' ? 'USER' : newRole
		await updateChatMemberRole(
			chat.value.id,
			String(memberId),
			apiRole as 'USER' | 'MODERATOR' | 'OWNER'
		)
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
	<aside v-if="chat && isGroupChat" class="md:min-w-96 bg-white flex flex-col">
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
					{{ isOwner ? 'Manage chat members' : 'Chat members' }}
				</p>
			</div>

			<div class="flex-1 overflow-y-auto bg-white rounded-b-[1.125rem]">
				<template v-if="isOwner">
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
							<div
								v-for="member in members"
								:key="member.id"
								class="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
							>
								<div class="flex items-center gap-2 flex-1 min-w-0">
									<div
										class="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold flex-shrink-0"
									>
										{{ member.username.charAt(0).toUpperCase() }}
									</div>
									<div class="min-w-0 flex-1">
										<p class="text-sm font-medium text-gray-900 truncate">
											{{ member.username }}
										</p>
										<div class="flex items-center gap-2 mt-0.5">
											<div class="role-menu-container relative">
												<!-- Debug info -->
												<!-- Member role: {{ member.role }}, ID: {{ member.id }} -->
												<button
													v-if="member.role !== 'OWNER'"
													type="button"
													tabindex="0"
													:aria-label="`Change role of ${member.username}`"
													:disabled="isUpdatingRole === String(member.id)"
													:style="{ pointerEvents: 'auto', zIndex: 100 }"
													:class="[
														'px-2 py-0.5 text-xs font-medium rounded border cursor-pointer transition-colors',
														getRoleColor(member.role),
														isUpdatingRole === String(member.id)
															? 'opacity-50 cursor-not-allowed'
															: 'hover:opacity-80'
													]"
													@mousedown.stop="
														(e) => {
															e.stopPropagation()
															e.preventDefault()
															handleToggleRoleMenu(
																String(member.id),
																e
															)
														}
													"
													@click.stop="
														(e) => {
															console.log('Button click event:', e)
															e.stopPropagation()
															e.preventDefault()
															handleToggleRoleMenu(
																String(member.id),
																e
															)
														}
													"
													@keydown.enter.stop="
														(e) => {
															e.stopPropagation()
															e.preventDefault()
															handleToggleRoleMenu(
																String(member.id),
																e
															)
														}
													"
												>
													{{ getRoleLabel(member.role) }}
												</button>
												<span
													v-else
													:class="[
														'px-2 py-0.5 text-xs font-medium rounded border',
														getRoleColor(member.role)
													]"
												>
													{{ getRoleLabel(member.role) }}
												</span>
												<div
													v-if="
														openRoleMenuId === String(member.id) &&
														member.role !== 'OWNER'
													"
													class="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-32"
												>
													<button
														v-for="role in getAvailableRoles(
															member.role
														)"
														:key="role"
														type="button"
														tabindex="0"
														:aria-label="`Set role to ${getRoleLabel(role)}`"
														:disabled="
															isUpdatingRole === String(member.id) ||
															member.role === role
														"
														:class="[
															'w-full text-left px-3 py-2 text-sm transition-colors',
															member.role === role
																? 'bg-gray-100 text-gray-500 cursor-not-allowed'
																: 'hover:bg-gray-50 text-gray-900',
															isUpdatingRole === String(member.id)
																? 'opacity-50 cursor-not-allowed'
																: ''
														]"
														@click.stop="
															handleChangeRole(
																String(member.id),
																role
															)
														"
														@keydown.enter.stop="
															handleChangeRole(
																String(member.id),
																role
															)
														"
													>
														{{ getRoleLabel(role) }}
													</button>
												</div>
											</div>
											<span
												v-if="member.isOnline"
												class="h-1.5 w-1.5 rounded-full bg-green-500"
												aria-label="Online"
											></span>
										</div>
									</div>
								</div>
								<div class="flex items-center gap-1">
									<button
										v-if="String(member.id) !== String(currentUserId)"
										type="button"
										tabindex="0"
										:aria-label="`Remove ${member.username} from chat`"
										:disabled="isRemovingUser === String(member.id)"
										class="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
										@click="handleRemoveUser(String(member.id))"
										@keydown.enter="handleRemoveUser(String(member.id))"
									>
										<Icon name="bin" class="h-4 w-4" />
									</button>
								</div>
							</div>
						</div>
					</div>
				</template>

				<template v-else>
					<div class="p-4">
						<h3 class="text-sm font-semibold text-gray-900 mb-3">
							Members ({{ members.length }})
						</h3>
						<div v-if="chatDetailsLoading" class="text-sm text-gray-600">
							Loading...
						</div>
						<div v-else class="space-y-2">
							<div
								v-for="member in members"
								:key="member.id"
								class="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
							>
								<div
									class="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold flex-shrink-0"
								>
									{{ member.username.charAt(0).toUpperCase() }}
								</div>
								<div class="min-w-0 flex-1">
									<p class="text-sm font-medium text-gray-900 truncate">
										{{ member.username }}
									</p>
									<div class="flex items-center gap-2 mt-0.5">
										<span
											:class="[
												'px-2 py-0.5 text-xs font-medium rounded border',
												getRoleColor(member.role)
											]"
										>
											{{ getRoleLabel(member.role) }}
										</span>
										<span
											v-if="member.isOnline"
											class="h-1.5 w-1.5 rounded-full bg-green-500"
											aria-label="Online"
										></span>
									</div>
								</div>
							</div>
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
