<template>
	<div class="min-h-screen bg-gray-50 py-8 px-4">
		<div class="max-w-6xl mx-auto">
			<div class="bg-white rounded-lg shadow-lg p-6 mb-6">
				<div class="flex items-center justify-between flex-wrap gap-4">
					<div>
						<h1 class="text-3xl font-bold text-gray-900 mb-2">Users</h1>
						<p class="text-gray-600">User List</p>
					</div>
					<NuxtLink
						to="/dashboard"
						class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
					>
						Back to Dashboard
					</NuxtLink>
				</div>
			</div>

			<div class="space-y-4">
				<div class="bg-white rounded-lg shadow-lg p-6">
					<div class="flex items-center justify-between flex-wrap gap-4">
						<div class="flex items-center gap-4">
							<div
								class="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg"
							>
								JD
							</div>

							<div>
								<h3 class="text-lg font-bold text-gray-900">Jan Kowalski</h3>
								<p class="text-gray-600">jan.kowalski@example.com</p>
								<p class="text-sm text-gray-500">
									Last activity: Jan 1, 2024, 10:30
								</p>
							</div>
						</div>

						<div class="flex items-center gap-3">
							<span
								class="px-3 py-1 text-sm font-medium rounded-full border bg-green-100 text-green-800 border-green-200"
							>
								<span class="inline-block w-2 h-2 rounded-full mr-2 bg-green-500" />
								Online
							</span>

							<NuxtLink
								to="/users/1"
								class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium rounded-lg transition-colors"
							>
								View Profile
							</NuxtLink>
						</div>
					</div>
				</div>

				<div class="bg-white rounded-lg shadow-lg p-6">
					<div class="flex items-center justify-between flex-wrap gap-4">
						<div class="flex items-center gap-4">
							<div
								class="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg"
							>
								AN
							</div>

							<div>
								<h3 class="text-lg font-bold text-gray-900">Anna Nowak</h3>
								<p class="text-gray-600">anna.nowak@example.com</p>
								<p class="text-sm text-gray-500">
									Last activity: Dec 31, 2023, 15:45
								</p>
							</div>
						</div>

						<div class="flex items-center gap-3">
							<span
								class="px-3 py-1 text-sm font-medium rounded-full border bg-gray-100 text-gray-800 border-gray-200"
							>
								<span class="inline-block w-2 h-2 rounded-full mr-2 bg-gray-500" />
								Offline
							</span>

							<NuxtLink
								to="/users/2"
								class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium rounded-lg transition-colors"
							>
								View Profile
							</NuxtLink>
						</div>
					</div>
				</div>
			</div>

			<div class="mt-6 bg-white rounded-lg shadow-lg p-6">
				<div class="flex items-center justify-between flex-wrap gap-4">
					<div class="text-gray-600">Page 1 of 1</div>

					<div class="flex gap-3">
						<button
							type="button"
							class="px-4 py-2 bg-gray-100 text-gray-400 font-medium rounded-lg cursor-not-allowed"
						>
							Previous
						</button>

						<button
							type="button"
							class="px-4 py-2 bg-gray-300 text-white font-medium rounded-lg cursor-not-allowed"
						>
							Next
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
