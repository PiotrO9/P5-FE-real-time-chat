<template>
	<div class="min-h-screen flex items-center justify-center px-4 py-12">
		<div class="max-w-md w-full">
			<div class="bg-white rounded-lg shadow-lg p-8">
				<div class="text-center mb-8">
					<h1 class="text-3xl font-bold text-gray-900 mb-2">Logowanie</h1>
					<p class="text-gray-600">Witaj ponownie!</p>
				</div>

				<form class="space-y-6">
					<!-- Email -->
					<div>
						<label for="email" class="block text-sm font-medium text-gray-700 mb-2">
							Email
						</label>
						<input
							id="email"
							type="email"
							autocomplete="email"
							class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							placeholder="twoj@email.com"
						/>
					</div>

					<!-- Password -->
					<div>
						<label for="password" class="block text-sm font-medium text-gray-700 mb-2">
							Hasło
						</label>
						<input
							id="password"
							type="password"
							autocomplete="current-password"
							class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							placeholder="Wpisz hasło"
						/>
					</div>

					<!-- Submit Button -->
					<button
						type="submit"
						class="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
					>
						Zaloguj się
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
