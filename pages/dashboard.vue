<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'
import { useToast } from '~/composables/useToast'
import { useUser } from '~/composables/useUser'
import type { UpdateProfileData, UpdatePasswordData } from '~/types/user'

definePageMeta({
	middleware: 'auth'
})

const { user, logout, checkAuth } = useAuth()
const { updateProfile, updatePassword, isLoading, error, clearError } = useUser()
const toast = useToast()

// Profile Edit Form
const profileFormData = reactive<UpdateProfileData>({
	username: '',
	email: ''
})

const profileValidationErrors = reactive({
	username: '',
	email: ''
})

// Password Change Form
const passwordFormData = reactive<UpdatePasswordData & { confirmPassword: string }>({
	currentPassword: '',
	newPassword: '',
	confirmPassword: ''
})

const passwordValidationErrors = reactive({
	currentPassword: '',
	newPassword: '',
	confirmPassword: ''
})

const showPasswordForm = ref(false)

// Initialize profile form with current user data
onMounted(() => {
	if (user.value) {
		profileFormData.username = user.value.username
		profileFormData.email = user.value.email
	}
})

watch(user, (newUser) => {
	if (newUser) {
		profileFormData.username = newUser.username
		profileFormData.email = newUser.email
	}
})

// Profile validation
function validateEmail(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
	return emailRegex.test(email)
}

function validateProfileForm(): boolean {
	let isValid = true
	clearError()

	// Username validation
	if (!profileFormData.username) {
		profileValidationErrors.username = 'Nazwa użytkownika jest wymagana'
		isValid = false
	} else if (profileFormData.username.length < 3 || profileFormData.username.length > 30) {
		profileValidationErrors.username = 'Nazwa użytkownika musi mieć 3-30 znaków'
		isValid = false
	} else {
		profileValidationErrors.username = ''
	}

	// Email validation
	if (!profileFormData.email) {
		profileValidationErrors.email = 'Email jest wymagany'
		isValid = false
	} else if (!validateEmail(profileFormData.email)) {
		profileValidationErrors.email = 'Nieprawidłowy format email'
		isValid = false
	} else {
		profileValidationErrors.email = ''
	}

	return isValid
}

function handleBlurProfileUsername(): void {
	if (
		profileFormData.username &&
		(profileFormData.username.length < 3 || profileFormData.username.length > 30)
	) {
		profileValidationErrors.username = 'Nazwa użytkownika musi mieć 3-30 znaków'
	} else {
		profileValidationErrors.username = ''
	}
}

function handleBlurProfileEmail(): void {
	if (profileFormData.email && !validateEmail(profileFormData.email)) {
		profileValidationErrors.email = 'Nieprawidłowy format email'
	} else {
		profileValidationErrors.email = ''
	}
}

async function handleUpdateProfile(): Promise<void> {
	if (!validateProfileForm() || !user.value) {
		return
	}

	const updatedUser = await updateProfile(user.value.id, profileFormData)

	if (updatedUser) {
		toast.success('Profil zaktualizowany pomyślnie!')
		await checkAuth() // Refresh user data
	} else if (error.value) {
		toast.error(error.value)
	}
}

// Password validation
function validatePasswordForm(): boolean {
	let isValid = true
	clearError()

	// Current password
	if (!passwordFormData.currentPassword) {
		passwordValidationErrors.currentPassword = 'Obecne hasło jest wymagane'
		isValid = false
	} else {
		passwordValidationErrors.currentPassword = ''
	}

	// New password (strong validation)
	const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
	if (!passwordFormData.newPassword) {
		passwordValidationErrors.newPassword = 'Nowe hasło jest wymagane'
		isValid = false
	} else if (!passwordRegex.test(passwordFormData.newPassword)) {
		passwordValidationErrors.newPassword =
			'Hasło musi mieć min. 8 znaków, 1 wielką literę, 1 małą, 1 cyfrę i 1 znak specjalny'
		isValid = false
	} else {
		passwordValidationErrors.newPassword = ''
	}

	// Confirm password
	if (!passwordFormData.confirmPassword) {
		passwordValidationErrors.confirmPassword = 'Potwierdzenie hasła jest wymagane'
		isValid = false
	} else if (passwordFormData.confirmPassword !== passwordFormData.newPassword) {
		passwordValidationErrors.confirmPassword = 'Hasła nie są zgodne'
		isValid = false
	} else {
		passwordValidationErrors.confirmPassword = ''
	}

	return isValid
}

