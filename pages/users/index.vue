<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'
import { useToast } from '~/composables/useToast'
import { useUser } from '~/composables/useUser'
import type { User } from '~/types/auth'

definePageMeta({
	middleware: 'auth'
})

const { user: currentUser } = useAuth()
const { getAllUsers, getUserStatus } = useUser()
const toast = useToast()

const users = ref<User[]>([])
const pagination = ref({
	currentPage: 1,
	totalPages: 1,
	totalUsers: 0,
	hasNext: false,
	hasPrev: false
})

const isLoading = ref(false)
const currentPage = ref(1)
const limit = 10

// Store user statuses
const userStatuses = ref<Record<string, 'online' | 'offline'>>({})

async function loadUsers(page: number): Promise<void> {
	try {
		isLoading.value = true
		const response = await getAllUsers(page, limit)

		if (response) {
			users.value = response.users
			pagination.value = response.pagination
			currentPage.value = page

			// Load statuses for all users
			await loadUserStatuses(response.users)
		} else {
			toast.error('Błąd podczas ładowania użytkowników')
		}
	} catch (err) {
		toast.error('Błąd podczas ładowania użytkowników')
		console.error('Load users error:', err)
	} finally {
		isLoading.value = false
	}
}

async function loadUserStatuses(usersList: User[]): Promise<void> {
	const statusPromises = usersList.map(async (user) => {
		const status = await getUserStatus(user.id)
		if (status) {
			userStatuses.value[user.id] = status
		}
	})

	await Promise.all(statusPromises)
}

async function handlePreviousPage(): Promise<void> {
	if (pagination.value.hasPrev) {
		await loadUsers(currentPage.value - 1)
	}
}

async function handleNextPage(): Promise<void> {
	if (pagination.value.hasNext) {
		await loadUsers(currentPage.value + 1)
	}
}

function handleKeyDownPrevious(event: KeyboardEvent): void {
	if ((event.key === 'Enter' || event.key === ' ') && pagination.value.hasPrev) {
		event.preventDefault()
		handlePreviousPage()
	}
}

function handleKeyDownNext(event: KeyboardEvent): void {
	if ((event.key === 'Enter' || event.key === ' ') && pagination.value.hasNext) {
		event.preventDefault()
		handleNextPage()
	}
}

function getInitials(username: string): string {
	return username
		.split(' ')
		.map((n) => n[0])
		.join('')
		.toUpperCase()
		.slice(0, 2)
}

function formatDate(date: Date | null): string {
	if (!date) return 'Nigdy'
	return new Date(date).toLocaleDateString('pl-PL', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	})
}

function getStatusBadgeClasses(status: 'online' | 'offline'): string {
	return status === 'online'
		? 'bg-green-100 text-green-800 border-green-200'
		: 'bg-gray-100 text-gray-800 border-gray-200'
}

// Load initial data
onMounted(() => {
	loadUsers(1)
})
</script>

<template>
	<div class="min-h-screen bg-gray-50 py-8 px-4">
		<div class="max-w-6xl mx-auto">
			<!-- Header -->
			<div class="bg-white rounded-lg shadow-lg p-6 mb-6">
				<div class="flex items-center justify-between flex-wrap gap-4">
					<div>
						<h1 class="text-3xl font-bold text-gray-900 mb-2">Użytkownicy</h1>
						<p class="text-gray-600">
							Wyświetlanie {{ users.length }} z
							{{ pagination.totalUsers }} użytkowników
						</p>
					</div>
					<NuxtLink
						to="/dashboard"
						class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
					>
						Powrót do panelu
					</NuxtLink>
				</div>
			</div>

			<!-- Loading State -->
			<div v-if="isLoading" class="bg-white rounded-lg shadow-lg p-12 text-center">
				<div class="flex justify-center items-center">
					<svg
						class="animate-spin h-12 w-12 text-blue-600"
						fill="none"
						viewBox="0 0 24 24"
					>
						<circle
							class="opacity-25"
							cx="12"
							cy="12"
							r="10"
							stroke="currentColor"
							stroke-width="4"
						/>
						<path
							class="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						/>
					</svg>
				</div>
				<p class="mt-4 text-gray-600">Ładowanie użytkowników...</p>
			</div>

			<!-- Users List -->
			<div v-else-if="users.length > 0" class="space-y-4">
				<div
					v-for="user in users"
					:key="user.id"
					class="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
				>
					<div class="flex items-center justify-between flex-wrap gap-4">
						<div class="flex items-center gap-4">
							<!-- Avatar -->
							<div
								class="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg"
							>
								{{ getInitials(user.username) }}
							</div>

							<!-- User Info -->
							<div>
								<div class="flex items-center gap-2">
									<h3 class="text-lg font-bold text-gray-900">
										{{ user.username }}
									</h3>
									<span
										v-if="currentUser?.id === user.id"
										class="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full font-medium"
									>
										Ty
									</span>
								</div>
								<p class="text-gray-600">{{ user.email }}</p>
								<p class="text-sm text-gray-500">
									Ostatnia aktywność: {{ formatDate(user.lastSeen) }}
								</p>
							</div>
						</div>

						<div class="flex items-center gap-3">
							<!-- Status Badge -->
							<span
								:class="getStatusBadgeClasses(getUserStatus(user.id))"
								class="px-3 py-1 text-sm font-medium rounded-full border"
							>
								<span
									:class="{
										'bg-green-500': getUserStatus(user.id) === 'online',
										'bg-gray-500': getUserStatus(user.id) === 'offline'
									}"
									class="inline-block w-2 h-2 rounded-full mr-2"
								/>
								{{ getUserStatus(user.id) === 'online' ? 'Online' : 'Offline' }}
							</span>

							<!-- View Profile Button -->
							<NuxtLink
								:to="`/users/${user.id}`"
								class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium rounded-lg transition-colors"
							>
								Zobacz profil
							</NuxtLink>
						</div>
					</div>
				</div>
			</div>

			<!-- Empty State -->
			<div v-else class="bg-white rounded-lg shadow-lg p-12 text-center">
				<p class="text-gray-600">Brak użytkowników do wyświetlenia</p>
			</div>

			<!-- Pagination -->
			<div
				v-if="!isLoading && users.length > 0"
				class="mt-6 bg-white rounded-lg shadow-lg p-6"
			>
				<div class="flex items-center justify-between flex-wrap gap-4">
					<div class="text-gray-600">
						Strona {{ pagination.currentPage }} z {{ pagination.totalPages }}
					</div>

					<div class="flex gap-3">
						<button
							type="button"
							:disabled="!pagination.hasPrev"
							class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium rounded-lg transition-colors disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
							:aria-label="'Poprzednia strona'"
							tabindex="0"
							@click="handlePreviousPage"
							@keydown="handleKeyDownPrevious"
						>
							Poprzednia
						</button>

						<button
							type="button"
							:disabled="!pagination.hasNext"
							class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
							:aria-label="'Następna strona'"
							tabindex="0"
							@click="handleNextPage"
							@keydown="handleKeyDownNext"
						>
							Następna
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
