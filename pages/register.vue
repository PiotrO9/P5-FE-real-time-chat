<script setup lang="ts">
import type { RegisterData } from '~/types/auth'

definePageMeta({
	middleware: 'guest'
})

const { register, isLoading, error, clearError } = useAuth()
const toast = useToast()

const formData = reactive<RegisterData>({
	email: '',
	username: '',
	password: ''
})

const confirmPassword = ref('')

const validationErrors = reactive({
	email: '',
	username: '',
	password: '',
	confirmPassword: ''
})

function validateEmail(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
	return emailRegex.test(email)
}

function validateForm(): boolean {
	let isValid = true
	clearError()

	// Email validation
	if (!formData.email) {
		validationErrors.email = 'Email jest wymagany'
		isValid = false
	} else if (!validateEmail(formData.email)) {
		validationErrors.email = 'Nieprawidłowy format email'
		isValid = false
	} else {
		validationErrors.email = ''
	}

	// Username validation
	if (!formData.username) {
		validationErrors.username = 'Nazwa użytkownika jest wymagana'
		isValid = false
	} else if (formData.username.length < 3 || formData.username.length > 30) {
		validationErrors.username = 'Nazwa użytkownika musi mieć 3-30 znaków'
		isValid = false
	} else {
		validationErrors.username = ''
	}

	// Password validation
	if (!formData.password) {
		validationErrors.password = 'Hasło jest wymagane'
		isValid = false
	} else if (formData.password.length < 6 || formData.password.length > 100) {
		validationErrors.password = 'Hasło musi mieć 6-100 znaków'
		isValid = false
	} else {
		validationErrors.password = ''
	}

	// Confirm password validation
	if (!confirmPassword.value) {
		validationErrors.confirmPassword = 'Potwierdzenie hasła jest wymagane'
		isValid = false
	} else if (confirmPassword.value !== formData.password) {
		validationErrors.confirmPassword = 'Hasła nie są zgodne'
		isValid = false
	} else {
		validationErrors.confirmPassword = ''
	}

	return isValid
}

function handleBlurEmail(): void {
	if (formData.email && !validateEmail(formData.email)) {
		validationErrors.email = 'Nieprawidłowy format email'
	} else {
		validationErrors.email = ''
	}
}

function handleBlurUsername(): void {
	if (formData.username && (formData.username.length < 3 || formData.username.length > 30)) {
		validationErrors.username = 'Nazwa użytkownika musi mieć 3-30 znaków'
	} else {
		validationErrors.username = ''
	}
}

function handleBlurPassword(): void {
	if (formData.password && (formData.password.length < 6 || formData.password.length > 100)) {
		validationErrors.password = 'Hasło musi mieć 6-100 znaków'
	} else {
		validationErrors.password = ''
	}
}

function handleBlurConfirmPassword(): void {
	if (confirmPassword.value && confirmPassword.value !== formData.password) {
		validationErrors.confirmPassword = 'Hasła nie są zgodne'
	} else {
		validationErrors.confirmPassword = ''
	}
}

async function handleSubmit(): Promise<void> {
	if (!validateForm()) {
		return
	}

	const success = await register(formData)

	if (success) {
		toast.success('Rejestracja pomyślna! Możesz się teraz zalogować.')
		await navigateTo('/login')
	} else if (error.value) {
		toast.error(error.value)
	}
}

function handleKeyDown(event: KeyboardEvent): void {
	if (event.key === 'Enter') {
		event.preventDefault()
		handleSubmit()
	}
}
</script>

<template>
	<div class="min-h-screen flex items-center justify-center px-4 py-12">
		<div class="max-w-md w-full">
			<div class="bg-white rounded-lg shadow-lg p-8">
				<div class="text-center mb-8">
					<h1 class="text-3xl font-bold text-gray-900 mb-2">Rejestracja</h1>
					<p class="text-gray-600">Utwórz nowe konto</p>
				</div>

				<form class="space-y-6" @submit.prevent="handleSubmit">
					<!-- Email -->
					<div>
						<label for="email" class="block text-sm font-medium text-gray-700 mb-2">
							Email
						</label>
						<input
							id="email"
							v-model="formData.email"
							type="email"
							autocomplete="email"
							:disabled="isLoading"
							class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
							:class="{
								'border-red-500': validationErrors.email,
								'border-gray-300': !validationErrors.email
							}"
							placeholder="twoj@email.com"
							@blur="handleBlurEmail"
						/>
						<p
							v-if="validationErrors.email"
							class="mt-1 text-sm text-red-600"
							role="alert"
						>
							{{ validationErrors.email }}
						</p>
					</div>

					<!-- Username -->
					<div>
						<label for="username" class="block text-sm font-medium text-gray-700 mb-2">
							Nazwa użytkownika
						</label>
						<input
							id="username"
							v-model="formData.username"
							type="text"
							autocomplete="username"
							:disabled="isLoading"
							class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
							:class="{
								'border-red-500': validationErrors.username,
								'border-gray-300': !validationErrors.username
							}"
							placeholder="3-30 znaków"
							@blur="handleBlurUsername"
						/>
						<p
							v-if="validationErrors.username"
							class="mt-1 text-sm text-red-600"
							role="alert"
						>
							{{ validationErrors.username }}
						</p>
					</div>

					<!-- Password -->
					<div>
						<label for="password" class="block text-sm font-medium text-gray-700 mb-2">
							Hasło
						</label>
						<input
							id="password"
							v-model="formData.password"
							type="password"
							autocomplete="new-password"
							:disabled="isLoading"
							class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
							:class="{
								'border-red-500': validationErrors.password,
								'border-gray-300': !validationErrors.password
							}"
							placeholder="6-100 znaków"
							@blur="handleBlurPassword"
							@keydown="handleKeyDown"
						/>
						<p
							v-if="validationErrors.password"
							class="mt-1 text-sm text-red-600"
							role="alert"
						>
							{{ validationErrors.password }}
						</p>
					</div>

					<!-- Confirm Password -->
					<div>
						<label
							for="confirm-password"
							class="block text-sm font-medium text-gray-700 mb-2"
						>
							Potwierdź hasło
						</label>
						<input
							id="confirm-password"
							v-model="confirmPassword"
							type="password"
							autocomplete="new-password"
							:disabled="isLoading"
							class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
							:class="{
								'border-red-500': validationErrors.confirmPassword,
								'border-gray-300': !validationErrors.confirmPassword
							}"
							placeholder="Powtórz hasło"
							@blur="handleBlurConfirmPassword"
							@keydown="handleKeyDown"
						/>
						<p
							v-if="validationErrors.confirmPassword"
							class="mt-1 text-sm text-red-600"
							role="alert"
						>
							{{ validationErrors.confirmPassword }}
						</p>
					</div>

					<!-- Submit Button -->
					<button
						type="submit"
						:disabled="isLoading"
						class="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
					>
						<svg
							v-if="isLoading"
							class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
						{{ isLoading ? 'Rejestrowanie...' : 'Zarejestruj się' }}
					</button>
				</form>

				<!-- Login Link -->
				<div class="mt-6 text-center">
					<p class="text-gray-600">
						Masz już konto?
						<NuxtLink
							to="/login"
							class="text-blue-600 hover:text-blue-700 font-medium hover:underline"
						>
							Zaloguj się
						</NuxtLink>
					</p>
				</div>
			</div>
		</div>
	</div>
</template>
