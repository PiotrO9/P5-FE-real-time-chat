<script setup lang="ts">
const { login, loading, error } = useAuth()

const title = ref('Login')
const email = ref('')
const password = ref('')

async function handleSubmit(event: Event) {
	event.preventDefault()

	if (!email.value || !password.value) {
		return
	}

	try {
		await login(email.value, password.value)
		await navigateTo('/dashboard')
	} catch (err: any) {
		console.error('Login failed:', err)
	}
}
</script>

<template>
	<div class="min-h-screen flex items-center justify-center px-4 py-12">
		<div class="max-w-md w-full">
			<div class="bg-white rounded-lg shadow-lg p-8">
				<div class="text-center mb-8">
					<h1 class="text-3xl font-bold text-gray-900 mb-2">{{ title }}</h1>
					<p class="text-gray-600">Welcome back!</p>
				</div>

				<form class="space-y-6" @submit="handleSubmit">
					<div
						v-if="error"
						class="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
					>
						{{ error }}
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
						<label for="password" class="block text-sm font-medium text-gray-700 mb-2">
							Password
						</label>
						<input
							id="password"
							v-model="password"
							type="password"
							autocomplete="current-password"
							required
							class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							placeholder="Enter your password"
						/>
					</div>

					<button
						type="submit"
						:disabled="loading"
						class="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{{ loading ? 'Logging in...' : 'Login' }}
					</button>
				</form>

				<div class="mt-6 text-center">
					<p class="text-gray-600">
						Don't have an account?
						<NuxtLink
							to="/register"
							class="text-blue-600 hover:text-blue-700 font-medium hover:underline"
						>
							Register
						</NuxtLink>
					</p>
				</div>
			</div>
		</div>
	</div>
</template>