function handleBlurNewPassword(): void {
	const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
	if (passwordFormData.newPassword && !passwordRegex.test(passwordFormData.newPassword)) {
		passwordValidationErrors.newPassword =
			'Hasło musi mieć min. 8 znaków, 1 wielką literę, 1 małą, 1 cyfrę i 1 znak specjalny'
	} else {
		passwordValidationErrors.newPassword = ''
	}
}

function handleBlurConfirmNewPassword(): void {
	if (
		passwordFormData.confirmPassword &&
		passwordFormData.confirmPassword !== passwordFormData.newPassword
	) {
		passwordValidationErrors.confirmPassword = 'Hasła nie są zgodne'
	} else {
		passwordValidationErrors.confirmPassword = ''
	}
}

async function handleUpdatePassword(): Promise<void> {
	if (!validatePasswordForm() || !user.value) {
		return
	}

	const { currentPassword, newPassword } = passwordFormData
	const success = await updatePassword(user.value.id, { currentPassword, newPassword })

	if (success) {
		toast.success('Hasło zmienione pomyślnie!')
		// Reset form
		passwordFormData.currentPassword = ''
		passwordFormData.newPassword = ''
		passwordFormData.confirmPassword = ''
		showPasswordForm.value = false
	} else if (error.value) {
		toast.error(error.value)
	}
}

function handleTogglePasswordForm(): void {
	showPasswordForm.value = !showPasswordForm.value
	if (!showPasswordForm.value) {
		// Reset form when closing
		passwordFormData.currentPassword = ''
		passwordFormData.newPassword = ''
		passwordFormData.confirmPassword = ''
		passwordValidationErrors.currentPassword = ''
		passwordValidationErrors.newPassword = ''
		passwordValidationErrors.confirmPassword = ''
	}
}

