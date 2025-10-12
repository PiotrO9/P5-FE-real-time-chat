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
						>
							Wyloguj
						</button>
					</div>
				</div>
			</div>

			<!-- User Info -->
			<div class="bg-white rounded-lg shadow-lg p-6 mb-6">
				<h2 class="text-xl font-bold text-gray-900 mb-4">Informacje o koncie</h2>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<p class="text-sm text-gray-600">ID użytkownika</p>
						<p class="font-medium text-gray-900">123456</p>
					</div>
					<div>
						<p class="text-sm text-gray-600">Data utworzenia</p>
						<p class="font-medium text-gray-900">1 stycznia 2024</p>
					</div>
					<div>
						<p class="text-sm text-gray-600">Ostatnia aktywność</p>
						<p class="font-medium text-gray-900">5 stycznia 2024</p>
					</div>
				</div>
			</div>

			<!-- Edit Profile -->
			<div class="bg-white rounded-lg shadow-lg p-6 mb-6">
				<h2 class="text-xl font-bold text-gray-900 mb-4">Edytuj profil</h2>
				<form class="space-y-4">
					<!-- Username -->
					<div>
						<label for="username" class="block text-sm font-medium text-gray-700 mb-2">
							Nazwa użytkownika
						</label>
						<input
							id="username"
							type="text"
							class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						/>
					</div>

					<!-- Email -->
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
						Zapisz zmiany
					</button>
				</form>
			</div>

			<!-- Change Password -->
			<div class="bg-white rounded-lg shadow-lg p-6">
				<div class="flex items-center justify-between mb-4">
					<h2 class="text-xl font-bold text-gray-900">Zmiana hasła</h2>
					<button type="button" class="text-blue-600 hover:text-blue-700 font-medium">
						Zmień hasło
					</button>
				</div>

				<form class="space-y-4">
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
							type="password"
							autocomplete="current-password"
							class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						/>
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
							type="password"
							autocomplete="new-password"
							class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						/>
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
							type="password"
							autocomplete="new-password"
							class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						/>
					</div>

					<button
						type="submit"
						class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
					>
						Zmień hasło
					</button>
				</form>
			</div>
		</div>
	</div>
</template>
