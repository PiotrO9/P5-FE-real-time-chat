<script setup lang="ts">
import type { Chat, Friend } from '~/types/Chat'
import type { ChatMember, Role } from '~/types/ChatsApi'
import {
	addChatMembers,
	removeChatMembers,
	fetchChatDetails as fetchChatDetailsFromService
} from '~/services/chatService'
import { fetchFriends as fetchFriendsFromService } from '~/services/friendsService'
import type { FriendResponse } from '~/types/FriendsApi'
import { useToast } from '~/composables/useToast'

interface Props {
	chat: Chat | null
	currentUserId: number | string
}

const props = defineProps<Props>()

const { success: toastSuccess, error: toastError } = useToast()

const isOpen = defineModel<boolean>({ default: false })

const chat = computed(() => props.chat)
const currentUserId = computed(() => props.currentUserId)

const isGroupChat = computed(() => chat.value?.isGroup ?? false)
const currentUserRole = computed(() => chat.value?.currentUserRole)
const isOwner = computed(() => currentUserRole.value === 'OWNER')
const members = computed(() => chat.value?.members ?? [])

const friends = ref<Friend[]>([])
const friendsLoading = ref(false)
const addUserUsername = ref('')
const isAddingUser = ref(false)
const isRemovingUser = ref<string | null>(null)
const chatDetailsLoading = ref(false)

// Pobierz listę znajomych do dodania
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
		console.error('Błąd pobierania znajomych:', err)
	} finally {
		friendsLoading.value = false
	}
}

// Pobierz szczegóły czatu z członkami
async function fetchChatDetails() {
	if (!chat.value) return

	try {
		chatDetailsLoading.value = true
		const res = await fetchChatDetailsFromService(chat.value.id)
		const data = res?.data

		if (data) {
			// Emituj event do rodzica, żeby zaktualizował chat
			emit('chat-updated', {
				members: data.members || [],
				currentUserRole: data.currentUserRole || data.memberRole
			})
		}
	} catch (err: any) {
		console.error('Błąd pobierania szczegółów czatu:', err)
	} finally {
		chatDetailsLoading.value = false
	}
}

async function handleAddUser() {
	if (!chat.value || !addUserUsername.value.trim()) {
		toastError('Podaj nazwę użytkownika')
		return
	}

	// Znajdź użytkownika w znajomych
	const friend = friends.value.find(
		(f) => f.username.toLowerCase() === addUserUsername.value.trim().toLowerCase()
	)

	if (!friend) {
		toastError('Użytkownik nie znaleziony w znajomych')
		return
	}

	// Sprawdź czy użytkownik już jest w czacie
	const isAlreadyMember = members.value.some((m) => String(m.id) === String(friend.id))
	if (isAlreadyMember) {
		toastError('Użytkownik już jest w czacie')
		return
	}

	try {
		isAddingUser.value = true
		await addChatMembers(chat.value.id, [String(friend.id)])
		toastSuccess(`${friend.username} został dodany do czatu`)
		addUserUsername.value = ''
		await fetchChatDetails()
	} catch (err: any) {
		const errorMessage =
			err?.response?._data?.message || err?.message || 'Nie udało się dodać użytkownika'
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
		toastError('Nie możesz usunąć siebie z czatu')
		return
	}

	try {
		isRemovingUser.value = userId
		await removeChatMembers(chat.value.id, [userId])
		toastSuccess(`${member.username} został usunięty z czatu`)
		await fetchChatDetails()
	} catch (err: any) {
		const errorMessage =
			err?.response?._data?.message || err?.message || 'Nie udało się usunąć użytkownika'
		toastError(errorMessage)
	} finally {
		isRemovingUser.value = null
	}
}

