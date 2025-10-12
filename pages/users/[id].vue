<script setup lang="ts">
import type { User } from '~/types/auth'

definePageMeta({
	middleware: 'auth'
})

const route = useRoute()
const { user: currentUser } = useAuth()
const { getUserProfile, getUserStatus } = useUser()
const toast = useToast()

const user = ref<User | null>(null)
const userStatus = ref<'online' | 'offline'>('offline')
const isLoading = ref(true)

const userId = computed(() => route.params.id as string)
const isOwnProfile = computed(() => currentUser.value?.id === userId.value)

async function loadUserProfile(): Promise<void> {
	try {
		isLoading.value = true

		const [profile, status] = await Promise.all([
			getUserProfile(userId.value),
			getUserStatus(userId.value)
		])

		if (profile) {
			user.value = profile
		} else {
			toast.error('Nie znaleziono użytkownika')
		}

		if (status) {
			userStatus.value = status
		}
	} catch (err) {
		toast.error('Błąd podczas ładowania profilu')
		console.error('Load user profile error:', err)
	} finally {
		isLoading.value = false
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
		month: 'long',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	})
}

function getStatusBadgeClasses(): string {
	return userStatus.value === 'online'
		? 'bg-green-100 text-green-800 border-green-200'
		: 'bg-gray-100 text-gray-800 border-gray-200'
}

function handleNavigateToDashboard(): void {
	navigateTo('/dashboard')
}

function handleNavigateToUsers(): void {
	navigateTo('/users')
}

// Load user data on mount and when route changes
onMounted(() => {
	loadUserProfile()
})

watch(
	() => route.params.id,
	() => {
		if (route.params.id) {
			loadUserProfile()
		}
	}
)
</script>

<template>
	<div class="min-h-screen bg-gray-50 py-8 px-4">
		<div class="max-w-4xl mx-auto">
			<!-- Header -->
			<div class="mb-6">
				<button
					type="button"
					class="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 mb-4"
					@click="handleNavigateToUsers"
				>
					<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
						<path
							fill-rule="evenodd"
							d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
							clip-rule="evenodd"
						/>
					</svg>
					Powrót do listy użytkowników
				</button>
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
				<p class="mt-4 text-gray-600">Ładowanie profilu...</p>
			</div>

			<!-- User Profile -->
			<div v-else-if="user" class="space-y-6">
				<!-- Profile Header -->
				<div class="bg-white rounded-lg shadow-lg p-8">
					<div class="flex flex-col items-center text-center">
						<!-- Avatar -->
						<div
							class="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-3xl mb-4"
						>
							{{ getInitials(user.username) }}
						</div>

						<!-- Username and Status -->
						<div class="mb-2">
							<h1 class="text-3xl font-bold text-gray-900 mb-2">
								{{ user.username }}
							</h1>
							<span
								:class="getStatusBadgeClasses()"
								class="px-4 py-2 text-sm font-medium rounded-full border inline-flex items-center"
							>
								<span
									:class="{
										'bg-green-500': userStatus === 'online',
										'bg-gray-500': userStatus === 'offline'
									}"
									class="inline-block w-2 h-2 rounded-full mr-2"
								/>
								{{ userStatus === 'online' ? 'Online' : 'Offline' }}
							</span>
						</div>

						<!-- Own Profile Badge -->
						<div v-if="isOwnProfile" class="mt-2">
							<span
								class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
							>
								To Twój profil
							</span>
						</div>

						<!-- Email -->
						<p class="text-gray-600 mt-4 text-lg">{{ user.email }}</p>

						<!-- Edit Button (if own profile) -->
						<button
							v-if="isOwnProfile"
							type="button"
							class="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
							@click="handleNavigateToDashboard"
						>
							Edytuj profil
						</button>
					</div>
				</div>

				<!-- Profile Details -->
				<div class="bg-white rounded-lg shadow-lg p-6">
					<h2 class="text-xl font-bold text-gray-900 mb-4">Szczegóły profilu</h2>
					<div class="space-y-4">
						<div
							class="flex justify-between items-center py-3 border-b border-gray-200"
						>
							<span class="text-gray-600 font-medium">ID użytkownika</span>
							<span class="text-gray-900 font-mono text-sm">{{ user.id }}</span>
						</div>

						<div
							class="flex justify-between items-center py-3 border-b border-gray-200"
						>
							<span class="text-gray-600 font-medium">Email</span>
							<span class="text-gray-900">{{ user.email }}</span>
						</div>

						<div
							class="flex justify-between items-center py-3 border-b border-gray-200"
						>
							<span class="text-gray-600 font-medium">Nazwa użytkownika</span>
							<span class="text-gray-900">{{ user.username }}</span>
						</div>

						<div
							class="flex justify-between items-center py-3 border-b border-gray-200"
						>
							<span class="text-gray-600 font-medium">Status</span>
							<span
								:class="{
									'text-green-600': userStatus === 'online',
									'text-gray-600': userStatus === 'offline'
								}"
								class="font-medium"
							>
								{{ userStatus === 'online' ? 'Online' : 'Offline' }}
							</span>
						</div>

						<div
							class="flex justify-between items-center py-3 border-b border-gray-200"
						>
							<span class="text-gray-600 font-medium">Data utworzenia</span>
							<span class="text-gray-900">{{ formatDate(user.createdAt) }}</span>
						</div>

						<div class="flex justify-between items-center py-3">
							<span class="text-gray-600 font-medium">Ostatnia aktywność</span>
							<span class="text-gray-900">{{ formatDate(user.lastSeen) }}</span>
						</div>
					</div>
				</div>

				<!-- Activity Info -->
				<div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg shadow-lg p-6">
					<div class="flex items-start gap-4">
						<div class="flex-shrink-0">
							<svg
								class="w-8 h-8 text-blue-600"
								fill="currentColor"
								viewBox="0 0 20 20"
							>
								<path
									fill-rule="evenodd"
									d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
									clip-rule="evenodd"
								/>
							</svg>
						</div>
						<div>
							<h3 class="font-bold text-gray-900 mb-1">Informacja o aktywności</h3>
							<p class="text-gray-700">
								Użytkownik {{ user.username }} jest
								{{ userStatus === 'online' ? 'obecnie online' : 'offline' }}.
								<span v-if="user.lastSeen">
									Ostatnia aktywność: {{ formatDate(user.lastSeen) }}.
								</span>
							</p>
						</div>
					</div>
				</div>
			</div>

			<!-- Error State -->
			<div v-else class="bg-white rounded-lg shadow-lg p-12 text-center">
				<svg
					class="w-16 h-16 text-gray-400 mx-auto mb-4"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
				<p class="text-gray-600 text-lg">Nie znaleziono użytkownika</p>
				<button
					type="button"
					class="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
					@click="handleNavigateToUsers"
				>
					Powrót do listy użytkowników
				</button>
			</div>
		</div>
	</div>
</template>
