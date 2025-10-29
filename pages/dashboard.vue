<script setup lang="ts">
const { user, logout } = useAuth()

async function handleLogout() {
	await logout()
	await navigateTo('/login')
}

onMounted(() => {
	console.log(user.value)
})
</script>

<template>
	<div class="min-h-screen bg-gray-50 py-8 px-4">
		<div class="max-w-4xl mx-auto">
			<div class="bg-white rounded-lg shadow-lg p-6 mb-6">
				<div class="flex items-center justify-between flex-wrap gap-4">
					<div>
						<h1 class="text-3xl font-bold text-gray-900 mb-2">User Dashboard</h1>
						<p class="text-gray-600">Manage your profile and settings</p>
					</div>
					<div class="flex gap-3">
						<NuxtLink
							to="/users"
							class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
						>
							User List
						</NuxtLink>
						<button
							type="button"
							class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
							@click="handleLogout"
						>
							Logout
						</button>
					</div>
				</div>
			</div>

			<div class="bg-white rounded-lg shadow-lg p-6 mb-6">
				<h2 class="text-xl font-bold text-gray-900 mb-4">Account Information</h2>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<p class="text-sm text-gray-600">User ID</p>
						<p class="font-medium text-gray-900">123456</p>
					</div>
					<div>
						<p class="text-sm text-gray-600">Created Date</p>
						<p class="font-medium text-gray-900">January 1, 2024</p>
					</div>
					<div>
						<p class="text-sm text-gray-600">Last Activity</p>
						<p class="font-medium text-gray-900">January 5, 2024</p>
					</div>
				</div>
			</div>

			<div class="bg-white rounded-lg shadow-lg p-6 mb-6">
				<h2 class="text-xl font-bold text-gray-900 mb-4">Edit Profile</h2>
				<form class="space-y-4">
					<div>
						<label for="username" class="block text-sm font-medium text-gray-700 mb-2">
							Username
						</label>
						<input
							id="username"
							type="text"
							class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						/>
					</div>

					<div>
						<label for="email" class="block text-sm font-medium text-gray-700 mb-2">
							Email
						</label>
						<input
							id="email"
							type="email"
							class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						/>
					</div>

					<button
						type="submit"
						class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
					>
						Save Changes
					</button>
				</form>
			</div>

			<div class="bg-white rounded-lg shadow-lg p-6">
				<div class="flex items-center justify-between mb-4">
					<h2 class="text-xl font-bold text-gray-900">Change Password</h2>
					<button type="button" class="text-blue-600 hover:text-blue-700 font-medium">
						Change Password
					</button>
				</div>

				<form class="space-y-4">
					<div>
						<label
							for="current-password"
							class="block text-sm font-medium text-gray-700 mb-2"
						>
							Current Password
						</label>
						<input
							id="current-password"
							type="password"
							autocomplete="current-password"
							class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						/>
					</div>

					<div>
						<label
							for="new-password"
							class="block text-sm font-medium text-gray-700 mb-2"
						>
							New Password
						</label>
						<input
							id="new-password"
							type="password"
							autocomplete="new-password"
							class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						/>
					</div>

					<div>
						<label
							for="confirm-new-password"
							class="block text-sm font-medium text-gray-700 mb-2"
						>
							Confirm New Password
						</label>
						<input
							id="confirm-new-password"
							type="password"
							autocomplete="new-password"
							class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						/>
					</div>

					<button
						type="submit"
						class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
					>
						Change Password
					</button>
				</form>
			</div>
		</div>
	</div>
</template>