function getRoleLabel(role: Role): string {
	switch (role) {
		case 'OWNER':
			return 'Właściciel'
		case 'MODERATOR':
			return 'Moderator'
		case 'MEMBER':
			return 'Członek'
		default:
			return 'Członek'
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

const availableFriends = computed(() => {
	// Zwróć znajomych, którzy nie są jeszcze w czacie
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

interface Emits {
	(e: 'chat-updated', data: { members: ChatMember[]; currentUserRole?: Role }): void
}

const emit = defineEmits<Emits>()
</script>

<template>
	<Transition name="slide">
		<aside
			v-if="isOpen && chat && isGroupChat"
			class="w-full md:w-80 border-l border-gray-200 bg-white flex flex-col"
		>
			<!-- Header -->
			<div class="p-4 border-b border-gray-200 bg-white/80 backdrop-blur">
				<div class="flex items-center justify-between mb-2">
					<h2 class="text-lg font-semibold text-gray-900">Akcje czatu</h2>
					<button
						type="button"
						tabindex="0"
						aria-label="Zamknij panel akcji"
						class="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
						@click="isOpen = false"
						@keydown.enter="isOpen = false"
						@keydown.space.prevent="isOpen = false"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-5 w-5 text-gray-600"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							stroke-width="2"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>
				<p class="text-sm text-gray-600">
					{{ isOwner ? 'Zarządzaj członkami czatu' : 'Członkowie czatu' }}
				</p>
			</div>

			<!-- Content -->
			<div class="flex-1 overflow-y-auto">
				<!-- Panel dla właściciela -->
				<template v-if="isOwner">
					<!-- Formularz dodawania użytkownika -->
					<div class="p-4 border-b border-gray-200">
						<h3 class="text-sm font-semibold text-gray-900 mb-3">Dodaj użytkownika</h3>
						<div class="space-y-2">
							<label for="add-user-input" class="sr-only">Nazwa użytkownika</label>
							<input
								id="add-user-input"
								v-model="addUserUsername"
								type="text"
								placeholder="Wpisz nazwę użytkownika"
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
								@keydown.enter="handleAddUser"
							/>
							<button
								type="button"
								tabindex="0"
								aria-label="Dodaj użytkownika"
								:disabled="isAddingUser || !addUserUsername.trim()"
								class="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
								@click="handleAddUser"
								@keydown.enter="handleAddUser"
							>
								{{ isAddingUser ? 'Dodawanie...' : 'Dodaj' }}
							</button>
						</div>

						<!-- Lista dostępnych znajomych -->
						<div v-if="availableFriends.length > 0" class="mt-4">
							<p class="text-xs text-gray-600 mb-2">Dostępni znajomi:</p>
							<div class="space-y-1 max-h-32 overflow-y-auto">
								<button
									v-for="friend in availableFriends"
									:key="friend.id"
									type="button"
									tabindex="0"
									:aria-label="`Dodaj ${friend.username} do czatu`"
									class="w-full text-left px-2 py-1.5 text-xs rounded hover:bg-gray-100 transition-colors flex items-center justify-between"
									@click="addUserUsername = friend.username; handleAddUser()"
									@keydown.enter="addUserUsername = friend.username; handleAddUser()"
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

					<!-- Lista członków z możliwością usunięcia -->
					<div class="p-4">
						<h3 class="text-sm font-semibold text-gray-900 mb-3">Członkowie ({{ members.length }})</h3>
						<div v-if="chatDetailsLoading" class="text-sm text-gray-600">
							Ładowanie...
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
								<button
									v-if="String(member.id) !== String(currentUserId)"
									type="button"
									tabindex="0"
									:aria-label="`Usuń ${member.username} z czatu`"
									:disabled="isRemovingUser === String(member.id)"
									class="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
									@click="handleRemoveUser(String(member.id))"
									@keydown.enter="handleRemoveUser(String(member.id))"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="h-4 w-4"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										stroke-width="2"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
										/>
									</svg>
								</button>
							</div>
						</div>
					</div>
				</template>

				<!-- Panel dla zwykłego użytkownika -->
				<template v-else>
					<div class="p-4">
						<h3 class="text-sm font-semibold text-gray-900 mb-3">
							Członkowie ({{ members.length }})
						</h3>
						<div v-if="chatDetailsLoading" class="text-sm text-gray-600">
							Ładowanie...
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
		</aside>
	</Transition>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
	transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
	transform: translateX(100%);
}
</style>