async function handleLogout(): Promise<void> {
	await logout()
	toast.info('Zostałeś wylogowany')
	await navigateTo('/login')
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
</script>

<template>
	<div class="min-h-screen bg-gray-50 py-8 px-4">
		<div class="max-w-4xl mx-auto">
			<!-- Header -->
			<div class="bg-white rounded-lg shadow-lg p-6 mb-6">
				<div class="flex items-center justify-between flex-wrap gap-4">
					<div>
						<h1 class="text-3xl font-bold text-gray-900 mb-2">Panel użytkownika</h1>
						<p class="text-gray-600">Zarządzaj swoim profilem i ustawieniami</p>
					</div>
					<div class="flex gap-3">
						<NuxtLink
							to="/users"
							class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
						>
							Lista użytkowników
						</NuxtLink>
						<button
							type="button"
							class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
							@click="handleLogout"
						>
							Wyloguj
						</button>
					</div>
				</div>
			</div>

			<!-- User Info -->
			<div v-if="user" class="bg-white rounded-lg shadow-lg p-6 mb-6">
				<h2 class="text-xl font-bold text-gray-900 mb-4">Informacje o koncie</h2>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<p class="text-sm text-gray-600">ID użytkownika</p>
						<p class="font-medium text-gray-900">{{ user.id }}</p>
					</div>
					<div>
						<p class="text-sm text-gray-600">Data utworzenia</p>
						<p class="font-medium text-gray-900">{{ formatDate(user.createdAt) }}</p>
					</div>
					<div>
						<p class="text-sm text-gray-600">Ostatnia aktywność</p>
						<p class="font-medium text-gray-900">{{ formatDate(user.lastSeen) }}</p>
					</div>
				</div>
			</div>

			<!-- Edit Profile -->
			<div class="bg-white rounded-lg shadow-lg p-6 mb-6">
				<h2 class="text-xl font-bold text-gray-900 mb-4">Edytuj profil</h2>
				<form class="space-y-4" @submit.prevent="handleUpdateProfile">
					<!-- Username -->
					<div>
						<label for="username" class="block text-sm font-medium text-gray-700 mb-2">
							Nazwa użytkownika
						</label>
						<input
							id="username"
							v-model="profileFormData.username"
							type="text"
							:disabled="isLoading"
							class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
							:class="{
								'border-red-500': profileValidationErrors.username,
								'border-gray-300': !profileValidationErrors.username
							}"
							@blur="handleBlurProfileUsername"
						/>
						<p
							v-if="profileValidationErrors.username"
							class="mt-1 text-sm text-red-600"
							role="alert"
						>
							{{ profileValidationErrors.username }}
						</p>
					</div>

					<!-- Email -->
					<div>
						<label for="email" class="block text-sm font-medium text-gray-700 mb-2">
							Email
						</label>
						<input
							id="email"
							v-model="profileFormData.email"
							type="email"
							:disabled="isLoading"
							class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
							:class="{
								'border-red-500': profileValidationErrors.email,
								'border-gray-300': !profileValidationErrors.email
							}"
							@blur="handleBlurProfileEmail"
						/>
						<p
							v-if="profileValidationErrors.email"
							class="mt-1 text-sm text-red-600"
							role="alert"
						>
							{{ profileValidationErrors.email }}
						</p>
					</div>

					<button
						type="submit"
						:disabled="isLoading"
						class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
					>
						{{ isLoading ? 'Zapisywanie...' : 'Zapisz zmiany' }}
					</button>
				</form>
			</div>

			<!-- Change Password -->
			<div class="bg-white rounded-lg shadow-lg p-6">
				<div class="flex items-center justify-between mb-4">
					<h2 class="text-xl font-bold text-gray-900">Zmiana hasła</h2>
					<button
						type="button"
						class="text-blue-600 hover:text-blue-700 font-medium"
						@click="handleTogglePasswordForm"
					>
						{{ showPasswordForm ? 'Anuluj' : 'Zmień hasło' }}
					</button>
				</div>

				<form
					v-if="showPasswordForm"
					class="space-y-4"
					@submit.prevent="handleUpdatePassword"
				>
					<!-- Current Password -->
					<div>
						<label
							for="current-password"
							class="block text-sm font-medium text-gray-700 mb-2"
						>
							Obecne hasło
						</label>
						<input
							id="current-password"
							v-model="passwordFormData.currentPassword"
							type="password"
							autocomplete="current-password"
							:disabled="isLoading"
							class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
							:class="{
								'border-red-500': passwordValidationErrors.currentPassword,
								'border-gray-300': !passwordValidationErrors.currentPassword
							}"
						/>
						<p
							v-if="passwordValidationErrors.currentPassword"
							class="mt-1 text-sm text-red-600"
							role="alert"
						>
							{{ passwordValidationErrors.currentPassword }}
						</p>
					</div>

					<!-- New Password -->
					<div>
						<label
							for="new-password"
							class="block text-sm font-medium text-gray-700 mb-2"
						>
							Nowe hasło
						</label>
						<input
							id="new-password"
							v-model="passwordFormData.newPassword"
							type="password"
							autocomplete="new-password"
							:disabled="isLoading"
							class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
							:class="{
								'border-red-500': passwordValidationErrors.newPassword,
								'border-gray-300': !passwordValidationErrors.newPassword
							}"
							@blur="handleBlurNewPassword"
						/>
						<p
							v-if="passwordValidationErrors.newPassword"
							class="mt-1 text-sm text-red-600"
							role="alert"
						>
							{{ passwordValidationErrors.newPassword }}
						</p>
					</div>

					<!-- Confirm New Password -->
					<div>
						<label
							for="confirm-new-password"
							class="block text-sm font-medium text-gray-700 mb-2"
						>
							Potwierdź nowe hasło
						</label>
						<input
							id="confirm-new-password"
							v-model="passwordFormData.confirmPassword"
							type="password"
							autocomplete="new-password"
							:disabled="isLoading"
							class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
							:class="{
								'border-red-500': passwordValidationErrors.confirmPassword,
								'border-gray-300': !passwordValidationErrors.confirmPassword
							}"
							@blur="handleBlurConfirmNewPassword"
						/>
						<p
							v-if="passwordValidationErrors.confirmPassword"
							class="mt-1 text-sm text-red-600"
							role="alert"
						>
							{{ passwordValidationErrors.confirmPassword }}
						</p>
					</div>

					<button
						type="submit"
						:disabled="isLoading"
						class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
					>
						{{ isLoading ? 'Zmienianie...' : 'Zmień hasło' }}
					</button>
				</form>
			</div>
		</div>
	</div>
</template>
