<script setup lang="ts">
const email = ref('')
const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const { register, loading, error } = useAuth()
const localError = ref<string | null>(null)

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

function getDisplayError(): string | null {
	return localError.value || error.value
}
</script>

<template>
	<div class="min-h-screen flex items-center justify-center px-4 py-12">
		<div class="max-w-md w-full">
			<div class="bg-white rounded-lg shadow-lg p-8">
				<div class="text-center mb-8">
					<h1 class="text-3xl font-bold text-gray-900 mb-2">Register</h1>
					<p class="text-gray-600">Create a new account</p>
				</div>

				<form class="space-y-6" @submit="handleSubmit">
					<div
						v-if="getDisplayError()"
						class="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
					>
						{{ getDisplayError() }}
					</div>

					<div>
						<label for="email" class="block text-sm font-medium text-gray-700 mb-2">
							Email
						</label>
						<input
							id="email"
							v-model="email"
							type="email"
							autocomplete="email"
							required
							class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							placeholder="your@email.com"
						/>
					</div>

					<div>
						<label for="username" class="block text-sm font-medium text-gray-700 mb-2">
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
							class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							placeholder="3-30 characters"
						/>
					</div>

					<div>
						<label for="password" class="block text-sm font-medium text-gray-700 mb-2">
							Password
						</label>
						<input
							id="password"
							v-model="password"
							type="password"
							autocomplete="new-password"
							required
							minlength="6"
							class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							placeholder="6-100 characters"
						/>
					</div>

					<div>
						<label
							for="confirm-password"
							class="block text-sm font-medium text-gray-700 mb-2"
						>
							Confirm Password
						</label>
						<input
							id="confirm-password"
							v-model="confirmPassword"
							type="password"
							autocomplete="new-password"
							required
							class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							placeholder="Repeat password"
						/>
					</div>

					<button
						type="submit"
						:disabled="loading"
						class="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{{ loading ? 'Registering...' : 'Register' }}
					</button>
				</form>

				<div class="mt-6 text-center">
					<p class="text-gray-600">
						Already have an account?
						<NuxtLink
							to="/login"
							class="text-blue-600 hover:text-blue-700 font-medium hover:underline"
						>
							Login
						</NuxtLink>
					</p>
				</div>
			</div>
		</div>
	</div>
</template>
