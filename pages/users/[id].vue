<template>
	<div class="min-h-screen bg-gray-50 py-8 px-4">
		<div class="max-w-4xl mx-auto">
			<div class="mb-6">
				<NuxtLink
					to="/users"
					class="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 mb-4"
				>
					<svg class="size-5" fill="currentColor" viewBox="0 0 20 20">
						<path
							fill-rule="evenodd"
							d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
							clip-rule="evenodd"
						/>
					</svg>
					Back to user list
				</NuxtLink>
			</div>

			<div class="space-y-6">
				<div class="bg-white rounded-lg shadow-lg p-8">
					<div class="flex flex-col items-center text-center">
						<div
							class="size-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-3xl mb-4"
						>
							JK
						</div>

						<div class="mb-2">
							<h1 class="text-3xl font-bold text-gray-900 mb-2">Jan Kowalski</h1>
							<span
								class="px-4 py-2 text-sm font-medium rounded-full border inline-flex items-center bg-green-100 text-green-800 border-green-200"
							>
								<span class="inline-block size-2 rounded-full mr-2 bg-green-500" />
								Online
							</span>
						</div>

						<p class="text-gray-600 mt-4 text-lg">jan.kowalski@example.com</p>

						<NuxtLink
							to="/dashboard"
							class="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
						>
							Edit Profile
						</NuxtLink>
					</div>
				</div>

				<div class="bg-white rounded-lg shadow-lg p-6">
					<h2 class="text-xl font-bold text-gray-900 mb-4">Profile Details</h2>
					<div class="space-y-4">
						<div
							class="flex justify-between items-center py-3 border-b border-gray-200"
						>
							<span class="text-gray-600 font-medium">User ID</span>
							<span class="text-gray-900 font-mono text-sm">123456</span>
						</div>

						<div
							class="flex justify-between items-center py-3 border-b border-gray-200"
						>
							<span class="text-gray-600 font-medium">Email</span>
							<span class="text-gray-900">jan.kowalski@example.com</span>
						</div>

						<div
							class="flex justify-between items-center py-3 border-b border-gray-200"
						>
							<span class="text-gray-600 font-medium">Username</span>
							<span class="text-gray-900">Jan Kowalski</span>
						</div>

						<div
							class="flex justify-between items-center py-3 border-b border-gray-200"
						>
							<span class="text-gray-600 font-medium">Status</span>
							<span class="font-medium text-green-600">Online</span>
						</div>

						<div
							class="flex justify-between items-center py-3 border-b border-gray-200"
						>
							<span class="text-gray-600 font-medium">Created Date</span>
							<span class="text-gray-900">January 1, 2024, 10:00</span>
						</div>

						<div class="flex justify-between items-center py-3">
							<span class="text-gray-600 font-medium">Last Activity</span>
							<span class="text-gray-900">January 5, 2024, 15:30</span>
						</div>
					</div>
				</div>

				<div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg shadow-lg p-6">
					<div class="flex items-start gap-4">
						<div class="flex-shrink-0">
							<svg
								class="size-8 text-blue-600"
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
							<h3 class="font-bold text-gray-900 mb-1">Activity Information</h3>
							<p class="text-gray-700">
								User Jan Kowalski is currently online. Last activity: January 5,
								2024, 15:30.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
