<script setup lang="ts">
const { register, loading, error } = useAuth()

const email = ref('')
const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const localError = ref<string | null>(null)

function getDisplayError(): string | null {
	return localError.value || error.value
}

async function handleSubmit(event: Event) {
	event.preventDefault()
	localError.value = null

	if (!email.value || !username.value || !password.value || !confirmPassword.value) {
		return
	}

	if (password.value !== confirmPassword.value) {
		localError.value = 'Passwords do not match'
		return
	}

	if (password.value.length < 6) {
		localError.value = 'Password must be at least 6 characters'
		return
	}

	try {
		await register(email.value, password.value)
		await navigateTo('/dashboard')
	} catch (err) {
		console.error('Registration failed:', err)
	}
}
</script>

<template>
	<div
		class="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50 dark:bg-gray-900"
	>
		<div class="max-w-md w-full">
			<div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
				<div class="text-center mb-8">
					<h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
						Register
					</h1>
					<p class="text-gray-600 dark:text-gray-400">Create a new account</p>
				</div>

				<form class="space-y-6" @submit="handleSubmit">
					<div
						v-if="getDisplayError()"
						class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm"
					>
						{{ getDisplayError() }}
					</div>

					<div>
						<label
							for="email"
							class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
						>
							Email
						</label>
						<input
							id="email"
							v-model="email"
							type="email"
							autocomplete="email"
							required
							placeholder="your@email.com"
							class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						/>
					</div>

					<div>
						<label
							for="username"
							class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
						>
							Username
						</label>
						<input
							id="username"
							v-model="username"
							type="text"
							autocomplete="username"
							required
							minlength="3"
							maxlength="30"
							placeholder="3-30 characters"
							class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						/>
					</div>

					<div>
						<label
							for="password"
							class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
						>
							Password
						</label>
						<input
							id="password"
							v-model="password"
							type="password"
							autocomplete="new-password"
							required
							minlength="6"
							placeholder="6-100 characters"
							class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						/>
					</div>

					<div>
						<label
							for="confirm-password"
							class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
						>
							Confirm Password
						</label>
						<input
							id="confirm-password"
							v-model="confirmPassword"
							type="password"
							autocomplete="new-password"
							required
							placeholder="Repeat password"
							class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						/>
					</div>

					<button
						type="submit"
						:disabled="loading"
						class="w-full py-3 px-4 bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-800 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{{ loading ? 'Registering...' : 'Register' }}
					</button>
				</form>

				<div class="mt-6 text-center">
					<p class="text-gray-600 dark:text-gray-400">
						Already have an account?
						<NuxtLink
							to="/login"
							class="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-500 font-medium hover:underline"
						>
							Login
						</NuxtLink>
					</p>
				</div>
			</div>
		</div>
	</div>
</template>
