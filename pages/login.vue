<script setup lang="ts">
import type { LoginCredentials } from '~/types/auth'

definePageMeta({
	middleware: 'guest'
})

const { login, isLoading, error, clearError } = useAuth()
const toast = useToast()

const formData = reactive<LoginCredentials>({
	email: 'test100@post.com',
	password: 'Password100@'
})

const validationErrors = reactive({
	email: '',
	password: ''
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

	// Password validation
	if (!formData.password) {
		validationErrors.password = 'Hasło jest wymagane'
		isValid = false
	} else {
		validationErrors.password = ''
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

function handleBlurPassword(): void {
	if (!formData.password) {
		validationErrors.password = 'Hasło jest wymagane'
	} else {
		validationErrors.password = ''
	}
}

async function handleSubmit(): Promise<void> {
	if (!validateForm()) {
		return
	}

	const success = await login(formData)

	if (success) {
		toast.success('Zalogowano pomyślnie!')
		await navigateTo('/dashboard')
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
					<h1 class="text-3xl font-bold text-gray-900 mb-2">Logowanie</h1>
					<p class="text-gray-600">Witaj ponownie!</p>
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

					<!-- Password -->
					<div>
						<label for="password" class="block text-sm font-medium text-gray-700 mb-2">
							Hasło
						</label>
						<input
							id="password"
							v-model="formData.password"
							type="password"
							autocomplete="current-password"
							:disabled="isLoading"
							class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
							:class="{
								'border-red-500': validationErrors.password,
								'border-gray-300': !validationErrors.password
							}"
							placeholder="Wpisz hasło"
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
						{{ isLoading ? 'Logowanie...' : 'Zaloguj się' }}
					</button>
				</form>

				<!-- Register Link -->
				<div class="mt-6 text-center">
					<p class="text-gray-600">
						Nie masz konta?
						<NuxtLink
							to="/register"
							class="text-blue-600 hover:text-blue-700 font-medium hover:underline"
						>
							Zarejestruj się
						</NuxtLink>
					</p>
				</div>
			</div>
		</div>
	</div>
</template>
